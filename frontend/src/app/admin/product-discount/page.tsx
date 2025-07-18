'use client';

import { createProductSale, deleteProductSale, exportProductSale, getAllProductSale, importProductSale, updateProductSale } from '@/services/productSaleServices';
import { ProductSale } from '@/types/productSaleInterface';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FaDownload, FaEdit, FaSearch, FaTrash, FaUpload } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import ProductSaleModal from '../components/ProductSaleModal';
import UpdateProductSaleModel from '../components/UpdateProductSaleModel';


export default function ProductDiscountPage() {
    // STATE LIÊN QUAN ĐẾN LOAD DỮ LIỆU
    const [productSales, setProductSales] = useState<ProductSale[]>([]);
    const [loading, setLoading] = useState(true); // Loading cho lần tải đầu tiên của toàn trang
    const [tableLoading, setTableLoading] = useState(false); // Loading riêng cho bảng
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selected, setSelectedProductSale] = useState<ProductSale | null>(null);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [updateFormErrors, setUpdateFormErrors] = useState<{ [key: string]: string }>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    // STATE CHO PHÂN TRANG
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [lastPage, setLastPage] = useState(1);

    // STATE CHO BỘ LỌC
    const [searchTerm, setSearchTerm] = useState('');

    // HÀM LOAD DỮ LIỆU VỚI BỘ LỌC VÀ PHÂN TRANG
    const fetchProductSales = async (page: number = 1, perPage: number = 10) => {
        setTableLoading(true);
        try {
            const filters = {};
            if (searchTerm) {
                const isNumeric = !isNaN(parseInt(searchTerm));
                if (isNumeric) {
                    filters.product_id = parseInt(searchTerm);
                } else {
                    filters.name = searchTerm;
                }
            }
            const res = await getAllProductSale(page, perPage, filters);
            setProductSales(res.data);
            setTotalItems(res.meta?.total || 0);
            setLastPage(res.meta?.last_page || 1);
        } catch (error) {
            toast.error('Lỗi khi tải danh sách sản phẩm giảm giá');
            console.error(error);
        } finally {
            setTableLoading(false);
        }
    };

    // GỌI API KHI PAGE ĐƯỢC TẢI LẦN ĐẦU HOẶC THAY ĐỔI TRANG
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                await fetchProductSales(currentPage, perPage);
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu ban đầu:', error);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [currentPage, perPage]);

    // GỌI API KHI SEARCH TERM THAY ĐỔI
    useEffect(() => {
        fetchProductSales(currentPage, perPage);
    }, [searchTerm]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= lastPage) {
            setCurrentPage(newPage);
        }
    };

    const handleAddClick = () => {
        setSelectedProductSale(null);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setIsUpdateModalOpen(false);
        setSelectedProductSale(null);
        setUpdateFormErrors({});
    };

    const handleEditClick = (productSale: ProductSale) => {
        setSelectedProductSale(productSale);
        setIsUpdateModalOpen(true);
    };

    // Thêm sản phẩm giảm giá
    const handleAddProductSaleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        setFormErrors({});

        try {
            await createProductSale(formData);
            toast.success('Thêm sản phẩm giảm giá thành công!');
            setIsModalOpen(false);
            form.reset();
            fetchProductSales(currentPage, perPage); // Làm mới dữ liệu với trang hiện tại
        } catch (err: any) {
            if (err.errors) {
                const formatted: { [key: string]: string } = {};
                for (const key in err.errors) {
                    formatted[key] = err.errors[key][0];
                }
                setFormErrors(formatted);
            }
            console.error(err);
        }
    };

    // Cập nhật sản phẩm giảm giá
    const handleUpdateSubmit = async (id: number, formData: FormData) => {
        setUpdateFormErrors({});

        try {
            await updateProductSale(id, formData);
            toast.success('Cập nhật sản phẩm giảm giá thành công!');
            setIsUpdateModalOpen(false);
            fetchProductSales(currentPage, perPage); // Làm mới dữ liệu với trang hiện tại
        } catch (err: any) {
            if (err.errors) {
                const formatted: { [key: string]: string } = {};
                for (const key in err.errors) {
                    formatted[key] = err.errors[key][0];
                }
                setUpdateFormErrors(formatted);
            }
            console.error('Lỗi khi cập nhật sản phẩm giảm giá:', err);
        }
    };

    // Xóa sản phẩm giảm giá
    const handleDelete = async (id: number) => {
        toast((t) => (
            <span className="flex flex-col space-y-2">
                <span>Bạn có chắc muốn xóa sản phẩm giảm giá này?</span>
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            deleteProductSale(id)
                                .then(() => {
                                    toast.success('Xóa sản phẩm giảm giá thành công!');
                                    fetchProductSales(currentPage, perPage); // Làm mới dữ liệu với trang hiện tại
                                })
                                .catch((error) => {
                                    toast.error('Lỗi khi xóa sản phẩm giảm giá!');
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

    // Xử lý nhập Excel
    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const result = await importProductSale(file);
            if (result.success) {
                toast.success('Nhập dữ liệu từ Excel thành công!');
                fetchProductSales(currentPage, perPage); // Làm mới dữ liệu với trang hiện tại
            } else {
                toast.error('Nhập dữ liệu thất bại: ' + (result.errors || 'Lỗi không xác định'));
            }
        } catch (err: any) {
            toast.error('Lỗi khi nhập dữ liệu: ' + (err.errors || 'Lỗi không xác định'));
            console.error(err);
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = ''; // Reset input file
            }
        }
    };

    // Xử lý xuất Excel
    const handleExport = async () => {
        try {
            await exportProductSale();
            toast.success('Xuất dữ liệu thành công!');
        } catch (error) {
            toast.error('Lỗi khi xuất dữ liệu!');
            console.error(error);
        }
    };

    // PHẦN HIỂN THỊ LOADING CHO TOÀN TRANG
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <ClipLoader color="#123abc" size={50} />
            </div>
        );
    }

    // PHẦN HIỂN THỊ BẢNG
    return (
        <div className="overflow-x-auto p-4">
            <div className="flex items-center justify-between bg-gray-200 w-full h-16 px-6 mb-7 rounded">
                <h1 className="text-lg font-semibold">Quản lý sản phẩm giảm giá</h1>
                <div className="flex items-center space-x-2">
                    <div className="relative flex-1 sm:w-80">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Tìm kiếm mã hoặc tên sản phẩm..."
                            className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImport}
                        accept=".xlsx, .xls"
                        className="hidden"
                        id="importFile"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm flex items-center space-x-1"
                    >
                        <FaUpload />
                        <span>Nhập Excel</span>
                    </button>
                    <button
                        onClick={handleExport}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm flex items-center space-x-1"
                    >
                        <FaDownload />
                        <span>Xuất Excel</span>
                    </button>
                    <button
                        onClick={handleAddClick}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                    >
                        Thêm
                    </button>
                </div>
            </div>

            <div className="relative">
                {tableLoading ? (
                    <div className="flex justify-center items-center py-10">
                        <ClipLoader color="#123abc" size={40} />
                    </div>
                ) : (
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                        <thead className="bg-gray-400">
                            <tr>
                                <th className="px-6 py-3 text-left"><input type="checkbox" /></th>
                                <th className="px-6 py-3 text-left">ID</th>
                                <th className="px-6 py-3 text-left">Tên sản phẩm</th>
                                <th className="px-6 py-3 text-left">Mã sản phẩm</th>
                                <th className="px-6 py-3 text-left">Giá giảm</th>
                                <th className="px-6 py-3 text-left">Giá bán hiện tại</th>
                                <th className="px-6 py-3 text-left">Ngày bắt đầu</th>
                                <th className="px-6 py-3 text-left">Ngày kết thúc</th>
                                <th className="px-6 py-3 text-left text-xs font-extrabold uppercase sticky right-0">Hoạt động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productSales.map((p, index) => (
                                <tr key={p.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-200'} hover:bg-gray-300`}>
                                    <td className="px-6 py-3"><input type="checkbox" /></td>
                                    <td className="px-6 py-3 text-sm">{p.id}</td>
                                    <td className="px-6 py-3 text-sm">
                                        {p.product.product_name.length > 25
                                            ? `${p.product.product_name.slice(0, 25)}........`
                                            : p.product.product_name}
                                    </td>
                                    <td className="px-6 py-3 text-sm">{p.product_id}</td>
                                    <td className="px-6 py-3 text-sm">
                                        {
                                            p.sale_price != null
                                                ? `${Number(p.sale_price).toFixed(0)}%`
                                                : 'N/A'
                                        }
                                    </td>
                                    <td className="px-6 py-3 text-sm">
                                        {p.product.buying_price ? (
                                            new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND',
                                            }).format(Number(p.product.buying_price))
                                        ) : (
                                            'N/A'
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-800">
                                        {p.sale_start_date ? (
                                            new Date(p.sale_start_date).toLocaleString('vi-VN', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                            })
                                        ) : (
                                            'N/A'
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-800">
                                        {p.sale_end_date ? (
                                            new Date(p.sale_end_date).toLocaleString('vi-VN', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                            })
                                        ) : (
                                            'N/A'
                                        )}
                                    </td>
                                    <td className={`px-6 py-3 sticky right-0 space-x-2`}>
                                        <button
                                            onClick={() => handleEditClick(p)}
                                            className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 inline-flex items-center space-x-1"
                                        >
                                            <FaEdit className="text-sm" />
                                            <span>Sửa</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(p.id)}
                                            className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 inline-flex items-center space-x-1"
                                        >
                                            <FaTrash className="text-sm" />
                                            <span>Xóa</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
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

            <ProductSaleModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onSubmit={handleAddProductSaleSubmit}
                formErrors={formErrors}
            />

            <UpdateProductSaleModel
                isOpen={isUpdateModalOpen}
                onClose={handleModalClose}
                onSubmit={handleUpdateSubmit}
                productSale={selected}
                formErrors={updateFormErrors}
            />
        </div>
    );
}