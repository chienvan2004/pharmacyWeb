import { Card } from '@/types/card';
import { User } from '@/types/userInterface';
import { create } from 'zustand';



interface AuthState {
    user: User | null;
    accessToken: string | null;
    cart: Card | null; // Thêm giỏ hàng vào store
    cartItemCount: number | null; // Số lượng sản phẩm trong giỏ
    setUser: (user: User) => void;
    setAccessToken: (accessToken: string) => void;
    clearAuth: () => void;
    setCart: (cart: Card) => void; // Cập nhật giỏ hàng
    clearCart: () => void; // Xóa giỏ hàng
    setCartItemCount: (count: number | null) => void; // Cập nhật số lượng sản phẩm
}

const useAuthStore = create<AuthState>((set) => ({
    user: null,
    accessToken: null,
    cart: null, // Khởi tạo giỏ hàng là null
    cartItemCount: null,
    setUser: (user: User) => set({ user }),
    setAccessToken: (accessToken: string) => set({ accessToken }),
    clearAuth: () => set({ user: null, accessToken: null }),
    setCart: (cart: Card) => set({ cart, cartItemCount: cart.total_items_count }), // Cập nhật cả cart và cartItemCount
    clearCart: () => set({ cart: null, cartItemCount: null }), // Xóa giỏ hàng và số lượng
    setCartItemCount: (count: number | null) => set({ cartItemCount: count }),
}));

export default useAuthStore;