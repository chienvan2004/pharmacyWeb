<?php

namespace App\Http\Controllers;

use App\Exports\CategoryExport;
use App\Http\Requests\CategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Imports\CategoryImport;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;


class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page'); 
        $categories = Category::with('parent')->paginate($perPage);

        $data = $categories->items();
        $formattedData = collect($data)->map(function ($category) {
            return [
                'id' => $category->id,
                'category_name' => $category->category_name,
                'slug' => $category->slug,
                'description' => $category->description,
                'icon' => $category->icon,
                'active' => $category->active,
                'parent_category' => $category->parent ? [
                    'id' => $category->parent->id,
                    'category_name' => $category->parent->category_name,
                ] : null,
                'created_at' => $category->created_at,
                'updated_at' => $category->updated_at,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $formattedData,
            'meta' => [
                'current_page' => $categories->currentPage(),
                'last_page' => $categories->lastPage(),
                'per_page' => $categories->perPage(),
                'total' => $categories->total(),
            ]
        ], 200);
    }


    public function store(CategoryRequest $request)
    {
        try {
            // Tạo category mới
            $data = $request->validated();

            // Nếu có icon, xử lý lưu ảnh
            if ($request->hasFile('icon')) {
                $iconPath = $request->file('icon')->store('category', 'public');
                $data['icon'] = 'storage/' . $iconPath;
            }

            // Tạo category mới và gán creator/updater là user hiện tại
            $data['created_by'] = Auth::id();
            $data['updated_by'] = Auth::id();

            $category = Category::create($data);

            return response()->json([
                'status' => 'success',
                'message' => 'Danh mục được tạo thành công.',
                'data' => $category
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra khi tạo danh mục: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            // Tải danh mục cùng với parent và tất cả children (đệ quy)
            $category = Category::with(['parent', 'children'])->findOrFail($id);

            // Lấy danh sách tất cả ID của danh mục con
            $childrenIds = Category::getAllChildrenIds($category);

            // Lấy thông tin chi tiết của tất cả danh mục con
            $childrenCategories = Category::whereIn('id', $childrenIds)
                ->where('id', '!=', $category->id) // Loại trừ danh mục hiện tại
                ->get()
                ->map(function ($child) {
                    return [
                        'id' => $child->id,
                        'category_name' => $child->category_name,
                        'slug' => $child->slug,
                        'icon' => $child->icon,
                    ];
                });

            $data = [
                'id' => $category->id,
                'category_name' => $category->category_name,
                'slug' => $category->slug,
                'description' => $category->description,
                'icon' => $category->icon,
                'parent_category' => $category->parent ? [
                    'id' => $category->parent->id,
                    'category_name' => $category->parent->category_name,
                    'slug' => $category->parent->slug,
                    'icon' => $category->parent->icon,
                ] : null,
                'children_categories' => $childrenCategories, // Thêm danh sách danh mục con
                'created_at' => $category->created_at,
                'updated_at' => $category->updated_at,
            ];

            return response()->json([
                'status' => 'success',
                'message' => 'Chi tiết danh mục và danh mục con.',
                'data' => $data,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không tìm thấy danh mục: ' . $e->getMessage(),
            ], 404);
        }
    }




    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoryRequest $request, $id)
    {
        try {
            $category = Category::findOrFail($id);

            $data = $request->validated();

            if ($request->hasFile('icon')) {
                // Kiểm tra tệp có hợp lệ không
                if ($request->file('icon')->isValid()) {
                    // Xóa icon cũ nếu có
                    if ($category->icon && Storage::disk('public')->exists(Str::replaceFirst('storage/', '', $category->icon))) {
                        Storage::disk('public')->delete(Str::replaceFirst('storage/', '', $category->icon));
                    }

                    // Lưu icon mới
                    $iconPath = $request->file('icon')->store('category', 'public');
                    $data['icon'] = 'storage/' . $iconPath;
                }
            } else {
                // Nếu không có tệp mới, giữ lại hình cũ
                $data['icon'] = $category->icon;  // Giữ lại icon cũ
            }

            $data['updated_by'] = Auth::id();

            $category->update($data);

            return response()->json([
                'status' => 'success',
                'message' => 'Danh mục đã được cập nhật thành công.',
                'data' => $category
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra khi cập nhật danh mục: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        // Tìm danh mục theo ID
        $category = Category::find($id);

        // Kiểm tra nếu không tìm thấy danh mục
        if (!$category) {
            return response()->json(['status' => 'error', 'message' => 'Danh mục không tồn tại'], 404);
        }

        // Kiểm tra nếu danh mục có danh mục con
        if ($category->children()->count() > 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không thể xóa vì danh mục này có danh mục con.'
            ], 400);
        }

        // Kiểm tra nếu danh mục có sản phẩm liên kết
        if ($category->products()->count() > 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không thể xóa vì danh mục này đang chứa sản phẩm.'
            ], 400);
        }

        // Thực hiện xóa
        $category->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Danh mục đã được xóa thành công.'
        ], 200);
    }

    public function export()
    {
        return Excel::download(new CategoryExport, 'Category.xlsx');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,csv'
        ]);

        Excel::import(new CategoryImport, $request->file('file'));

        return response()->json([
            'status' => 'success',
            'message' => 'Nhập thương hiệu thành công.'
        ]);
    }



    public function getCategoryParent(Request $request)
    {
        $categories = Category::with('parent')->whereNull('parent_id') 
            ->get();

        $formattedData = $categories->map(function ($category) {
            return [
                'id' => $category->id,
                'category_name' => $category->category_name,
                'slug' => $category->slug,
                'description' => $category->description,
                'icon' => $category->icon,
                'active' => $category->active,
                'parent_category' => $category->parent ? [
                    'id' => $category->parent->id,
                    'category_name' => $category->parent->category_name,
                ] : null,
                'created_at' => $category->created_at,
                'updated_at' => $category->updated_at,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $formattedData,
        ], 200);
    }
}
