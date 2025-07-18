<?php

namespace App\Http\Controllers;

use App\Exports\TagExport;
use App\Http\Requests\TagRequest;
use App\Http\Requests\UpdateTagRequest;
use App\Imports\TagImport;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\DB;

class TagController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $tags = Tag::with('products')->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => $tags->items(),
            'meta' => [
                'current_page' => $tags->currentPage(),
                'last_page' => $tags->lastPage(),
                'per_page' => $tags->perPage(),
                'total' => $tags->total(),
            ]
        ], 200);
    }

    public function store(TagRequest $request)
    {
        DB::beginTransaction();

        try {
            $data = $request->validated();
            $data['created_by'] = Auth::id();
            $data['updated_by'] = Auth::id();

            $tag = Tag::create($data);

            if (!empty($data['products'])) {
                $tag->products()->sync($data['products']);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Tag được tạo thành công.',
                'data' => $tag->load('products')
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi tạo Tag: ' . $e->getMessage()
            ], 500);
        }
    }


    public function update(UpdateTagRequest $request, $id)
    {
        DB::beginTransaction();
        try {
            $tag = Tag::findOrFail($id);
            $data = $request->validated();
            $data['updated_by'] = Auth::id();

            $tag->update($data);

            if ($request->has('products') && is_array($request->products)) {
                $tag->products()->sync($data['products']);
            }
            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Tag đã được cập nhật.',
                'data' => $tag->load('products')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi cập nhật Tag: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $tag = Tag::findOrFail($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Chi tiết Tag.',
                'data' => $tag
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không tìm thấy Tag: ' . $e->getMessage()
            ], 404);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $tag = Tag::findOrFail($id);
            $tag->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Tag đã được xóa.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi xóa Tag: ' . $e->getMessage()
            ], 500);
        }
    }

    public function export()
    {
        return Excel::download(new TagExport, 'Tag.xlsx');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,csv'
        ]);

        Excel::import(new TagImport, $request->file('file'));

        return response()->json([
            'status' => 'success',
            'message' => 'Nhập thương hiệu thành công.'
        ]);
    }
}
