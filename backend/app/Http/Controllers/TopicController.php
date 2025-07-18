<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTopicRequest;
use App\Http\Requests\UpdateTopicRequest;
use App\Models\Topic;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class TopicController extends Controller
{
    /**
     * Display a listing of the topics.
     */
    public function index(): JsonResponse
    {
        try {
            $topics = Topic::latest()->paginate(10);

            return response()->json([
                'status' => 'success',
                'message' => 'Danh sách chủ đề.',
                'data' => $topics->items(),
                'meta' => [
                    'current_page' => $topics->currentPage(),
                    'last_page' => $topics->lastPage(),
                    'per_page' => $topics->perPage(),
                    'total' => $topics->total(),
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi lấy danh sách chủ đề: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created topic in storage.
     */
    public function store(StoreTopicRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $data['created_by'] = Auth::id();
            $data['updated_by'] = Auth::id();

            $topic = Topic::create($data);

            return response()->json([
                'status' => 'success',
                'message' => 'Tạo chủ đề thành công.',
                'data' => $topic
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi tạo chủ đề: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified topic.
     */
    public function show($id): JsonResponse
    {
        try {
            $topic = Topic::findOrFail($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Chi tiết chủ đề.',
                'data' => $topic
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không tìm thấy chủ đề: ' . $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified topic in storage.
     */
    public function update(UpdateTopicRequest $request, $id): JsonResponse
    {
        try {
            $topic = Topic::findOrFail($id);
            $data = $request->validated();
            $data['updated_by'] = Auth::id();

            $topic->update($data);

            return response()->json([
                'status' => 'success',
                'message' => 'Cập nhật chủ đề thành công.',
                'data' => $topic
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi cập nhật chủ đề: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified topic from storage.
     */
    public function destroy($id): JsonResponse
    {
        try {
            $topic = Topic::findOrFail($id);
            $topic->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Xóa chủ đề thành công.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi xóa chủ đề: ' . $e->getMessage()
            ], 500);
        }
    }
}
