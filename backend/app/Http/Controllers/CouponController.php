<?php

namespace App\Http\Controllers;

use App\Http\Requests\CouponRequest;
use App\Http\Requests\UpdateCouponRequest;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CouponController extends Controller
{
    public function index(): JsonResponse
    {
        $coupons = Coupon::query()
            ->with('products') // Load danh sách sản phẩm liên quan
            ->latest()
            ->paginate(request()->query('per_page', 10));

        return response()->json([
            'status' => 'success',
            'message' => 'Lấy danh sách coupon thành công.',
            'data' => $coupons->items(),
            'pagination' => [
                'current_page' => $coupons->currentPage(),
                'total_pages' => $coupons->lastPage(),
                'total_items' => $coupons->total(),
                'per_page' => $coupons->perPage(),
            ],
        ], 200);
    }
    public function store(CouponRequest $request): JsonResponse
    {
        DB::beginTransaction();

        try {
            Log::info('Request data:', $request->all()); // Thêm log
            $data = $request->validated();
            $data['times_used'] = 0; // Tự động đặt times_used = 0


            // Tạo coupon
            $coupon = Coupon::create($data);

            // Gắn sản phẩm vào coupon
            if (!empty($data['products'])) {
                $coupon->products()->sync($data['products']);
            }


            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Coupon được tạo thành công.',
                'data' => $coupon->load('products'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi tạo Coupon: ' . $e->getMessage(),
            ], 500);
        }
    }
    public function update(UpdateCouponRequest $request, Coupon $coupon): JsonResponse
    {
        // Log dữ liệu thô trước khi validation
        Log::info('Raw request data:', $request->all());

        DB::beginTransaction();

        try {
            $data = $request->validated();

            // Cập nhật coupon
            $coupon->update($data);

            // Lấy danh sách product_ids từ request
            $productIds = $request->input('products', []);

            // Đồng bộ quan hệ sản phẩm
            $coupon->products()->sync($productIds);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Coupon đã được cập nhật thành công.',
                'data' => $coupon->load('products'),
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi cập nhật Coupon: ' . $e->getMessage(),
            ], 500);
        }
    }
    public function show(Coupon $coupon): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Lấy thông tin coupon thành công.',
            'data' => $coupon->load('products'),
        ], 200);
    }

    public function destroy(Coupon $coupon): JsonResponse
    {
        // Xóa các liên kết trong bảng product_coupons trước khi xóa coupon
        $coupon->products()->detach();

        $coupon->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Xóa coupon thành công.',
        ], 200);
    }

    public function incrementTimesUsed(Coupon $coupon): JsonResponse
    {
        if ($coupon->max_usage && $coupon->times_used >= $coupon->max_usage) {
            return response()->json([
                'status' => 'error',
                'message' => 'Coupon đã đạt giới hạn số lần sử dụng.',
            ], 400);
        }

        $coupon->increment('times_used');

        return response()->json([
            'status' => 'success',
            'message' => 'Tăng số lần sử dụng thành công.',
            'data' => $coupon->load('products'),
        ], 200);
    }

    public function checkCoupon(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string|max:50',
            'order_amount' => 'required|numeric|min:0', // Tổng số tiền đơn hàng
            'product_ids' => 'required|array', // Danh sách ID sản phẩm trong giỏ hàng
            'product_ids.*' => 'exists:products,id',
        ]);

        $code = $request->input('code');
        $orderAmount = $request->input('order_amount');
        $productIds = $request->input('product_ids');

        // Tìm coupon theo mã
        $coupon = Coupon::where('code', $code)
            ->with('products')
            ->first();

        if (!$coupon) {
            return response()->json([
                'status' => 'error',
                'message' => 'Coupon không tồn tại.',
            ], 404);
        }

        // Kiểm tra thời gian hiệu lực
        $currentDate = Carbon::now(); // Thời gian hiện tại: 2025-05-19 14:29:00 +07
        // if ($coupon->coupon_start_date && $currentDate->lt($coupon->coupon_start_date)) {
        //     return response()->json([
        //         'status' => 'error',
        //         'message' => 'Coupon chưa có hiệu lực.',
        //     ], 400);
        // }

        if ($coupon->coupon_end_date && $currentDate->gt($coupon->coupon_end_date)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Coupon đã hết hạn.',
            ], 400);
        }

        // Kiểm tra số lần sử dụng
        if ($coupon->max_usage && $coupon->times_used >= $coupon->max_usage) {
            return response()->json([
                'status' => 'error',
                'message' => 'Coupon đã đạt giới hạn số lần sử dụng.',
            ], 400);
        }

        // Kiểm tra giới hạn số tiền đơn hàng
        if ($coupon->order_amount_limit && $orderAmount < $coupon->order_amount_limit) {
            return response()->json([
                'status' => 'error',
                'message' => "Đơn hàng phải có giá trị tối thiểu là {$coupon->order_amount_limit} để sử dụng coupon này.",
            ], 400);
        }

        // Kiểm tra sản phẩm áp dụng
        $couponProductIds = $coupon->products->pluck('id')->toArray();
        $applicableProducts = array_intersect($productIds, $couponProductIds);

        if (empty($couponProductIds)) {
            // Nếu coupon không giới hạn sản phẩm (không có sản phẩm nào trong product_coupons), áp dụng cho tất cả
            $applicable = true;
        } else {
            // Nếu coupon có giới hạn sản phẩm, kiểm tra xem có sản phẩm nào trong giỏ hàng áp dụng được không
            $applicable = !empty($applicableProducts);
        }

        if (!$applicable) {
            return response()->json([
                'status' => 'error',
                'message' => 'Coupon không áp dụng cho các sản phẩm trong giỏ hàng.',
            ], 400);
        }

        // Nếu tất cả điều kiện đều thỏa mãn
        return response()->json([
            'status' => 'success',
            'message' => 'Coupon hợp lệ.',
            'data' => [
                'coupon' => $coupon,
                'applicable_products' => $applicableProducts,
            ],
        ], 200);
    }
}
