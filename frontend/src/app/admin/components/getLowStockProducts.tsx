"use client";

import { getLowStockProducts } from "@/services/productStoreServices";
import { TriangleAlert } from "lucide-react"; // Icon từ lucide-react
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const LowStockAlert = () => {
    const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLowStockProducts = async () => {
            try {
                setLoading(true);
                const response = await getLowStockProducts();
                const products = response.data || [];

                setLowStockProducts(products);

                if (products.length > 0) {
                    toast.error(`🔔 Có ${products.length} sản phẩm sắp hết hàng!`, {
                    });
                }
            } catch (error: any) {
                toast.error(
                    error.errors || "Lỗi khi tải danh sách sản phẩm tồn kho thấp"
                );
                console.error("Lỗi fetch low stock products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLowStockProducts();
    }, []);

    if (loading) {
        return <div className="text-center p-4 text-gray-500">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="w-full mx-auto p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-red-600">
                <TriangleAlert className="w-6 h-6" />
                Danh sách sản phẩm sắp hết hàng
            </h2>

            {lowStockProducts.length === 0 ? (
                <p className="text-green-600 text-lg font-semibold">
                    ✅ Không có sản phẩm nào sắp hết hàng.
                </p>
            ) : (
                <>
                    <p className="text-red-600 font-medium mb-4">
                        Có {lowStockProducts.length} sản phẩm với số lượng tồn kho ≤ 10!
                    </p>

                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden">
                            <thead className="bg-gray-100 text-gray-700 text-sm">
                                <tr>
                                    <th className="px-4 py-2 border-b text-left">Tên sản phẩm</th>
                                    <th className="px-4 py-2 border-b text-center">Số lượng tồn</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-gray-700">
                                {lowStockProducts.map((product, idx) => (
                                    <tr
                                        key={product.product_id}
                                        className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                    >
                                        <td className="px-4 py-2 border-b">{product.product_name}</td>
                                        <td className="px-4 py-2 border-b text-center font-semibold text-red-500">
                                            {product.total_quantity}
                                        </td>
                                        
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default LowStockAlert;
