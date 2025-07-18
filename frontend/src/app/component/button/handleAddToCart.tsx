'use client';
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import useAuthStore from "@/stores/authStore";
import { addItemToCart, getCart } from "@/services/cardServices";

interface AddToCartButtonProps {
    productId: number;
    quantity: number;
    className?: string; // Đảm bảo nhận className
}

function AddToCartButton({ productId, quantity, className }: AddToCartButtonProps) {
    const { setCartItemCount } = useAuthStore();
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const checkIsAuthenticated = () => {
        const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("token="))
            ?.split("=")[1];
        return !!token;
    };

    const handleAddToCart = async () => {
        if (!checkIsAuthenticated()) {
            router.push("/dang-nhap");
            return;
        }

        try {
            await addItemToCart({
                product_id: productId,
                quantity: quantity,
            });
            const cart = await getCart();
            setCartItemCount(cart.total_items_count);
            toast.success("Đã thêm sản phẩm vào giỏ thuốc");
            setError(null);
            router.refresh();
        } catch (err) {
            toast.error(err);
            const errorResponse = err as any;
            setError(
                errorResponse.response?.data?.message || "Không thể thêm sản phẩm vào giỏ hàng"
            );
        }
    };

    return (
        <div>
            <button
                onClick={handleAddToCart}
                className={`cursor-pointer w-full py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 text-base font-semibold shadow-md ${className || ""}`}
                disabled={false}
            >
                  Thêm vào giỏ thuốc
            </button>

        </div>  
    );
}

export default AddToCartButton;