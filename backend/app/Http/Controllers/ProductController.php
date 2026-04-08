<?php

namespace App\Http\Controllers;

use App\Exports\ProductsExport;
use App\Http\Requests\ProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Imports\ProductsImport;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Storage;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);

        // Khởi tạo query với các quan hệ
        $query = Product::with('images', 'categories', 'brands', 'tags', 'coupons');

        // Lọc theo ID (mã sản phẩm)
        if ($request->has('id')) {
            $query->where('id', $request->input('id'));
        }

        // Lọc theo tên sản phẩm
        if ($request->has('name')) {
            $query->where('product_name', 'LIKE', '%' . $request->input('name') . '%');
        }

        // Lọc theo giá (buying_price)
        if ($request->has('min_price')) {
            $query->where('buying_price', '>=', $request->input('min_price'));
        }
        if ($request->has('max_price')) {
            $query->where('buying_price', '<=', $request->input('max_price'));
        }

        // Lọc theo danh mục (categories)
        if ($request->has('categories')) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->whereIn('category_name', $request->input('categories'));
            });
        }

        // Lọc theo thương hiệu (brands)
        if ($request->has('brands')) {
            $query->whereHas('brands', function ($q) use ($request) {
                $q->whereIn('brand_name', $request->input('brands'));
            });
        }

        // Thực hiện phân trang
        $products = $query->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ]
        ], 200);
    }

    public function store(ProductRequest $request)
    {
        DB::beginTransaction();

        try {
            $data = $request->validated();
            $data['created_by'] = Auth::id();
            $data['updated_by'] = Auth::id();

            // Tạo sản phẩm
            $product = Product::create($data);

            // Gắn danh mục
            $product->categories()->sync($data['categories']);

            // Gắn thương hiệu
            $product->brands()->sync($data['brands']);

            //Gắn tags
            if (!empty($data['tags'])) {
                $product->tags()->sync($data['tags']);
            }


            // Lưu hình ảnh
            // if ($request->hasFile('images')) {
            //     foreach ($request->file('images') as $index => $image) {
            //         $path = $image->store('product', 'public');

            //         $product->images()->create([
            //             'image' => 'storage/' . $path,
            //             'is_main' => $request->input('is_main') == $index ? true : false,
            //         ]);
            //     }
            // }
            if ($request->hasFile('images')) {
                // Nếu ảnh mới được đánh dấu là ảnh chính, hãy bỏ đánh dấu ảnh chính cũ (chỉ dùng cho Update)
                if ($request->has('is_main')) {
                    $product->images()->update(['is_main' => false]);
                }

                foreach ($request->file('images') as $index => $image) {
                    $uploaded = Cloudinary::upload($image->getRealPath(), [
                        'folder' => 'product'
                    ]);

                    $product->images()->create([
                        'image' => $uploaded->getSecurePath(),
                        // Ép kiểu về int để so sánh chính xác hơn
                        'is_main' => (int)$request->input('is_main') === $index,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Sản phẩm được tạo thành công.',
                'data' => $product->load('images', 'categories', 'brands')
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $product = Product::with('images', 'categories', 'brands', 'tags', 'productStore', 'coupons', 'productSale', 'unit')->findOrFail($id);

            // Tính tổng số lượng tồn kho
            $totalQuantity = $product->productStore ? $product->productStore->quantity : 0;

            // Chuyển $product thành mảng và thêm total_quantity
            $productArray = $product->toArray();
            $productArray['total_quantity'] = $totalQuantity;

            return response()->json([
                'status' => 'success',
                'message' => 'Chi tiết sản phẩm.',
                'data' => $productArray
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không tìm thấy sản phẩm: ' . $e->getMessage()
            ], 404);
        }
    }


    public function update(UpdateProductRequest $request, $id)
    {
        DB::beginTransaction();

        try {
            $product = Product::findOrFail($id);
            $data = $request->validated();
            $data['updated_by'] = Auth::id();

            // Cập nhật sản phẩm
            $product->update($data);

            if ($request->has('categories') && is_array($request->categories)) {
                $product->categories()->sync($data['categories']);
            }

            if ($request->has('brands') && is_array($request->brands)) {
                $product->brands()->sync($data['brands']);
            }

            if ($request->has('tags') && is_array($request->tags)) {
                $product->tags()->sync($data['tags']);
            }

            // Nếu yêu cầu xóa ảnh cũ
            if ($request->has('deleted_images') && is_array($request->deleted_images)) {
                foreach ($request->deleted_images as $imageId) {
                    $image = $product->images()->find($imageId);
                    if ($image) {
                        if (Storage::disk('public')->exists(str_replace('storage/', '', $image->image))) {
                            Storage::disk('public')->delete(str_replace('storage/', '', $image->image));
                        }
                        $image->delete();
                    }
                }
            }

            // Reset tất cả is_main về false
            $product->images()->update(['is_main' => false]);

            // Nếu có hình ảnh chính hiện có
            if ($request->has('existing_main_image_id')) {
                $mainImage = $product->images()->find($request->input('existing_main_image_id'));
                if ($mainImage) {
                    $mainImage->update(['is_main' => true]);
                }
            }

            // Nếu có hình ảnh mới
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $index => $image) {
                    $path = $image->store('product', 'public');
                    $product->images()->create([
                        'image' => 'storage/' . $path,
                        'is_main' => !$request->has('existing_main_image_id') && (int) $request->input('is_main') === $index,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Sản phẩm đã được cập nhật.',
                'data' => $product->load('images', 'categories', 'brands')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi cập nhật sản phẩm: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $product = Product::findOrFail($id);
            $product->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Sản phẩm đã được xóa.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi xóa sản phẩm: ' . $e->getMessage()
            ], 500);
        }
    }


    public function export()
    {
        return Excel::download(new ProductsExport, 'product.xlsx');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,csv'
        ]);

        Excel::import(new ProductsImport, $request->file('file'));

        return response()->json([
            'status' => 'success',
            'message' => 'Nhập sản phẩm thành công.'
        ]);
    }
}
