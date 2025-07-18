<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
class PostController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $posts = Post::with(['topic'])->latest()->paginate(18);

            return response()->json([
                'status' => 'success',
                'message' => 'Danh sách bài viết.',
                'data' => $posts->items(),
                'meta' => [
                    'current_page' => $posts->currentPage(),
                    'last_page' => $posts->lastPage(),
                    'per_page' => $posts->perPage(),
                    'total' => $posts->total(),
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi lấy danh sách bài viết: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(StorePostRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $data['created_by'] = Auth::id();
            $data['updated_by'] = Auth::id();

            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('posts', 'public');
                $data['image'] = 'storage/' . $imagePath;
            }
            $post = Post::create($data);

            return response()->json([
                'status' => 'success',
                'message' => 'Tạo bài viết thành công.',
                'data' => $post->load(['topic'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi tạo bài viết: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id): JsonResponse
    {
        try {
            $post = Post::with(['topic'])->findOrFail($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Chi tiết bài viết.',
                'data' => $post
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không tìm thấy bài viết: ' . $e->getMessage()
            ], 404);
        }
    }

    public function update(UpdatePostRequest $request, $id): JsonResponse
    {
        try {
            $post = Post::findOrFail($id);
            $data = $request->validated();
            $data['updated_by'] = Auth::id();

            if ($request->hasFile('image')) {
                if ($request->file('image')->isValid()) {
                    if ($post->image && Storage::disk('public')->exists(Str::replaceFirst('storage/', '', $post->image))) {
                        Storage::disk('public')->delete(Str::replaceFirst('storage/', '', $post->image));
                    }
                    $imagePath = $request->file('image')->store('posts', 'public');
                    $data['image'] = 'storage/' . $imagePath;
                }
            } else {
                $data['image'] = $post->image;
            }

            $post->update($data);

            return response()->json([
                'status' => 'success',
                'message' => 'Cập nhật bài viết thành công.',
                'data' => $post->load(['topic'])
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi cập nhật bài viết: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id): JsonResponse
    {
        try {
            $post = Post::findOrFail($id);

            if ($post->image && Storage::disk('public')->exists(Str::replaceFirst('storage/', '', $post->image))) {
                Storage::disk('public')->delete(Str::replaceFirst('storage/', '', $post->image));
            }

            $post->delete();
            return response()->json([
                'status' => 'success',
                'message' => 'Xóa bài viết thành công.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi xóa bài viết: ' . $e->getMessage()
            ], 500);
        }
    }
}
