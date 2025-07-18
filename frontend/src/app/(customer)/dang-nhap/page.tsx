"use client";

import { loginClient, register } from "@/services/authServices";
import useAuthStore from "@/stores/authStore";
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showpassword_confirmation, setShowpassword_confirmation] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        rememberMe: false,
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { user, setUser, setAccessToken } = useAuthStore();

    useEffect(() => {
        if (user) {
            router.push("/");
        }
    }, [user, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError(null);
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            rememberMe: e.target.checked,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            setError("Vui lòng nhập địa chỉ email hợp lệ");
            setIsLoading(false);
            return;
        }
        if (!formData.password) {
            setError("Vui lòng nhập mật khẩu");
            setIsLoading(false);
            return;
        }
        if (!isLogin && formData.password !== formData.password_confirmation) {
            setError("Mật khẩu xác nhận không khớp");
            setIsLoading(false);
            return;
        }

        try {
            if (isLogin) {
                const loginData = {
                    email: formData.email,
                    password: formData.password,
                };
                const response = await loginClient(loginData);
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
                    router.push("/");
                } else {
                    throw new Error("Không nhận được token từ server");
                }
            } else {
                const registerData = {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    password_confirmation: formData.password_confirmation,
                };
                const response = await register(registerData);
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
                    setIsLogin(true); // Chuyển về trang đăng nhập sau khi đăng ký
                    setFormData({ name: "", email: "", password: "", password_confirmation: "", rememberMe: false }); // Reset form
                } else {
                    throw new Error("Không nhận được token từ server");
                }
            }
        } catch (err) {
            const errorResponse = err as any;
            setError(errorResponse.message || (isLogin ? "Đăng nhập thất bại" : "Đăng ký thất bại"));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = async (provider: "google" | "facebook") => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/${provider}/redirect`);
            const data = await response.json();
            window.location.href = data.url;
        } catch (error: any) {
            console.error(`Error initiating ${provider} login:`, error);
            setError(`Không thể khởi tạo đăng nhập ${provider}`);
        }
    };

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UserIcon className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isLogin ? "Đăng nhập" : "Đăng ký"}
                        </h1>
                    </div>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}
                    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                        {!isLogin && (
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Họ và Tên
                                </label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors outline-none disabled:bg-gray-100"
                                        placeholder="Nhập họ và tên"
                                        required={!isLogin}
                                        disabled={isLoading}
                                        aria-label="Họ và tên"
                                    />
                                </div>
                            </div>
                        )}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Địa Chỉ Email
                            </label>
                            <div className="relative">
                                <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors outline-none disabled:bg-gray-100"
                                    placeholder="Nhập email của bạn"
                                    required
                                    disabled={isLoading}
                                    aria-label="Địa chỉ email"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Mật Khẩu
                            </label>
                            <div className="relative">
                                <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors outline-none disabled:bg-gray-100"
                                    placeholder="Nhập mật khẩu"
                                    required
                                    disabled={isLoading}
                                    aria-label="Mật khẩu"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    disabled={isLoading}
                                >
                                    {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        {!isLogin && (
                            <div>
                                <label
                                    htmlFor="password_confirmation"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Xác Nhận Mật Khẩu
                                </label>
                                <div className="relative">
                                    <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showpassword_confirmation ? "text" : "password"}
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        value={formData.password_confirmation}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors outline-none disabled:bg-gray-100"
                                        placeholder="Xác nhận mật khẩu"
                                        required={!isLogin}
                                        disabled={isLoading}
                                        aria-label="Xác nhận mật khẩu"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowpassword_confirmation(!showpassword_confirmation)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        disabled={isLoading}
                                    >
                                        {showpassword_confirmation ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        )}
                        {isLogin && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:cursor-not-allowed"
                                        checked={formData.rememberMe}
                                        onChange={handleCheckboxChange}
                                        disabled={isLoading}
                                        aria-label="Ghi nhớ tôi"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                        Ghi nhớ tôi
                                    </label>
                                </div>
                                <div className="text-sm">
                                    <a href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                                        Quên mật khẩu?
                                    </a>
                                </div>
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${isLoading
                                ? "bg-indigo-400 text-white cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                }`}
                            aria-label={isLoading ? "Đang xử lý" : isLogin ? "Đăng nhập" : "Tạo tài khoản"}
                        >
                            {isLoading ? (
                                <ClipLoader color="#ffffff" />
                            ) : isLogin ? (
                                "Đăng nhập"
                            ) : (
                                "Tạo tài khoản"
                            )}
                        </button>
                    </form>
                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
                            <button
                                type="button"
                                onClick={() => setIsLogin(!isLogin)}
                                className="ml-2 text-blue-600 hover:text-blue-500 font-medium"
                                disabled={isLoading}
                            >
                                {isLogin ? "Đăng ký" : "Đăng nhập"}
                            </button>
                        </p>
                    </div>
                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Hoặc tiếp tục với</span>
                            </div>
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleSocialLogin("google")}
                                type="button"
                                className={`w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors ${isLoading ? "cursor-not-allowed opacity-50" : ""
                                    }`}
                                disabled={isLoading}
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                <span>Google</span>
                            </button>
                            <button
                                onClick={() => handleSocialLogin("facebook")}
                                type="button"
                                className={`w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors ${isLoading ? "cursor-not-allowed opacity-50" : ""
                                    }`}
                                disabled={isLoading}
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                <span>Facebook</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}