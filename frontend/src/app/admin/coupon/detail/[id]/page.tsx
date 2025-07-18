'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { showCoupon } from "@/services/couponServices"; // API lấy chi tiết coupon
import { Coupon } from "@/types/couponInterface";

export default function CouponDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [coupon, setCoupon] = useState<Coupon | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchCoupon() {
            setLoading(true);
            try {
                const resolvedParams = await params;
                if (!resolvedParams || !resolvedParams.id) {
                    throw new Error("Params không hợp lệ");
                }

                const id = resolvedParams.id;
                const couponId = Number(id);
                if (isNaN(couponId)) {
                    throw new Error("ID không hợp lệ");
                }

                const response = await showCoupon(couponId);
                setCoupon(response.data);
            } catch (err: any) {
                setError(err.message || "Lỗi không xác định");
            } finally {
                setLoading(false);
            }
        }

        fetchCoupon();
    }, [params]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500">Lỗi: {error}</div>;
    }

    if (!coupon) {
        return <div className="flex justify-center items-center h-screen">Không tìm thấy mã giảm giá</div>;
    }

    return (
        <div>
            <div className="flex items-center justify-between bg-gray-200 w-full h-16 px-6 mb-7 rounded">
                <h1 className="text-lg font-semibold">Chi tiết mã giảm giá</h1>
                <Link href="/admin/coupon">
                    <button className="bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700">
                        Quay lại
                    </button>
                </Link>
            </div>
            <div className="flex flex-col lg:flex-row gap-6 p-6">
                {/* Left Column: Thông tin mã giảm giá */}
                <div className="flex-1 space-y-6">
                    <div className="bg-white p-6 rounded-sm shadow-sm">
                        <h2 className="text-sm font-semibold mb-4">Thông tin mã giảm giá</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Mã giảm giá</label>
                                <input
                                    readOnly
                                    type="text"
                                    value={coupon.code || ""}
                                    className="w-full border rounded-lg p-2 bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Giá trị giảm</label>
                                <input
                                    readOnly
                                    type="text"
                                    value={`${coupon.discount_value || ""} ${coupon.discount_type === "percent" ? "%" : coupon.discount_type === "vnd" ? "VNĐ" : "Miễn phí vận chuyển"}`}
                                    className="w-full border rounded-lg p-2 bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Loại giảm giá</label>
                                <input
                                    readOnly
                                    type="text"
                                    value={coupon.discount_type === "percent" ? "Phần trăm" : coupon.discount_type === "vnd" ? "VNĐ" : "Miễn phí vận chuyển"}
                                    className="w-full border rounded-lg p-2 bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Số lần đã sử dụng</label>
                                <input
                                    readOnly
                                    type="text"
                                    value={coupon.times_used || "0"}
                                    className="w-full border rounded-lg p-2 bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Số lần sử dụng tối đa</label>
                                <input
                                    readOnly
                                    type="text"
                                    value={coupon.max_usage || "Không giới hạn"}
                                    className="w-full border rounded-lg p-2 bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Giá trị đơn hàng tối thiểu</label>
                                <input
                                    readOnly
                                    type="text"
                                    value={coupon.order_amount_limit ? `${coupon.order_amount_limit} VNĐ` : "Không yêu cầu"}
                                    className="w-full border rounded-lg p-2 bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Ngày bắt đầu</label>
                                <input
                                    readOnly
                                    type="text"
                                    value={coupon.coupon_start_date ? new Date(coupon.coupon_start_date).toLocaleString() : "Không có"}
                                    className="w-full border rounded-lg p-2 bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Ngày kết thúc</label>
                                <input
                                    readOnly
                                    type="text"
                                    value={coupon.coupon_end_date ? new Date(coupon.coupon_end_date).toLocaleString() : "Không có"}
                                    className="w-full border rounded-lg p-2 bg-gray-100"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Danh sách sản phẩm áp dụng */}
                    <div className="bg-white p-6 rounded-sm shadow-sm">
                        <h2 className="text-sm font-semibold mb-4">Danh sách sản phẩm áp dụng</h2>
                        {coupon.products && coupon.products.length > 0 ? (
                            <div className="space-y-2">
                                {coupon.products.map((product: Product) => (
                                    <div key={product.id} className="border p-3 rounded-lg">
                                        <p className="text-sm font-medium">Tên sản phẩm: {product.product_name}</p>
                                        <p className="text-sm text-gray-500">ID: {product.id}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">Không có sản phẩm nào áp dụng mã này.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}