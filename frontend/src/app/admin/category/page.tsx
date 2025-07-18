'use client';

import StoreCategoryModal from '@/app/admin/components/StoreCategoryModal';
import UpdateCategoryModal from '@/app/admin/components/UpdateCategoryModal';
import { createCategory, deleteCategory, exportCategory, getAllCategories, importCategory, showCategory, updateCategory } from '@/services/categoryServices';
import { Category } from '@/types/categoryInterface';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FaEdit, FaInfoCircle, FaToggleOff, FaToggleOn, FaTrash } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import ShowCategoryModal from '../components/ShowCategoryModal';

export default function CategoryPage() {
    // STATE LIÊN QUAN ĐẾN LOAD DỮ LIỆU
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedCategory, setselectedCategory] = useState<Category | null>(null);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [updateFormErrors, setUpdateFormErrors] = useState<{ [key: string]: string }>({});
    const [isShowModalOpen, setIsShowModalOpen] = useState(false);


    //phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [lastPage, setLastPage] = useState(1);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // HÀM LOAD DỮ LIỆU
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await getAllCategories(currentPage, perPage);
            setCategories(res.data);
            console.log(res.data)
            setTotalItems(res.meta?.total || 0);
            setLastPage(res.meta?.last_page || 1);
        } catch (error) {
            toast.error('Lỗi khi tải danh sách danh mục');
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    // GỌI API KHI PAGE THAY ĐỔI
    useEffect(() => {
        fetchCategories();
    }, [currentPage]); // Chạy lại khi currentPage thay đổi

    // XỬ LÝ CHUYỂN TRANG
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= lastPage) {
            setCurrentPage(newPage);
        }
    };


    const handleAddClick = () => {
        setselectedCategory(null); // reset
        setIsModalOpen(true);
    };

    const handleEditClick = (category: Category) => {
        setselectedCategory(category);
        setIsUpdateModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setIsUpdateModalOpen(false);
        setselectedCategory(null);
        setUpdateFormErrors({});
    };

    //thêm
    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        setFormErrors({}); // reset lỗi trước đó

        try {
            await createCategory(formData);
            toast.success('Thêm danh mục thành công!');
            setIsModalOpen(false);
            form.reset();
            fetchCategories();
        } catch (error: any) {
            if (error.errors) {
                const formatted: { [key: string]: string } = {};
                for (const key in error.errors) {
                    formatted[key] = error.errors[key][0]; 
                }
                setFormErrors(formatted);
            }
            console.error(error);
        }
    };

    //cập nhật thương hiêu
    const handleUpdateSubmit = async (id: number, formData: FormData) => {
        setUpdateFormErrors({}); // reset lỗi

        try {
            await updateCategory(id, formData);
            toast.success('Cập nhật danh mục thành công!');
            setIsUpdateModalOpen(false);
            fetchCategories();
        } catch (err: any) {
            if (err.errors) {
                const formatted: { [key: string]: string } = {};
                for (const key in err.errors) {
                    formatted[key] = err.errors[key][0];
                }
                setUpdateFormErrors(formatted);
            }
            console.error('Lỗi khi cập nhật danh mục:', err);
        }
    };

    //xóa
    const handleDelete = async (id: number) => {
        toast((t) => (
            <span className="flex flex-col space-y-2">
                <span>Bạn có chắc muốn xóa danh mục này?</span>
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            deleteCategory(id)
                                .then(() => {
                                    toast.success('Xóa danh mục thành công!');
                                    fetchCategories();
                                })
                                .catch((error) => {
                                    toast.error(error.response.data.message);
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
        ), {
            duration: 5000,
        });
    };

    //xem chi tiết
    const handleViewDetails = async (id: number) => {
        try {
            const res = await showCategory(id);
            setselectedCategory(res.data);
            setIsShowModalOpen(true);
        } catch (err) {
            toast.error('Không thể tải chi tiết danh mục');
            console.log(err)
        }
    };

    //thay đổi trang thái
    const handleToggleStatus = async (category: Category) => {
        const newStatus = !category.active;
        const formData = new FormData();
        formData.append('active', newStatus ? '1' : '0');
        console.log(newStatus);

        try {
            await updateCategory(category.id, formData);
            toast.success(`Đã ${newStatus ? 'bật' : 'tắt'} trạng thái danh mục`);
            fetchCategories(); // refresh lại danh sách
        } catch (err) {
            toast.error('Lỗi khi thay đổi trạng thái');
            console.error(err);
        }
    };


    const handleExport = async () => {
        try {
            await exportCategory();
            toast.success('Xuất file Excel thành công!');
        } catch (error) {
            toast.error('Lỗi khi xuất file Excel');
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
            await importCategory(file);
            toast.success('Nhập dữ liệu từ Excel thành công!');
            fetchCategories();
        } catch (error) {
            toast.error('Lỗi khi nhập file Excel');
            console.error(error);
        } finally {
            e.target.value = ''; // reset input để cho phép chọn lại cùng 1 file
        }
    };

    // PHẦN HIỂN THỊ LOADING
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
                <h1 className="text-lg font-semibold">Quản lí danh mục</h1>
                <div className="space-x-2">
                    <button
                        onClick={handleExport}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                    >
                        Xuất Excel
                    </button>
                    <button
                        onClick={handleImportClick}
                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 text-sm"
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
                    <button
                        onClick={handleAddClick}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                    >
                        Thêm
                    </button>
                </div>
            </div>

            <div className="relative">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                    <thead className="bg-gray-400">
                        <tr>
                            <th className="px-6 py-3 text-left"><input type="checkbox" /></th>
                            <th className="px-6 py-3 text-left">ID</th>
                            <th className="px-6 py-3 text-left">Tên danh mục</th>
                            <th className="px-6 py-3 text-left">Tên danh mục gốc</th>
                            <th className="px-6 py-3 text-left">Icon</th>
                            <th className="px-6 py-3 text-left text-xs font-extrabold uppercase sticky right-0">Hoạt động</th>

                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((c, index) => (
                            <tr key={c.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-200'} hover:bg-gray-300`}>
                                <td className="px-6 py-3"><input type="checkbox" /></td>
                                <td className="px-6 py-3 text-sm">{c.id}</td>
                                <td className="px-6 py-3 text-sm">{c.category_name}</td>
                                <td className="px-6 py-3 text-sm">
                                    {c.parent_category ? c.parent_category.category_name : <p className="text-gray-300 text-sm">Không có</p>}
                                </td>
                                <td className="px-6 py-3 text-sm">
                                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                        {c?.icon ? (
                                            <div className="relative w-12 h-12 overflow-hidden rounded">
                                                <Image
                                                    src={`http://localhost:8000/${c.icon}`}
                                                    alt={c.category_name}
                                                    layout="fill"
                                                    objectFit="cover"
                                                />
                                            </div>
                                        ) : (
                                            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        )}
                                    </div>
                                </td>
                                <td className={`px-6 py-3 sticky right-0 space-x-2 `}>
                                    <button
                                        onClick={() => handleEditClick(c)}
                                        className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 inline-flex items-center space-x-1">
                                        <FaEdit className="text-sm" />
                                        <span>Sửa</span>
                                    </button>
                                    <button onClick={() => handleDelete(c.id)} className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 inline-flex items-center space-x-1">
                                        <FaTrash className="text-sm" />
                                        <span>Xóa</span>
                                    </button>
                                    <button onClick={() => handleViewDetails(c.id)} className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 inline-flex items-center space-x-1">
                                        <FaInfoCircle className="text-sm" />
                                        <span>Chi tiết</span>
                                    </button>
                                    <button
                                        onClick={() => handleToggleStatus(c)}
                                        className={`${c.active ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-400 hover:bg-gray-500'
                                            } text-white px-2 py-1 rounded text-xs inline-flex items-center space-x-1`}
                                    >
                                        {c.active ? <FaToggleOn className="text-sm" /> : <FaToggleOff className="text-sm" />}
                                        <span>{c.active ? 'Kích hoạt' : 'Ngưng kích hoạt'}</span>
                                    </button>
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
            <StoreCategoryModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onSubmit={handleAddSubmit}
                formErrors={formErrors}
                categories={categories}
            />

            <UpdateCategoryModal
                isOpen={isUpdateModalOpen}
                onClose={handleModalClose}
                onSubmit={handleUpdateSubmit}
                category={selectedCategory}
                formErrors={updateFormErrors}
                categories={categories}
            />

            <ShowCategoryModal
                isOpen={isShowModalOpen}
                onClose={() => setIsShowModalOpen(false)}
                category={selectedCategory}
            />
        </div>
    );
}