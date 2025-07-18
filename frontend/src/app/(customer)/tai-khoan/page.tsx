"use client";
import { changePassword, getProfile, updateProfile } from "@/services/authServices";
import { User } from "@/types/userInterface";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FaEdit, FaLock, FaSave, FaUserCircle } from "react-icons/fa";
import { ClipLoader } from "react-spinners";

export default function AccountPage() {
    const oldPasswordRef = useRef<HTMLInputElement>(null);
    const [user, setUser] = useState<User | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone_number: "",
        avatar: null as File | null,
    });
    const [passwordData, setPasswordData] = useState({
        old_password: "",
        new_password: "",
        password_confirmation: "",
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        inputRef.current?.focus();
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const data = await getProfile();
                setUser(data);
                setFormData({
                    name: data.name || "",
                    email: data.email || "",
                    phone_number: data.phone_number || "",
                    avatar: null,
                });
            } catch (error) {
                console.error("Error fetching profile:", error);
                setError("Không thể tải thông tin tài khoản");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);
    useEffect(() => {
        if (isChangingPassword) {
            setTimeout(() => {
                oldPasswordRef.current?.focus();
            }, 0);
        }
    }, [isChangingPassword]);

    if (loading || !user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <ClipLoader size={48} color="#2563EB" />
            </div>
        );
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData((prev) => ({ ...prev, avatar: e.target.files[0] }));
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const formDataToSend = new FormData();
            formDataToSend.append("name", formData.name);
            formDataToSend.append("email", formData.email);
            formDataToSend.append("phone_number", formData.phone_number);
            if (formData.avatar) {
                formDataToSend.append("avatar", formData.avatar);
            }

            const updatedUser = await updateProfile(formDataToSend);
            setUser(updatedUser);
            setIsEditing(false);
            setError(null);
        } catch (error) {
            setError((error as any)?.message || "Cập nhật thất bại");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.password_confirmation) {
            setError("Mật khẩu mới và xác nhận mật khẩu không khớp");
            return;
        }
        try {
            setLoading(true);
            await changePassword({
                old_password: passwordData.old_password,
                new_password: passwordData.new_password,
            });
            setIsChangingPassword(false);
            setPasswordData({ old_password: "", new_password: "", password_confirmation: "" });
            setError("Đổi mật khẩu thành công");
        } catch (error) {
            setError((error as any)?.message || "Đổi mật khẩu thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow p-6 max-w-6xl mx-auto">
            <h2 className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2">Thông tin cá nhân</h2>

            {!isEditing && !isChangingPassword ? (
                <>
                    <div className="flex justify-center mb-6">
                        <div className="w-24 h-24 rounded-full overflow-hidden">
                            {user.avatar ? (
                                <Image
                                    src={`http://localhost:8000/storage/${user.avatar}`}
                                    alt="Avatar"
                                    width={96}
                                    height={96}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white text-5xl">
                                    <FaUserCircle />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4 px-4 md:px-10 w-full mx-auto">
                        <div className="flex justify-between border-b border-gray-200 py-2">
                            <span className="text-gray-500">Họ và tên</span>
                            <span className="font-medium">{user.name || "Chưa có"}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 py-2">
                            <span className="text-gray-500">Số điện thoại</span>
                            <span className="font-medium">{user.phone_number || "Chưa có"}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 py-2">
                            <span className="text-gray-500">Email</span>
                            <span className="font-medium">{user.email || "Chưa có"}</span>
                        </div>
                    </div>

                    <div className="flex justify-center mt-6 space-x-4">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-blue-100 text-blue-600 px-6 py-2 rounded-full font-medium hover:bg-blue-200 flex items-center"
                        >
                            <FaEdit className="mr-2" /> Cập nhật thông tin
                        </button>
                        <button
                            onClick={() => setIsChangingPassword(true)}
                            className="bg-blue-100 text-blue-600 px-6 py-2 rounded-full font-medium hover:bg-blue-200 flex items-center"
                        >
                            <FaLock className="mr-2" /> Đổi mật khẩu
                        </button>
                    </div>
                </>
            ) : isEditing ? (
                <form onSubmit={handleUpdateSubmit} className="space-y-4 px-4 md:px-10 w-full mx-auto">
                    <div className="flex justify-between border-b border-gray-200 py-2">
                        <span className="text-gray-500">Họ và tên</span>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-1/2 p-1 border-none focus:outline-none bg-transparent font-medium text-right"
                        />
                    </div>
                    <div className="flex justify-between border-b border-gray-200 py-2">
                        <span className="text-gray-500">Số điện thoại</span>
                        <input
                            type="text"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleInputChange}
                            className="w-1/2 p-1 border-none focus:outline-none bg-transparent font-medium text-right"
                        />
                    </div>
                    <div className="flex justify-between border-b border-gray-200 py-2">
                        <span className="text-gray-500">Email</span>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-1/2 p-1 border-none focus:outline-none bg-transparent font-medium text-right"
                        />
                    </div>
                    <div className="flex justify-between border-b border-gray-200 py-2">
                        <span className="text-gray-500">Ảnh đại diện</span>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-1/2 p-1 border-none focus:outline-none"
                        />
                    </div>

                    {error && <p className="text-red-500 text-center">{error}</p>}

                    <div className="flex justify-center mt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-100 text-blue-600 px-6 py-2 rounded-full font-medium hover:bg-blue-200 flex items-center"
                        >
                            {loading ? <ClipLoader size={20} color="#2563EB" /> : <FaSave className="mr-2" />} Lưu thay đổi
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="ml-4 bg-gray-200 text-gray-600 px-6 py-2 rounded-full font-medium hover:bg-gray-300"
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-4 px-4 md:px-10 w-full mx-auto">
                    <div className="flex justify-between border-b border-gray-200 py-2">
                        <span className="text-gray-500">Mật khẩu cũ :</span>
                        <input
                            ref={oldPasswordRef}
                            type="password"
                            name="old_password"
                            value={passwordData.old_password}
                            onChange={handlePasswordChange}
                            className="w-1/2 p-1 border-none focus:outline-none bg-transparent font-medium text-right"
                        />

                    </div>
                    <div className="flex justify-between border-b border-gray-200 py-2">
                        <span className="text-gray-500">Mật khẩu mới :</span>
                        <input
                            type="password"
                            name="new_password"
                            value={passwordData.new_password}
                            onChange={handlePasswordChange}
                            className="w-1/2 p-1 border-none focus:outline-none bg-transparent font-medium text-right"
                        />
                    </div>
                    <div className="flex justify-between border-b border-gray-200 py-2">
                        <span className="text-gray-500">Xác nhận mật khẩu mới :</span>
                        <input
                            type="password"
                            name="password_confirmation"
                            value={passwordData.password_confirmation}
                            onChange={handlePasswordChange}
                            className="w-1/2 p-1 border-none focus:outline-none bg-transparent font-medium text-right"
                        />
                    </div>

                    {error && <p className="text-red-500 text-center">{error}</p>}

                    <div className="flex justify-center mt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-100 text-blue-600 px-6 py-2 rounded-full font-medium hover:bg-blue-200 flex items-center"
                        >
                            {loading ? <ClipLoader size={20} color="#2563EB" /> : <FaSave className="mr-2" />} Lưu thay đổi
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsChangingPassword(false)}
                            className="ml-4 bg-gray-200 text-gray-600 px-6 py-2 rounded-full font-medium hover:bg-gray-300"
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}