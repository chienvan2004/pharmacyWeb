'use client';

import { loginAdmin } from '@/services/authServices';
import useAuthStore from '@/stores/authStore';
import { AlertCircleIcon, LockIcon, UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ClipLoader } from 'react-spinners';

export default function AdminLogin() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, setUser, setAccessToken } = useAuthStore();

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            setError('Vui lòng nhập địa chỉ email hợp lệ');
            setLoading(false);
            return;
        }
        if (!formData.password) {
            setError('Vui lòng nhập mật khẩu');
            setLoading(false);
            return;
        }

        try {
            const loginData = {
                email: formData.email,
                password: formData.password,
            };
            const response = await loginAdmin(loginData);
            if (response.accessToken) {
                document.cookie = `token=${response.accessToken}; path=/; max-age=3600; secure; SameSite=Strict`;
                document.cookie = `role_id=${response.role_id}; path=/; max-age=3600; secure; SameSite=Strict`;
                setAccessToken(response.accessToken);
                setUser({
                    id: response.user?.id || 0,
                    name: response.user?.name || "",
                    email: response.user?.email || "",
                    avatar: response.user?.avatar || "",
                    account_type: response.user?.account_type || "local",
                    providers: response.user?.providers || [],
                });
                setLoading(false); // Tắt loading khi thành công
                router.push('/admin'); // Chuyển hướng đến trang admin
            } else {
                throw new Error('Không nhận được token từ server');
            }
        } catch (error: any) {
            console.error('Login Error: ', error); // Debug: Kiểm tra lỗi
            setError(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-100">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="w-20 h-20 mx-auto bg-blue-600 rounded-lg flex items-center justify-center">
                    <LockIcon className="h-10 w-10 text-white" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Bảng Điều Khiển Admin
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Đăng nhập vào tài khoản của bạn
                </p>
            </div>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {error && (
                        <div className="mb-4 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
                            <AlertCircleIcon className="h-5 w-5" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}
                    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Địa chỉ Email
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                                    placeholder="Nhập email của bạn"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        })
                                    }
                                    disabled={loading}
                                    aria-label="Địa chỉ email"
                                />
                            </div>
                        </div>
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Mật khẩu
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                                    placeholder="Nhập mật khẩu của bạn"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            password: e.target.value,
                                        })
                                    }
                                    disabled={loading}
                                    aria-label="Mật khẩu"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:cursor-not-allowed"
                                    checked={formData.rememberMe}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            rememberMe: e.target.checked,
                                        })
                                    }
                                    disabled={loading}
                                />
                                <label
                                    htmlFor="remember-me"
                                    className="ml-2 block text-sm text-gray-900"
                                >
                                    Ghi nhớ tôi
                                </label>
                            </div>
                            <div className="text-sm">
                                <a
                                    href="/forgot-password"
                                    className="font-medium text-blue-600 hover:text-blue-500"
                                >
                                    Quên mật khẩu?
                                </a>
                            </div>
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                                disabled={loading}
                                aria-label={loading ? 'Đang đăng nhập' : 'Đăng nhập'}
                            >
                                {loading ? (
                                    <ClipLoader size={20} color="#ffffff" />
                                ) : (
                                    'Đăng nhập'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}