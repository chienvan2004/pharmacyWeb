<?php

namespace App\Http\Controllers;

use App\Exports\BrandExport;
use App\Http\Requests\BrandRequest;
use App\Http\Requests\UpdateBrandRequest;
use App\Imports\BrandImport;
use App\Models\Brand;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;

class BrandController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $brands = Brand::paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => $brands->items(),
            'meta' => [
                'current_page' => $brands->currentPage(),
                'last_page' => $brands->lastPage(),
                'per_page' => $brands->perPage(),
                'total' => $brands->total(),
            ]
        ], 200);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(BrandRequest $request)
    {
        try {
            $data = $request->validated();

            // if ($request->hasFile('icon')) {
            //     $iconPath = $request->file('icon')->store('brand', 'public');
            //     $data['icon'] = 'storage/' . $iconPath;
            // }
            if ($request->hasFile('icon')) {
                // Tải lên Cloudinary vào thư mục 'brands'
                $uploaded = Cloudinary::upload($request->file('icon')->getRealPath(), [
                    'folder' => 'brands'
                ]);

                // Lưu URL bảo mật vào database
                $data['icon'] = $uploaded->getSecurePath();
            }
            $data['created_by'] = Auth::id();
            $data['updated_by'] = Auth::id();

            $brand = Brand::create($data);

            return response()->json([
                'status' => 'success',
                'message' => 'Thương hiệu được tạo thành công.',
                'data' => $brand
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi tạo thương hiệu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $brand = Brand::findOrFail($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Chi tiết thương hiệu.',
                'data' => $brand
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không tìm thấy thương hiệu: ' . $e->getMessage()
            ], 404);
        }
    }




    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBrandRequest $request, $id)
    {
        try {
            $brand = Brand::findOrFail($id);
            $data = $request->validated();

            if ($request->hasFile('icon')) {
                // Kiểm tra tệp có hợp lệ không
                if ($request->file('icon')->isValid()) {
                    // Xóa icon cũ nếu có
                    if ($brand->icon && Storage::disk('public')->exists(Str::replaceFirst('storage/', '', $brand->icon))) {
                        Storage::disk('public')->delete(Str::replaceFirst('storage/', '', $brand->icon));
                    }

                    // Lưu icon mới
                    $iconPath = $request->file('icon')->store('brand', 'public');
                    $data['icon'] = 'storage/' . $iconPath;
                }
            } else {
                // Nếu không có tệp mới, giữ lại hình cũ
                $data['icon'] = $brand->icon;  // Giữ lại icon cũ
            }

            $data['updated_by'] = Auth::id();

            $brand->update($data);

            return response()->json([
                'status' => 'success',
                'message' => 'Thương hiệu đã được cập nhật.',
                'data' => $brand
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi cập nhật thương hiệu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $brand = Brand::findOrFail($id);
            // Kiểm tra nếu không tìm thấy thương hiệu
            if (!$brand) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'thương hiệu không tồn tại'
                ], 404);
            }
            // Kiểm tra nếu thương hiệu có sản phẩm liên kết
            if ($brand->products()->count() > 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Không thể xóa vì thương hiệu này đang chứa sản phẩm.'
                ], 400);
            }
            $brand->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Thương hiệu đã được xóa.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi xóa thương hiệu: ' . $e->getMessage()
            ], 500);
        }
    }

    public function export()
    {
        return Excel::download(new BrandExport, 'brand.xlsx');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,csv'
        ]);

        Excel::import(new BrandImport, $request->file('file'));

        return response()->json([
            'status' => 'success',
            'message' => 'Nhập thương hiệu thành công.'
        ]);
    }
}
