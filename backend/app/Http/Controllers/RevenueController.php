<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductStore;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RevenueController extends Controller
{
    // public function monthlyRevenue(Request $request)
    // {
    //     // Lấy tham số year từ query, mặc định là năm hiện tại
    //     $year = $request->query('year', now()->year);

    //     $revenues = OrderItem::select(
    //         DB::raw("DATE_FORMAT(orders.created_at, '%Y-%m') as month"),
    //         DB::raw('SUM(order_items.price * order_items.quantity) as revenue')
    //     )
    //         ->join('orders', 'order_items.order_id', '=', 'orders.id')
    //         ->where('orders.payment_status', 'paid')
    //         ->whereYear('orders.created_at', $year)
    //         ->groupBy(DB::raw("DATE_FORMAT(orders.created_at, '%Y-%m')"))
    //         ->orderBy('month', 'asc')
    //         ->get();

    //     // Format dữ liệu trả về
    //     $data = $revenues->map(function ($item) {
    //         return [
    //             'month' => $item->month,
    //             'revenue' => (float) $item->revenue,
    //         ];
    //     });

    //     return response()->json([
    //         'data' => $data,
    //     ], 200);
    // }


    public function getTotalProfit(Request $request)
    {
        // Validate request (tùy chọn khoảng thời gian)
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        // Lấy và định dạng ngày tháng với Carbon, sử dụng múi giờ UTC
        $startDate = $request->input('start_date', '1970-01-01');
        $endDate = $request->input('end_date', now()->format('Y-m-d'));

        $startDate = Carbon::parse($startDate)->startOfDay()->timezone('UTC')->toIso8601String();
        $endDate = Carbon::parse($endDate)->endOfDay()->timezone('UTC')->toIso8601String();

        // Bắt đầu giao dịch để đảm bảo tính nhất quán
        DB::beginTransaction();

        try {
            // Lấy tất cả đơn hàng hoàn thành trong khoảng thời gian dựa trên created_at
            $orders = Order::where('status', 'completed')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->with('items')
                ->get();

            $totalRevenue = 0;
            $totalCogs = 0;

            foreach ($orders as $order) {
                $orderTotal = 0;
                $orderCogs = 0;

                foreach ($order->items as $item) {
                    $orderTotal += $item->price * $item->quantity;

                    // Tính COGS theo FIFO cho từng sản phẩm
                    $remainingQuantity = $item->quantity;
                    $productStores = ProductStore::where('product_id', $item->product_id)
                        ->where('quantity', '>', 0)
                        ->orderBy('created_at', 'asc')
                        ->lockForUpdate()
                        ->get();

                    foreach ($productStores as $store) {
                        if ($remainingQuantity <= 0) break;

                        $quantityToDeduct = min($remainingQuantity, $store->quantity);
                        $costForThisLot = $quantityToDeduct * $store->root_price;
                        $orderCogs += $costForThisLot;


                        $remainingQuantity -= $quantityToDeduct;
                    }

                    if ($remainingQuantity > 0) {
                        throw new \Exception('Not enough inventory for product ID: ' . $item->product_id);
                    }
                }

                $totalRevenue += $orderTotal;
                $totalCogs += $orderCogs;
            }

            $totalProfit = $totalRevenue - $totalCogs;

            // Commit giao dịch
            DB::commit();

            // Chuẩn bị dữ liệu cho biểu đồ
            $chartData = [
                'type' => 'bar',
                'data' => [
                    'labels' => ['Revenue', 'COGS', 'Profit'],
                    'datasets' => [
                        [
                            'label' => 'Amount (VNĐ)',
                            'data' => [$totalRevenue, $totalCogs, $totalProfit],
                            'backgroundColor' => [
                                'rgba(75, 192, 192, 0.5)',
                                'rgba(255, 99, 132, 0.5)',
                                'rgba(54, 162, 235, 0.5)',
                            ],
                            'borderColor' => [
                                'rgba(75, 192, 192, 1)',
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                            ],
                            'borderWidth' => 1,
                        ],
                    ],
                ],
                'options' => [
                    'responsive' => true,
                    'plugins' => [
                        'legend' => ['position' => 'top'],
                        'title' => ['display' => true, 'text' => "Profit Overview ($startDate to $endDate)"],
                    ],
                    'scales' => [
                        'y' => [
                            'beginAtZero' => true,
                            'title' => ['display' => true, 'text' => 'Amount (VNĐ)'],
                        ],
                    ],
                ],
            ];

            return response()->json([
                'message' => 'Total profit calculated successfully',
                'total_revenue' => $totalRevenue,
                'total_profit' => $totalProfit,
                'chart' => $chartData,
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to calculate profit: ' . $e->getMessage(),
            ], 400);
        }
    }
}
