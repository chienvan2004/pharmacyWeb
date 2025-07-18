<?php

namespace App\Http\Controllers;

use App\Models\Card;
use App\Models\CardItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CardController extends Controller
{
    private function getOrCreateCard()
    {
        // Do các route giỏ hàng đã được bảo vệ bởi middleware 'auth:api',
        // Auth::check() luôn là true và Auth::id() sẽ có giá trị.
        return Card::firstOrCreate(['user_id' => Auth::id()]);
    }

    /**
     * Thêm sản phẩm vào giỏ hàng.
     */
    public function addItem(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $product = Product::find($request->product_id);

        if (!$product) {
            return response()->json(['message' => 'Sản phẩm không tồn tại'], 404);
        }
        // if ($product->disable_out_of_stock == true) {
        //     return response()->json(['message' => 'sản phẩm đã hết hàng và không cho phép đặt hàng'], 400);
        // }

        $card = $this->getOrCreateCard(); // Lấy giỏ hàng của user đã đăng nhập

        $cardItem = CardItem::where('card_id', $card->id)
            ->where('product_id', $product->id)
            ->first();

        if ($cardItem) {
            $newQuantity = $cardItem->quantity + $request->quantity;
            $cardItem->quantity = $newQuantity;
            $cardItem->save();
        } else {
            $cardItem = new CardItem([
                'card_id' => $card->id,
                'product_id' => $product->id,
                'quantity' => $request->quantity,
            ]);
            $cardItem->save();
        }

        return response()->json([
            'message' => 'thêm sản phẩm vào giỏ hàng thành công',
            'cardItem' => $cardItem->load('product'),
            'card' => $card->load('items.product')
        ], 200);
    }

    /**
     * Lấy thông tin chi tiết giỏ hàng.
     */
    public function getCart(Request $request)
    {
        $card = $this->getOrCreateCard();
        $card->load('items.product.productSale', 'items.product.images');


        return response()->json([
            'message' => 'Product removed from card successfully!',
            'card_id' => $card->id,
            'user_id' => $card->user_id,
            'items' => $card->items,
            'total_items_count' => $card->items->sum('quantity')
        ], 200);
    }

    /**
     * Cập nhật số lượng sản phẩm trong giỏ hàng.
     */
    public function updateItemQuantity(Request $request, CardItem $item)
    {
        $request->validate([
            'quantity' => 'required|integer|min:0',
        ]);

        $card = $this->getOrCreateCard();
        if ($item->card_id !== $card->id) {
            return response()->json(['message' => 'Unauthorized access to card item.'], 403);
        }

        if ($request->quantity === 0) {
            $item->delete();
            // Fetch lại giỏ hàng sau khi xóa để cập nhật total_items_count
            $updatedCard = $this->getOrCreateCard()->load('items.product.productSale', 'items.product.images');

            return response()->json([
                'message' => 'Product removed from card successfully!',
                'card' => [
                    'items' => $updatedCard->items,
                    'total_items_count' => $updatedCard->items->sum('quantity')
                ]
            ], 200);
        }

        $item->quantity = $request->quantity;
        $item->save();

        // Fetch lại giỏ hàng sau khi cập nhật để trả về tổng mới
        $updatedCard = $this->getOrCreateCard()->load('items.product.productSale', 'items.product.images');

        return response()->json([
            'message' => 'Card item quantity updated successfully!',
            'cardItem' => $item->load('product.productSale'),
            'card' => [
                'items' => $updatedCard->items,
                'total_items_count' => $updatedCard->items->sum('quantity')
            ]
        ], 200);
    }

    /**
     * Xóa sản phẩm khỏi giỏ hàng.
     */
    public function removeItem(Request $request, CardItem $item)
    {
        $card = $this->getOrCreateCard();
        if ($item->card_id !== $card->id) {
            return response()->json(['message' => 'Unauthorized access to card item.'], 403);
        }

        $item->delete();

        // Fetch lại giỏ hàng sau khi xóa
        $updatedCard = $this->getOrCreateCard()->load('items.product.productSale', 'items.product.images');


        return response()->json([
            'message' => 'Product removed from card successfully!',
            'card' => [
                'items' => $updatedCard->items,
                'total_items_count' => $updatedCard->items->sum('quantity')
            ]
        ], 200);
    }
}
