'use client';

import { getAllBrands } from '@/services/brandServices';
import { getAllCategories } from '@/services/categoryServices';
import {
    deleteProduct,
    exportProduct,
    getAllProducts,
    importProduct,
    updateProduct,
} from '@/services/productsServices';
import { Brand } from '@/types/brandInterface';
import { Category } from '@/types/categoryInterface';
import { Product } from '@/types/productInterface';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FaEdit, FaInfoCircle, FaSearch, FaToggleOff, FaToggleOn, FaTrash } from 'react-icons/fa';
import Select from 'react-select';
import { ClipLoader } from 'react-spinners';
import Pagination from '../../component/button/Pagination';

export default function ProductPage() {
    const [loading, setLoading] = useState(true); // Loading cho lần tải đầu tiên của toàn trang
    const [tableLoading, setTableLoading] = useState(false); // Loading riêng cho bảng sản phẩm
    const [products, setProducts] = useState<Product[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [lastPage, setLastPage] = useState(1);

    // Filters
    const [filters, setFilters] = useState({
        name: '',
        categories: [] as string[],
        brands: [] as string[],
    });

    // Fetch data
    const fetchProducts = async () => {
        setTableLoading(true); // Chỉ bật loading cho bảng
        try {
            const res = await getAllProducts(currentPage, perPage, {
                name: filters.name || undefined,
                categories: filters.categories.length > 0 ? filters.categories : undefined,
                brands: filters.brands.length > 0 ? filters.brands : undefined,
            });
            setProducts(res.data || []);
            setTotalItems(res.meta?.total ?? 0);
            setLastPage(res.meta?.last_page ?? 1);
        } catch (error) {
            toast.error('Lỗi khi tải danh sách thuốc');
            console.error('Lỗi fetch thuốc:', error);
        } finally {
            setTableLoading(false); // Tắt loading cho bảng
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await getAllCategories();
            setCategories(res.data || []);
        } catch (error) {
            console.error('Lỗi khi tải danh mục:', error);
        }
    };

    const fetchBrands = async () => {
        try {
            const res = await getAllBrands();
            setBrands(res.data || []);
        } catch (error) {
            console.error('Lỗi khi tải thương hiệu:', error);
        }
    };

    // Initial load
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true); // Bật loading toàn trang
            try {
                await Promise.all([
                    fetchCategories(),
                    fetchBrands(),
                    fetchProducts(),
                ]);
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu ban đầu:', error);
            } finally {
                setLoading(false); // Tắt loading toàn trang
            }
        };
        loadInitialData();
    }, []);

    // Fetch products when filters or currentPage changes
    useEffect(() => {
        fetchProducts();
    }, [currentPage, filters]);

    // Handle search
    const handleSearch = () => {
        setCurrentPage(1);
        // fetchProducts sẽ được gọi tự động qua useEffect
    };

    // Handle filter changes
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleMultiSelectChange = (selectedOptions: any, field: string) => {
        const values = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
        setFilters((prev) => ({
            ...prev,
            [field]: values,
        }));
    };

    const handleResetFilters = () => {
        setFilters({
            name: '',
            categories: [],
            brands: [],
        });
        setCurrentPage(1);
        // fetchProducts sẽ được gọi tự động qua useEffect
    };

    const handleDelete = async (id: number) => {
        toast((t) => (
            <span className="flex flex-col space-y-2">
                <span>Bạn có chắc muốn xóa thuốc này?</span>
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            deleteProduct(id)
                                .then(() => {
                                    toast.success('Xóa thuốc thành công!');
                                    fetchProducts();
                                })
                                .catch((error) => {
                                    toast.error('Lỗi khi xóa thuốc: ' + (error.errors || 'Lỗi không xác định'));
                                    console.error('Lỗi khi xóa:', error);
                                });
                        }}
                        className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 text-sm"
                    >
                        Xóa
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="bg-gray-300 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-400 text-sm"
                    >
                        Hủy
                    </button>
                </div>
            </span>
        ));
    };

    const handleToggleStatus = async (product: Product) => {
        const newStatus = !product.active;
        const formData = new FormData();
        formData.append('active', newStatus ? '1' : '0');

        try {
            await updateProduct(product.id, formData);
            toast.success(`Đã ${newStatus ? 'bật' : 'tắt'} trạng thái thuốc`);
            fetchProducts();
        } catch (err) {
            toast.error('Lỗi khi thay đổi trạng thái: ' + (err.errors || 'Lỗi không xác định'));
            console.error(err);
        }
    };

    const handleExport = async () => {
        try {
            await exportProduct();
            toast.success('Xuất file Excel thành công!');
        } catch (error) {
            toast.error('Lỗi khi xuất file Excel: ' + (error.message || 'Lỗi không xác định'));
            console.error(error);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            await importProduct(file);
            toast.success('Nhập dữ liệu từ Excel thành công!');
            fetchProducts();
        } catch (error) {
            toast.error('Lỗi khi nhập file Excel: ' + (error.errors || 'Lỗi không xác định'));
            console.error(error);
        } finally {
            e.target.value = '';
        }
    };

    const renderTableBody = useMemo(() => {
        return (
            <tbody>
                {products.map((p, index) => (
                    <tr key={p.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors duration-150`}>
                        <td className="px-6 py-4"><input type="checkbox" className="h-4 w-4 text-blue-600 rounded" /></td>
                        <td className="px-6 py-4 text-sm text-gray-700">{p.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{p.product_name || 'Chưa có tên'}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                            {p.buying_price && !isNaN(parseFloat(p.buying_price)) ? (
                                new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                }).format(parseFloat(p.buying_price))
                            ) : (
                                'N/A'
                            )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{p.brands && p.brands.length > 0 ? p.brands[0].brand_name : 'Không có thương hiệu'}</td>
                        <td className="px-6 py-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                                {p.images && Array.isArray(p.images) && p.images.length > 0 ? (
                                    (() => {
                                        const mainImage = p.images.find((img) => img.is_main) || p.images[0];
                                        return (
                                            <Image
                                                src={`http://localhost:8000/${mainImage.image}`}
                                                alt={mainImage.image || 'Ảnh thuốc'}
                                                width={48}
                                                height={48}
                                                className="object-cover rounded-md"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/placeholder-image.jpg';
                                                }}
                                            />
                                        );
                                    })()
                                ) : (
                                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                )}
                            </div>
                        </td>
                        <td className="px-6 py-4 sticky right-0">
                            <div className="flex items-center space-x-3">
                                <button onClick={() => handleToggleStatus(p)} className="text-lg">
                                    {p.active ? <FaToggleOn className="text-green-600" /> : <FaToggleOff className="text-gray-400" />}
                                </button>
                                <Link href={`/admin/product/detail/${p.id}`}>
                                    <FaInfoCircle className="text-blue-600 hover:text-blue-700" />
                                </Link>
                                <Link href={`/admin/product/update/${p.id}`}>
                                    <FaEdit className="text-yellow-600 hover:text-yellow-700" />
                                </Link>
                                <button onClick={() => handleDelete(p.id)}>
                                    <FaTrash className="text-red-600 hover:text-red-700" />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        );
    }, [products]);

    const categoryOptions = categories.map((cat) => ({
        value: cat.category_name,
        label: cat.category_name,
    }));

    const brandOptions = brands.map((brand) => ({
        value: brand.brand_name,
        label: brand.brand_name,
    }));

    // Loading toàn trang cho lần tải đầu tiên
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <ClipLoader color="#2563eb" size={60} />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 min-h-screen">
            {/* Header Section with Search and Action Buttons */}
            <div className="bg-gray-200 p-4 sm:p-6 rounded-lg shadow-lg mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý thuốc</h1>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-80">
                            <input
                                type="text"
                                name="name"
                                value={filters.name}
                                onChange={handleFilterChange}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Tìm kiếm thuốc..."
                                className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleExport}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-150 text-sm"
                            >
                                Xuất Excel
                            </button>
                            <button
                                onClick={handleImportClick}
                                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors duration-150 text-sm"
                            >
                                Nhập Excel
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <Link href="/admin/product/store">
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-150 text-sm">
                                    Thêm thuốc
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="z-50">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                        <Select
                            isMulti
                            options={categoryOptions}
                            onChange={(selected) => handleMultiSelectChange(selected, 'categories')}
                            value={categoryOptions.filter((option) => filters.categories.includes(option.value))}
                            className="text-sm"
                            classNamePrefix="select"
                            placeholder="Chọn danh mục..."
                        />
                    </div>
                    <div className="z-50">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Thương hiệu</label>
                        <Select
                            isMulti
                            options={brandOptions}
                            onChange={(selected) => handleMultiSelectChange(selected, 'brands')}
                            value={brandOptions.filter((option) => filters.brands.includes(option.value))}
                            className="text-sm"
                            classNamePrefix="select"
                            placeholder="Chọn thương hiệu..."
                        />
                    </div>
                    <div>
                        <button
                            onClick={handleResetFilters}
                            className="bg-gray-200 text-gray-800 px-4 py-3 mt-5 rounded-lg hover:bg-gray-300 transition-colors duration-150 text-sm"
                        >
                            Chọn lại
                        </button>
                    </div>
                </div>
            </div>

            {/* Product Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-x-auto relative">
                {tableLoading ? (
                    <div className="flex justify-center items-center py-10">
                        <ClipLoader color="#2563eb" size={40} />
                    </div>
                ) : (
                    <table className="min-w-full table-auto">
                        <thead className="bg-gray-200 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700"><input type="checkbox" className="h-4 w-4 text-blue-600 rounded" /></th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ID</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tên thuốc</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Giá bán</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Thương hiệu</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Ảnh thuốc</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 sticky right-0 bg-gray-200">Hoạt động</th>
                            </tr>
                        </thead>
                        {renderTableBody}
                    </table>
                )}
            </div>

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                perPage={perPage}
                totalItems={totalItems}
                lastPage={lastPage}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}