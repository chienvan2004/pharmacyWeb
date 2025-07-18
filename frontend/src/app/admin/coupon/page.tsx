'use client';

import { deleteCoupon, getAllCoupons } from '@/services/couponServices';
import { Coupon } from '@/types/couponInterface';
import { useEffect,  useState } from 'react';
import toast from 'react-hot-toast';
import { FaEdit, FaInfoCircle, FaTrash } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import Link from 'next/link';

export default function CouponPage() {
    const [loading, setLoading] = useState(true);
    const [coupons, setCoupons] = useState<Coupon[]>([]);

    // Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [lastPage, setLastPage] = useState(1);

    // Hàm load dữ liệu
    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await getAllCoupons(currentPage, perPage);
            setCoupons(res.data);
            setTotalItems(res.meta?.total || 0);
            setLastPage(res.meta?.last_page || 1);
        } catch (error) {
            toast.error('Lỗi khi tải danh sách coupon');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Gọi API khi page thay đổi
    useEffect(() => {
        fetchCoupons();
    }, [currentPage]);

    // Xử lý chuyển trang
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= lastPage) {
            setCurrentPage(newPage);
        }
    };

    // Xóa
    const handleDelete = async (id: number) => {
        toast((t) => (
            <span className="flex flex-col space-y-2">
                <span>Bạn có chắc muốn xóa coupon này?</span>
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            deleteCoupon(id)
                                .then(() => {
                                    toast.success('Xóa coupon thành công!');
                                    fetchCoupons();
                                })
                                .catch((error) => {
                                    toast.error('Lỗi khi xóa coupon!');
                                    console.error('Lỗi khi xóa:', error);
                                });
                        }}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                    >
                        Xóa
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 text-sm"
                    >
                        Hủy
                    </button>
                </div>
            </span>
        ));
    };

    

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <ClipLoader color="#123abc" size={50} />
            </div>
        );
    }

    return (
        <div className="overflow-x-auto p-4">
            <div className="px-6 flex items-center justify-between bg-gray-200 w-full h-16 mb-7 rounded">
                <h1 className="text-lg font-semibold">Quản lý Coupon</h1>
                <div className="space-x-2">
                    <Link href="/admin/coupon/store">
                        <button
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                        >
                            Thêm
                        </button>
                    </Link>
                </div>
            </div>

            <div className="relative">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                    <thead className="bg-gray-400">
                        <tr>
                            <th className="pl-6 py-3 text-left"><input type="checkbox" /></th>
                            <th className="py-3 text-left">ID</th>
                            <th className="pl-6 py-3 text-left">Mã coupon</th>
                            <th className="py-3 text-left">Giảm giá</th>
                            <th className="py-3 text-left">Ngày hết hạn</th>
                            <th className="py-3 text-left text-xs font-extrabold uppercase sticky right-0">Hoạt động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.map((c, index) => (
                            <tr key={c.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-200'} hover:bg-gray-300`}>
                                <td className="pl-6 py-3"><input type="checkbox" /></td>
                                <td className="py-3 text-sm">{c.id}</td>
                                <td className="pl-6 py-3 text-sm">{c.code}</td>
                                <td className="py-3 text-sm">
                                    {c.discount_value ? (
                                        c.discount_type === 'percent' ? (
                                            `${c.discount_value}%`
                                        ) : c.discount_type === 'vnd' ? (
                                            new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND',
                                            }).format(parseFloat(c.discount_value.toString()))
                                        ) : (
                                            'Miễn phí vận chuyển'
                                        )
                                    ) : (
                                        'N/A'
                                    )}
                                </td>
                                <td className="py-3 text-sm">
                                    {c.coupon_end_date ? new Date(c.coupon_end_date).toLocaleDateString('vi-VN') : 'Chưa có'}
                                </td>
                                
                                <td className="py-3 text-sm sticky right-0">
                                    <div className="flex items-center space-x-2">
                                        <Link href={`/admin/coupon/detail/${c.id}`}>
                                            <FaInfoCircle className="text-blue-500 cursor-pointer" />
                                        </Link>
                                        <Link href={`/admin/coupon/update/${c.id}`}>
                                            <FaEdit className="text-yellow-500 cursor-pointer" />
                                        </Link>
                                        <button onClick={() => handleDelete(c.id)}>
                                            <FaTrash className="text-red-500" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* PHÂN TRANG */}
            <div className="flex justify-between items-center mt-4 px-4 py-3 bg-gray-100 rounded-lg">
                <div className="text-sm text-gray-700">
                    Hiển thị từ {(currentPage - 1) * perPage + 1} đến {Math.min(currentPage * perPage, totalItems)} của {totalItems} kết quả
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Trước
                    </button>
                    {Array.from({ length: lastPage }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 ${currentPage === page
                                ? 'bg-blue-500 text-white'
                                : 'bg-white border border-gray-300'
                                } rounded-md text-sm`}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === lastPage}
                        className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Sau
                    </button>
                </div>
            </div>
        </div>
    );
}