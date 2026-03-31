'use client';

import { AuthProvider } from '@/AuthContext';
import { getProfile } from '@/services/authServices';
import useAuthStore from '@/stores/authStore';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FaBars, FaBoxes, FaHome, FaPills, FaSignOutAlt, FaTags, FaUser, FaUserCircle, FaWarehouse } from 'react-icons/fa';
import { FaWeightScale } from 'react-icons/fa6';
import { IoLibrary } from 'react-icons/io5';
import { MdArticle } from 'react-icons/md';
import { PiSlideshowFill } from 'react-icons/pi';
import { RiCoupon3Fill, RiDiscountPercentFill } from 'react-icons/ri';
import { SiBrandfolder } from 'react-icons/si';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { user, setUser } = useAuthStore();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const token = document.cookie
            .split('; ')
            .find((row) => row.startsWith('token='))
            ?.split('=')[1];

        if (!token) {
            router.push('/admin/login');//sau test sửa lại chỗ này
            return;
        }

        const fetchUserData = async () => {
            try {

                const profile = await getProfile();
                setUser(profile); // Cập nhật user trong store

            } catch (error) {
                console.error("Error fetching data:", error);
                setUser(null); // Reset user nếu lỗi (token không hợp lệ)
            }
        };
        fetchUserData();
    }, [setUser]);

    // Hàm đăng xuất
    const handleLogout = () => {
        document.cookie = 'token=; Max-Age=0; path=/'; // Xóa cookie token
        document.cookie = 'role_id=; Max-Age=0; path=/'; // Xóa cookie token
        setIsProfileOpen(false); // Đóng menu profile
        router.push('/admin/login'); // Chuyển hướng đến trang login
    };

    // Không render layout cho các trang login/register
    if (['/admin/login', '/admin/register'].includes(pathname)) {
        return <>{children}</>;
    }

    return (
        <AuthProvider>
            <div className="flex flex-col h-screen font-sans">
                {/* Header */}
                <header className="sticky top-0 z-20 w-full h-16 bg-gradient-to-r from-gray-800 to-gray-900 text-white flex items-center justify-between px-4 sm:px-6 shadow-xl">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-2 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                            aria-label="Toggle sidebar"
                        >
                            <FaBars size={20} className="text-white" />
                        </button>
                        <h1 className="text-lg sm:text-xl font-semibold tracking-wide hidden sm:block">
                            ADMIN DASHBOARD
                        </h1>
                    </div>

                    <div className="relative flex items-center space-x-3">
                        <span className="text-sm font-medium hidden sm:inline">
                            {user?.name || 'User'} {/* Hiển thị tên user */}
                        </span>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            aria-label="User profile"
                        >
                            <FaUserCircle size={28} className="text-gray-300" />
                        </button>

                        {isProfileOpen && (
                            <div className="absolute right-0 top-12 w-48 bg-gray-800 rounded-lg shadow-lg py-2 border border-gray-700">
                                <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
                                    {user?.name || 'User'} <br />
                                    <span className="text-xs text-gray-400">{user?.email || 'email@example.com'}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                                >
                                    <FaSignOutAlt className="mr-2" />
                                    Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Content */}
                <div className="flex flex-1 overflow-hidden bg-gray-50">
                    {/* Sidebar */}
                    <aside className={`bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
                        <nav className="h-full py-4">
                            <ul className="space-y-1 px-2">
                                {[
                                    { href: '/admin', icon: FaHome, text: 'Dashboard' },
                                    { href: '/admin/users', icon: FaUser, text: 'Người dùng' },
                                    { href: '/admin/order', icon: RiDiscountPercentFill, text: 'Quản lí đơn hàng' },
                                    { href: '/admin/product', icon: FaPills, text: 'Quản lí thuốc' },
                                    { href: '/admin/category', icon: FaBoxes, text: 'Quản lí Danh mục' },
                                    { href: '/admin/brand', icon: SiBrandfolder, text: 'Quản lí Thương hiệu' },
                                    { href: '/admin/tag', icon: FaTags, text: 'Quản lí thẻ' },
                                    { href: '/admin/unit', icon: FaWeightScale, text: 'Quản lí đơn vị' },
                                    { href: '/admin/store', icon: FaWarehouse, text: 'Quản lí nhập kho' },
                                    { href: '/admin/topic', icon: IoLibrary, text: 'Quản lí chủ đề bài viết' },
                                    { href: '/admin/post', icon: MdArticle, text: 'Quản lí bài viết' },
                                    { href: '/admin/slideshow', icon: PiSlideshowFill, text: 'Quản lí slideshow' },
                                    { href: '/admin/coupon', icon: RiCoupon3Fill, text: 'Quản lí mã giảm giá' },
                                    { href: '/admin/product-discount', icon: RiDiscountPercentFill, text: 'Quản lí sản phẩm giảm giá' },

                                    // { href: '/admin/coupon', icon: BiSolidPurchaseTagAlt, text: 'Quản lí đơn hàng' },
                                    // { href: '/admin/coupon', icon: FaShippingFast, text: 'Quản lí quản lí vẫn chuyển' },
                                ].map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            href={item.href}
                                            className={`flex items-center p-3 rounded-lg hover:bg-indigo-50 ${isCollapsed ? 'justify-center' : 'px-4'
                                                } text-gray-700 hover:text-indigo-700 transition-colors ${pathname === item.href ? 'bg-indigo-100 text-indigo-700' : ''
                                                }`}
                                        >
                                            <item.icon size={20} className="flex-shrink-0" />
                                            {!isCollapsed && <span className="ml-3 font-medium text-sm">{item.text}</span>}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 overflow-auto p-8 ">
                        <div className="max-w-full mx-auto bg-white rounded-xl shadow-sm p-6">{children}</div>
                    </main>
                </div>

                {/* Footer */}
                <footer className="w-full h-12 bg-gray-700 text-white flex items-center justify-center text-sm font-medium">
                    © 2025 Hệ thống Quản lý Dược phẩm | Được phát triển bởi Next.js & Tailwind CSS
                </footer>
            </div>
        </AuthProvider>
    );
}