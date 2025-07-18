<?php

namespace App\Http\Controllers;

use App\Models\Slideshow;
use App\Http\Controllers\Controller;
use App\Http\Requests\SlideshowRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;


class SlideshowController extends Controller
{
    public function index(): JsonResponse
    {
        $slideshows = Slideshow::query()
            ->latest()
            ->paginate(request()->query('per_page', 10));

        return response()->json([
            'status' => 'success',
            'message' => 'Lấy danh sách slideshow thành công.',
            'data' => $slideshows->items(),
            'pagination' => [
                'current_page' => $slideshows->currentPage(),
                'total_pages' => $slideshows->lastPage(),
                'total_items' => $slideshows->total(),
                'per_page' => $slideshows->perPage(),
            ],
        ], 200);
    }

    public function store(SlideshowRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Xử lý upload hình ảnh
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('slideshows', 'public');
        }

        $data['created_by'] = Auth::id();

        $slideshow = Slideshow::create($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Tạo slideshow thành công.',
            'data' => $slideshow,
        ], 201);
    }

    public function show(Slideshow $slideshow): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Lấy thông tin slideshow thành công.',
            'data' => $slideshow,
        ], 200);
    }

    public function update(SlideshowRequest $request, Slideshow $slideshow): JsonResponse
    {
        $data = $request->validated();

        // Xử lý hình ảnh nếu có upload mới
        if ($request->hasFile('image')) {
            // Xóa hình ảnh cũ nếu tồn tại
            if ($slideshow->image && Storage::exists('public/' . $slideshow->image)) {
                Storage::delete('public/' . $slideshow->image);
            }
            $data['image'] = $request->file('image')->store('slideshows', 'public');
        } else {
            $data['image'] = $slideshow->image; // Giữ hình ảnh cũ nếu không upload mới
        }
        $data['updated_by'] = Auth::id();


        $slideshow->update($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Cập nhật slideshow thành công.',
            'data' => $slideshow,
        ], 200);
    }

    public function destroy(Slideshow $slideshow): JsonResponse
    {
        // Xóa hình ảnh nếu tồn tại
        if ($slideshow->image && Storage::exists('public/' . $slideshow->image)) {
            Storage::delete('public/' . $slideshow->image);
        }

        $slideshow->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Xóa slideshow thành công.',
        ], 200);
    }

    public function incrementClicks(Slideshow $slideshow): JsonResponse
    {
        $slideshow->increment('clicks');

        return response()->json([
            'status' => 'success',
            'message' => 'Tăng lượt click thành công.',
            'data' => $slideshow,
        ], 200);
    }
}
