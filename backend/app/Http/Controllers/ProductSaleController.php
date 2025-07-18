<?php

namespace App\Http\Controllers;

use App\Exports\ProductSaleExport;
use App\Http\Requests\StoreProductSaleRequest;
use App\Http\Requests\UpdateProductSaleRequest;
use App\Imports\ProductSaleImport;
use App\Models\ProductSale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Validator;

class ProductSaleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 10);
        $query = ProductSale::with(['product']);

        // lọc theo mã  
        if ($request->has('product_id')) {
            $query->where('product_id', $request->input('product_id'));
        }
        //lọc theo giá
        if ($request->has('sale_price')) {
            $query->where('sale_price', $request->input('sale_price'));
        }

        // Lọc theo tên sản phẩm
        if ($request->has('name')) {
            $name = $request->input('name');
            $query->whereHas('product', function ($q) use ($name) {
                $q->where('product_name', 'LIKE', '%' . $name . '%');
            });
        }

        $productSales = $query->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => $productSales->items(),
            'meta' => [
                'current_page' => $productSales->currentPage(),
                'last_page' => $productSales->lastPage(),
                'per_page' => $productSales->perPage(),
                'total' => $productSales->total(),
            ],
        ], 200);
    }

    public function store(StoreProductSaleRequest $request): JsonResponse
    {
        $validatedData = $request->validated();

        $validatedData['created_by'] =  Auth::id();
        $validatedData['updated_by'] =  Auth::id();

        $productSale = ProductSale::create($validatedData);

        return response()->json([
            'status' => 'success',
            'data' => $productSale->load(['product']),
            'message' => 'Thêm thành công',
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $productSale = ProductSale::with(['product'])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $productSale,
        ], 200);
    }
    public function update(UpdateProductSaleRequest $request, string $id): JsonResponse
    {
        $productSale = ProductSale::findOrFail($id);

        $validatedData = $request->validated();

        $validatedData['updated_by'] = Auth::id();

        $productSale->update($validatedData);

        return response()->json([
            'status' => 'success',
            'data' => $productSale->load(['product']),
            'message' => 'Cập nhật thành công',
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $productSale = ProductSale::findOrFail($id);
        $productSale->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'xóa thành công',
        ], 200);
    }


    // API xuất Excel
    public function export()
    {
        Log::info('Export endpoint called');
        try {
            return Excel::download(new ProductSaleExport, 'product_sale.xlsx');
        } catch (\Exception $e) {
            Log::error('Export error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Không có dữ liệu để xuất hoặc xảy ra lỗi: ' . $e->getMessage(),
            ], 404);
        }
    }
    // API nhập Excel
    public function import(Request $request)
    {
        // Xác thực file upload
        $validator = Validator::make($request->all(), [
            'file' => 'required|mimes:xlsx,xls',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            Excel::import(new ProductSaleImport, $request->file('file'));
            return response()->json([
                'success' => true,
                'message' => 'Nhập dữ liệu từ Excel thành công!',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi nhập dữ liệu: ' . $e->getMessage(),
            ], 500);
        }
    }
}
