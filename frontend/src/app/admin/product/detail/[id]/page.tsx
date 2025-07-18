'use client';

import Detail from "@/app/admin/components/Detail";
import { showProduct } from "@/services/productsServices";
import { Product } from "@/types/productInterface";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const BASE_URL = 'http://localhost:8000/';

    useEffect(() => {
        async function fetchProduct() {
            setLoading(true);
            try {
                const resolvedParams = await params;
                if (!resolvedParams || !resolvedParams.id) {
                    throw new Error("Params không hợp lệ");
                }

                const id = resolvedParams.id;
                const productId = Number(id);
                if (isNaN(productId)) {
                    throw new Error("ID không hợp lệ");
                }

                const response = await showProduct(productId);
                setProduct(response.data);
            } catch (err: any) {
                setError(err.message || "Lỗi không xác định");
            } finally {
                setLoading(false);
            }
        }

        fetchProduct();
    }, [params]);


    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <ClipLoader color="#123abc" size={50} />
            </div>
        );
    }


    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500">Lỗi: {error}</div>;
    }

    if (!product) {
        return <div className="flex justify-center items-center h-screen">Không tìm thấy sản phẩm</div>;
    }

    return (
        <div>
            <div className="flex items-center justify-between bg-gray-200 w-full h-16 px-6 mb-7 rounded">
                <h1 className="text-lg font-semibold">Thông tin chi tiết</h1>
                <Link href="/admin/product">
                    <button className="bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700">
                        Quay lại
                    </button>
                </Link>
            </div>
            <div className="flex flex-col lg:flex-row gap-6 p-6">
                {/* Left Column */}
                <div className="flex-1 space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white p-6 rounded-sm shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">Tên sản phẩm</label>
                                <input
                                    readOnly
                                    type="text"
                                    value={product.product_name || ""}
                                    className="w-full border rounded-lg p-2 bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Danh mục</label>
                                <input
                                    readOnly
                                    type="text"
                                    value={product.categories?.[0]?.category_name || ""}
                                    className="w-full border rounded-lg p-2 bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Thương hiệu</label>
                                <input
                                    readOnly
                                    type="text"
                                    value={product.brands?.[0]?.brand_name || ""}
                                    className="w-full border rounded-lg p-2 bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Giá nhập</label>
                                <input
                                    readOnly
                                    type="text"
                                    value={product.product_store?.root_price || ""}
                                    className="w-full border rounded-lg p-2 bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Giá bán</label>
                                <input
                                    readOnly
                                    type="text"
                                    value={product.buying_price || ""}
                                    className="w-full border rounded-lg p-2 bg-gray-100"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Tags</label>
                                <input
                                    readOnly
                                    type="text"
                                    value={product.tags?.map((tag) => tag.tag_name).join(", ") || ""}
                                    className="w-full border rounded-lg p-2 bg-gray-100"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Thông tin chi tiết sản phẩm */}
                    <div className="bg-white p-6 rounded-sm shadow-sm">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Miêu tả chi tiết</label>
                            <Detail content={product.product_description?.toString() ?? ""} />
                        </div>
                    </div>

                    {/* Product Images */}
                    <div className="bg-white p-6 rounded-sm shadow-sm">
                        <h2 className="text-sm font-semibold mb-4">Hình ảnh sản phẩm</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {product.images && product.images.length > 0 ? (
                                product.images.map((img, index) => (
                                    <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                        <Image
                                            src={`${BASE_URL}${img.image}`}
                                            alt={product.product_name || `Hình ảnh ${index + 1}`}
                                            width={500}
                                            height={500}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))
                            ) : (
                                <div>Không có hình ảnh</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="w-full lg:w-80 space-y-6">
                    {/* Status */}
                    <div className="bg-white p-6 rounded-sm shadow-sm">
                        <h2 className="text-sm font-semibold mb-4">Trạng thái</h2>
                        <div className="space-y-2">
                            <div>
                                <label className="block text-sm font-medium mb-1">Hiển thị</label>
                                <select
                                    className="w-full border rounded-lg p-2"
                                    value={product.disable_out_of_stock ? "true" : "false"}
                                    disabled
                                >
                                    <option value="false">Cho phép đặt hàng</option>
                                    <option value="true">Không cho phép đặt hàng</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Tồn kho</label>
                                <input
                                    readOnly
                                    type="text"
                                    value={product.total_quantity || 0}
                                    className="w-full border rounded-lg p-2 bg-gray-100"
                                />
                                <span className="text-xs text-gray-500">trong kho</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}