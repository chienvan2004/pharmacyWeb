"use client"
import Link from "next/link";
import { ReactNode } from "react";
import { FaBell, FaUser } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { HiDocument } from "react-icons/hi2";
import { IoLogOut } from "react-icons/io5";
import useAuthStore from "@/stores/authStore"; // Import store
import { useRouter } from "next/navigation"; // Import router

export default function Layout({ children }: { children: ReactNode }) {
    const { clearAuth, clearCart } = useAuthStore(); // Lấy các hàm từ store
    const router = useRouter(); // Sử dụng router để điều hướng

    // Hàm xử lý đăng xuất
    const handleLogout = () => {
        document.cookie = "token=; path=/; max-age=0; secure; SameSite=Strict";
        document.cookie = "role_id=; path=/; max-age=0; secure; SameSite=Strict";
        clearAuth()
        clearCart()
        router.push("/");
    };

    return (
        <div className="max-w-7xl mx-auto flex">
            {/* Sidebar */}
            <aside className="w-72 bg-white shadow-lg p-6 my-6 rounded-2xl">
                <h2 className="text-lg font-medium mb-5 text-gray-800">Tài khoản của tôi</h2>
                <ul className="space-y-3 text-gray-700 text-sm">
                    <Link href="/tai-khoan">
                        <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition">
                            <FaUser className="text-lg" />
                            <span className="text-lg font-medium">Thông tin tài khoản</span>
                        </li>
                    </Link>
                    <Link href="">
                        <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition">
                            <FaLocationDot className="text-lg" />
                            <span className="text-lg font-medium">Sổ địa chỉ nhận hàng</span>
                        </li>
                    </Link>
                    <Link href="">
                        <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition">
                            <HiDocument className="text-lg" />
                            <span className="text-lg font-medium">Lịch sử đơn hàng</span>
                        </li>
                    </Link>
                    <Link href="">
                        <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition">
                            <FaBell className="text-lg" />
                            <span className="text-lg font-medium">Thông báo của tôi</span>
                        </li>
                    </Link>
                    <li
                        onClick={handleLogout}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition"
                    >
                        <IoLogOut className="text-2xl" />
                        <span className="text-lg font-medium">Đăng xuất</span>
                    </li>
                </ul>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6">{children}</main>
        </div>
    );
}