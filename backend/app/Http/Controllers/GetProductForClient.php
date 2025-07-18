<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\Tag;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GetProductForClient extends Controller
{
    // LẤY SẢN PHẨM THEO DANH MỤC
    public function getByCategory(Request $request, $id)
    {
        $sortBy = $request->query('sort_by', 'buying_price');
        $order = $request->query('order', 'asc');
        $perPage = $request->query('per_page', 10);

        // Lấy danh mục theo id
        $category = Category::with('children')->where('id', $id)->firstOrFail();
        $categoryIds = Category::getAllChildrenIds($category);

        // Khởi tạo query với các quan hệ
        $query = Product::with([
            'images',
            'categories',
            'brands',
            'tags',
            'productSale' => function ($query) {
                $query->where('sale_end_date', '>=', Carbon::now());
            },
            'unit'
        ])
            ->whereHas('productStore')
            ->whereHas('categories', function ($query) use ($categoryIds) {
                $query->whereIn('categories.id', $categoryIds);
            });

        // Lọc theo giá (buying_price)
        if ($request->has('min_price')) {
            $query->where('buying_price', '>=', $request->input('min_price'));
        }
        if ($request->has('max_price')) {
            $query->where('buying_price', '<=', $request->input('max_price'));
        }

        // Lọc theo thương hiệu (brands)
        if ($request->has('brands')) {
            $brands = $request->input('brands');
            if (!is_array($brands)) {
                $brands = explode(',', $brands);
            }

            $query->whereHas('brands', function ($q) use ($brands) {
                $q->whereIn('brands.id', $brands); // CHỈ RÕ TÊN BẢNG
            });
        }


        // Thực hiện phân trang
        $products = $query->orderBy($sortBy, $order)->paginate($perPage);

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

    //LẤY SẢN PHẨM THEO THƯƠNG HIỆU
    public function getByBrand(Request $request, $id)
    {
        $sortBy = $request->query('sort_by', 'buying_price');
        $order = $request->query('order', 'asc');
        $perPage = $request->query('per_page', 10);

        // Lấy thương hiệu theo id
        $brand = Brand::where('id', $id)->firstOrFail();

        $products = Product::with([
            'images',
            'productStore',
            'productSale' => function ($query) {
                $query->where('sale_end_date', '>=', Carbon::now());
            }
        ])
            ->whereHas('productStore')
            ->whereHas('brands', function ($query) use ($brand) {
                $query->where('brands.id', $brand->id);
            })
            ->orderBy($sortBy, $order)
            ->paginate($perPage);

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


    //LẤY SẢN PHẨM THEO TAG
    public function getByTag(Request $request, $id)
    {

        $tag = Tag::where('id', $id)->firstOrFail();

        $products = Product::with([
            'images',
            'categories',
            'brands',
            'tags',
            'productSale' => function ($query) {
                $query->where('sale_end_date', '>=', Carbon::now());
            },
            'unit'
        ])
            ->whereHas('productStore')
            ->whereHas('tags', function ($query) use ($tag) {
                $query->where('tags.id', $tag->id);
            })
            ->paginate(20);

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

    //LẤY SẢN PHẨM CÙNG THƯƠNG HIỆU VÀ DANH MỤC
    public function getByCategoryAndBrand(Request $request, $categoryId, $brandId, $excludeProductId = null)
    {
        $sortBy = $request->query('sort_by', 'buying_price');
        $order = $request->query('order', 'asc');
        $perPage = $request->query('per_page', 10);

        // Lấy danh mục theo ID
        $category = Category::with('children')->findOrFail($categoryId);
        $categoryIds = Category::getAllChildrenIds($category);

        // Lấy thương hiệu theo ID
        $brand = Brand::findOrFail($brandId);

        $query = Product::with([
            'images',
            'categories',
            'brands',
            'tags',
            'productSale' => function ($query) {
                $query->where('sale_end_date', '>=', Carbon::now());
            },
            'unit'
        ])
            ->whereHas('productStore')
            ->whereHas('categories', function ($query) use ($categoryIds) {
                $query->whereIn('categories.id', $categoryIds);
            })
            ->whereHas('brands', function ($query) use ($brand) {
                $query->where('brands.id', $brand->id);
            });

        // Loại trừ sản phẩm hiện tại nếu excludeProductId được cung cấp
        if ($excludeProductId) {
            $query->where('id', '!=', $excludeProductId);
        }

        $products = $query->orderBy($sortBy, $order)
            ->paginate($perPage);

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


    //LẤY SẢN PHẨM ĐANG GIẢM GIÁ
    public function getSaleProduct(Request $request)
    {
        $products = Product::with([
            'images',
            'categories',
            'brands',
            'tags',
            'productSale',
            'unit'
        ])
            ->whereHas('productStore')
            ->whereHas('productSale', function ($query) {
                $query->where('sale_end_date', '>=', Carbon::now());
            })
            ->paginate(10);

        return response()->json([
            'status' => 'success',
            'data' => $products->items(),
        ], 200);
    }



    public function getBestSellerProduct(Request $request)
    {
        $products = Product::with([
            'brands',
            'images',
            'categories',
            'tags',
            'productSale' => function ($query) {
                $query->where('sale_end_date', '>=', Carbon::now())
                    ->where('sale_start_date', '<=', Carbon::now());
            },
            'unit'
        ])
            ->whereHas('productStore')
            ->whereHas('orderItems')
            ->withCount(['orderItems as sales_count']) 
            ->orderByDesc('sales_count')
            ->take(10) // Lấy 10 sản phẩm đầu tiên
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $products,
        ], 200);
    }


    public function searchByName(Request $request)
    {
        // Validate request parameters
        $request->validate([
            'search' => 'nullable|string|max:255',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        // Build query
        $query = Product::query()
            ->select('id', 'product_name', 'slug', 'buying_price', 'short_description', 'active')
            ->when($request->filled('search'), function ($q) use ($request) {
                $searchTerm = $request->input('search');
                $q->where('product_name', 'like', '%' . $searchTerm . '%');
            })
            ->orderBy('product_name', 'asc');

        // Apply pagination
        $perPage = $request->input('per_page', 15);
        $products = $query->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'last_page' => $products->lastPage(),
            ]
        ]);
    }
}
