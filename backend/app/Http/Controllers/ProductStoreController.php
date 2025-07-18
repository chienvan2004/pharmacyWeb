<?php

namespace App\Http\Controllers;

use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ProductStoresExport;
use App\Http\Requests\ProductStoreRequest;
use App\Http\Requests\UpdateProductStoreRequest;
use App\Imports\ProductStoresImport;
use App\Models\OrderItem;
use App\Models\ProductStore;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ProductStoreController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $query=ProductStore::with('product');
        // Lọc theo ID (mã sản phẩm)
        if ($request->has('product_id')) {
            $query->where('product_id', $request->input('product_id'));
        }

        // Lọc theo tên sản phẩm
        if ($request->has('name')) {
            $name = $request->input('name');
            $query->whereHas('product', function ($q) use ($name) {
                $q->where('product_name', 'LIKE', '%' . $name . '%');
            });
        }

    

        $productStore= $query->paginate($perPage);
        return response()->json([
            'status' => 'success',
            'data' => $productStore->items(),
            'meta' => [
                'current_page' => $productStore->currentPage(),
                'last_page' => $productStore->lastPage(),
                'per_page' => $productStore->perPage(),
                'total' => $productStore->total(),
            ]
        ], 200);
    }

    public function store(ProductStoreRequest $request)
    {
        try {
            // Validate request
            $data = $request->validated();

            // Add the current authenticated user to 'created_by' and 'updated_by'
            $data['created_by'] = Auth::id();
            $data['updated_by'] = Auth::id();

            // Create the product store record
            $productStore = ProductStore::create($data);

            return response()->json([
                'status' => 'success',
                'message' => 'Sản phẩm được nhập kho thành công.',
                'data' => $productStore
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    

    

    /**
     * Update the specified resource in storage.
     */
    public function update(ProductStoreRequest $request, $id)
    {
        try {
            $productStore = ProductStore::findOrFail($id);
            $data = $request->validated();

            $data['updated_by'] = Auth::id();

            $productStore->update($data);

            return response()->json([
                'status' => 'success',
                'message' => 'kho hàng đã được cập nhật.',
                'data' => $productStore
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi cập nhật kho hàng: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $productStore = ProductStore::findOrFail($id);
            $productStore->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Xóa thành công.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi xóa' . $e->getMessage()
            ], 500);
        }
    }


    public function export()
    {
        return Excel::download(new ProductStoresExport, 'product_stores.xlsx');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv'
        ]);

        Excel::import(new ProductStoresImport, $request->file('file'));

        return response()->json([
            'status' => 'success',
            'message' => 'Import thành công.'
        ]);
    }



    //DANH SÁCH SẢN PHẨM CÒN DƯỚI 10 SẢN PHẨM 
    public function getLowStockProducts()
    {
        // Bắt đầu giao dịch để đảm bảo tính nhất quán
        DB::beginTransaction();

        try {
            // Lấy danh sách sản phẩm có quantity <= 10, join với bảng products
            $products = ProductStore::select(
                'product_stores.product_id',
                'products.product_name', // Sử dụng product_name thay vì name
                'product_stores.root_price',
                DB::raw('SUM(product_stores.quantity) as total_quantity')
            )
                ->join('products', 'products.id', '=', 'product_stores.product_id')
                ->groupBy('product_stores.product_id', 'products.product_name', 'product_stores.root_price')
                ->having('total_quantity', '<=', 10)
                ->orderBy('total_quantity', 'asc')
                ->get();

            // Commit giao dịch
            DB::commit();

            return response()->json([
                'message' => 'Low stock products retrieved successfully',
                'data' => $products,
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to retrieve low stock products: ' . $e->getMessage(),
            ], 400);
        }
    }

    public function getOrderItemStatistics(Request $request)
    {
        try {
            $startDate = $request->input('start_date', '1970-01-01');
            $endDate = $request->input('end_date', now()->format('Y-m-d'));

            $startDate = Carbon::parse($startDate)->startOfDay()->timezone('UTC')->toIso8601String();
            $endDate = Carbon::parse($endDate)->endOfDay()->timezone('UTC')->toIso8601String();

            $query = OrderItem::select(
                'order_items.product_id',
                'products.product_name',
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                DB::raw('SUM(order_items.price * order_items.quantity) as total_amount')
            )
                ->join('products', 'products.id', '=', 'order_items.product_id')
                ->groupBy('order_items.product_id', 'products.product_name');

            // Lọc theo thời gian nếu có tham số start_date và end_date
            if ($startDate && $endDate) {
                $query->whereBetween('order_items.created_at', [$startDate, $endDate]);
            } elseif ($startDate) {
                $query->where('order_items.created_at', '>=', $startDate);
            } elseif ($endDate) {
                $query->where('order_items.created_at', '<=', $endDate);
            }

            $statistics = $query
                ->orderByDesc('total_quantity')
                ->limit(5)
                ->get();

            return response()->json([
                'message' => 'Order item statistics retrieved successfully',
                'data' => $statistics,
                'filters' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve order item statistics: ' . $e->getMessage(),
            ], 400);
        }
    }
}
