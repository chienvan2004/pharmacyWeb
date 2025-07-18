<?php

namespace App\Http\Controllers;

use App\Models\Card;
use App\Models\CardItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductStore;
use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;


class OrderController extends Controller
{
    public function placeOrder(Request $request)
    {
        // Validate các trường cơ bản
        $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'coupon_id' => '',
            'items' => 'required|array',
            'items.*.product_id' => 'required|integer',
            'items.*.price' => 'required|numeric',
            'items.*.quantity' => 'required|integer',
            'payment_method' => 'in:cash,vnpay',
        ]);

        // Lấy thông tin người dùng
        $user = User::findOrFail($request->user_id);

        // Kiểm tra phone_number và địa chỉ
        $hasPhoneNumber = $user->phone_number !== null && !empty($user->phone_number);
        $hasAddress = UserAddress::where('user_id', $request->user_id)->exists();

        if (!$hasPhoneNumber || !$hasAddress) {
            return response()->json([
                'message' => 'Missing information',
                'requires_input' => true,
                'has_phone_number' => $hasPhoneNumber,
                'has_address' => $hasAddress,
                'user_id' => $request->user_id,
            ], 400);
        }

        // Bắt đầu giao dịch để đảm bảo tính nhất quán
        DB::beginTransaction();

        try {
            // Tạo order
            $order = Order::create([
                'user_id' => $request->user_id,
                'coupon_id' => $request->coupon_id,
                'payment_method' => $request->payment_method ?? 'cash',
                'status' => $request->payment_method === 'vnpay' ? 'pending' : 'confirmed',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $totalAmount = 0;
            $totalCogs = 0;

            foreach ($request->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'price' => $item['price'],
                    'quantity' => $item['quantity'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $totalAmount += $item['price'] * $item['quantity'];

                // Lấy tất cả lô nhập cho product_id theo FIFO
                $remainingQuantity = $item['quantity'];
                $productStores = ProductStore::where('product_id', $item['product_id'])
                    ->where('quantity', '>', 0)
                    ->orderBy('created_at', 'asc')
                    ->lockForUpdate()
                    ->get();

                $cogsForItem = 0;
                foreach ($productStores as $store) {
                    if ($remainingQuantity <= 0) break;

                    $quantityToDeduct = min($remainingQuantity, $store->quantity);
                    $costForThisLot = $quantityToDeduct * $store->root_price;
                    $cogsForItem += $costForThisLot;

                    $store->quantity -= $quantityToDeduct;
                    $store->updated_by = $user->id;
                    $store->updated_at = now();
                    $store->save();

                    $remainingQuantity -= $quantityToDeduct;
                }

                if ($remainingQuantity > 0) {
                    throw new \Exception('Not enough inventory for product ID: ' . $item['product_id']);
                }

                $totalCogs += $cogsForItem;
            }


            // Tính lợi nhuận
            $profit = $totalAmount - $totalCogs;

            // (Tùy chọn) Lưu lợi nhuận vào order
            $order->update(['profit' => $profit]);

            CardItem::where('card_id', function ($query) use ($request) {
                $query->select('id')->from('cards')->where('user_id', $request->user_id);
            })->delete();

            // Xóa giỏ hàng
            $cart = Card::where('user_id', $request->user_id)->first();
            if ($cart) {
                $cart->delete();
            }

            // Commit giao dịch
            DB::commit();

            // Lấy thông tin địa chỉ để hiển thị
            $address = UserAddress::where('user_id', $request->user_id)->first();
            $phoneNumber = $user->phone_number;

            if ($request->payment_method === 'vnpay') {
                return $this->createVnpayPayment($order->id, $totalAmount, $request->user_id);
            }

            return response()->json([
                'message' => 'Order placed successfully',
                'order_id' => $order->id,
                'user_info' => [
                    'phone_number' => $phoneNumber,
                    'address' => $address ? $address->address : null,
                ],
                'profit' => $profit,
                'total_amount' => $totalAmount,
                'total_cogs' => $totalCogs,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to place order: ' . $e->getMessage(),
            ], 400);
        }
    }

    private function createVnpayPayment($orderId, $amount, $userId)
    {
        $vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
        $vnp_Returnurl = env('APP_URL'); // URL callback sau khi thanh toán
        $vnp_TmnCode = env('VNP_TMN_CODE');
        $vnp_HashSecret = env('VNP_HASH_SECRET');
        $vnp_TxnRef = $orderId;
        $vnp_OrderInfo = "Thanh toan don hang #$orderId";
        $vnp_OrderType = "other";
        $vnp_Amount = $amount * 100;
        $vnp_Locale = "vn";
        $vnp_IpAddr = request()->ip();

        $inputData = array(
            "vnp_Version" => "2.1.0",
            "vnp_TmnCode" => $vnp_TmnCode,
            "vnp_Amount" => $vnp_Amount,
            "vnp_Command" => "pay",
            "vnp_CreateDate" => date('YmdHis'),
            "vnp_CurrCode" => "VND",
            "vnp_IpAddr" => $vnp_IpAddr,
            "vnp_Locale" => $vnp_Locale,
            "vnp_OrderInfo" => $vnp_OrderInfo,
            "vnp_OrderType" => $vnp_OrderType,
            "vnp_ReturnUrl" => $vnp_Returnurl,
            "vnp_TxnRef" => $vnp_TxnRef,
        );

        ksort($inputData);
        $query = http_build_query($inputData);
        $hashData = hash_hmac('sha512', $query, $vnp_HashSecret);
        $vnp_SecureHash = $hashData;
        $inputData['vnp_SecureHash'] = $vnp_SecureHash;
        $vnpUrl = $vnp_Url . "?" . http_build_query($inputData);

        return response()->json([
            'message' => 'Redirect to VNPay payment',
            'payment_url' => $vnpUrl,
            'order_id' => $orderId,
        ], 200);
    }

    public function handleVnpayReturn(Request $request)
    {
        $vnp_HashSecret = env('VNP_HASH_SECRET'); // Secret key từ VNPay
        $inputData = $request->all();
        $vnp_SecureHash = $inputData['vnp_SecureHash'];
        unset($inputData['vnp_SecureHash']);
        ksort($inputData);
        $hashData = hash_hmac('sha512', http_build_query($inputData), $vnp_HashSecret);


        $orderId = $inputData['vnp_TxnRef'];
        $vnp_ResponseCode = $inputData['vnp_ResponseCode'];
        $order = Order::find($orderId);

        if ($order && $vnp_ResponseCode == '00') {
            // Thanh toán thành công
            $order->update([
                'status' => 'confirmed',
                'payment_status' => 'paid',
                'order_approved_at' => now(),
                'updated_at' => now(),
            ]);
            return response()->json([
                'message' => 'Payment successful',
                'order_id' => $orderId,
                'status' => 'success',
            ], 200);
        } else {
            // Thanh toán thất bại hoặc lỗi
            $order->update([
                'status' => 'failed',
                'payment_status' => 'failed',
                'updated_at' => now(),
            ]);
            return response()->json([
                'message' => 'Payment failed',
                'order_id' => $orderId,
                'status' => 'failed',
            ], 400);
        }
    }


    // Lấy danh sách tất cả đơn hàng (admin)
    public function index(Request $request)
    {
        // Lấy số lượng bản ghi trên mỗi trang từ query parameter, mặc định là 10
        $perPage = $request->input('per_page', 10);

        // Lấy các tham số lọc từ query parameters
        $status = $request->input('status');
        $paymentStatus = $request->input('payment_status');
        $userId = $request->input('user_id');

        // Xây dựng truy vấn với các quan hệ 'user', 'items'
        $query = Order::with(['user', 'items']);

        // Áp dụng lọc theo trạng thái đơn hàng nếu có
        if ($status) {
            $query->where('status', $status);
        }

        // Áp dụng lọc theo trạng thái thanh toán nếu có
        if ($paymentStatus) {
            $query->where('payment_status', $paymentStatus);
        }

        // Áp dụng lọc theo ID người dùng nếu có
        if ($userId) {
            $query->where('user_id', $userId);
        }

        // Lấy danh sách đơn hàng với phân trang
        $orders = $query->paginate($perPage)->through(function ($order) {
            $totalAmount = $order->items->sum(function ($item) {
                return $item->price * $item->quantity;
            });

            // Thêm thuộc tính tổng giá trị đơn hàng
            $order->total_amount = $totalAmount;
            return $order;
        });

        return response()->json([
            'status' => 'success',
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ]
        ], 200);
    }

    //chi tiết
    public function show($id)
    {
        // Tìm đơn hàng và tải trước mối quan hệ
        $order = Order::with(['user', 'items.product'])->findOrFail($id);

        // Tính tổng giá tiền từ items
        $totalAmount = $order->items->sum(function ($item) {
            return $item->price * $item->quantity;
        });

        // Chuẩn bị dữ liệu trả về
        $orderData = [
            'id' => $order->id,
            'user_id' => $order->user_id,
            'coupon_id' => $order->coupon_id,
            'payment_method' => $order->payment_method,
            'status' => $order->status,
            'payment_status' => $order->payment_status,
            'total_amount' => $totalAmount,
            'order_approved_at' => $order->order_approved_at,
            'created_at' => $order->created_at,
            'updated_at' => $order->updated_at,
            'user' => $order->user,
            'items' => $order->items,
        ];

        return response()->json([
            'message' => 'Order retrieved successfully',
            'data' => $orderData
        ], 200);
    }

    // Cập nhật trạng thái đơn hàng (admin)
    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $request->validate([
            'status' => 'required|in:pending,confirmed,shipping,completed,cancelled,refunded,failed',
        ]);

        $currentStatus = $order->status;
        $newStatus = $request->status;

        // Xác định luồng chuyển trạng thái hợp lệ
        $allowedTransitions = [
            'pending' => ['confirmed', 'cancelled', 'failed'],
            'confirmed' => ['shipping', 'cancelled', 'failed'],
            'shipping' => ['completed', 'refunded', 'failed'],
            'completed' => ['refunded'], // completed là trạng thái kết thúc
            'cancelled' => [], // không cho phép khôi phục
            'refunded' => [], // không cho phép đổi nữa
            'failed' => [], // đơn hàng lỗi cũng không nên xử lý lại
        ];

        // Kiểm tra nếu trạng thái mới không nằm trong danh sách hợp lệ
        if (!in_array($newStatus, $allowedTransitions[$currentStatus] ?? [])) {
            return response()->json([
                'message' => "Không thể chuyển từ trạng thái '$currentStatus' sang '$newStatus'.",
            ], 422); // 422 Unprocessable Entity
        }

        $updateData = [
            'status' => $newStatus,
        ];

        if ($newStatus === 'completed') {
            $updateData['payment_status'] = 'paid';
        }

        $order->update($updateData);

        return response()->json([
            'message' => 'Cập nhật trạng thái đơn hàng thành công.',
            'data' => $order->fresh()
        ], 200);
    }
}
