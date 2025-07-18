'use client';

import ShowBrandModal from '@/app/admin/components/ShowBrandModal';
import StoreBrandModal from '@/app/admin/components/StoreBrandModal';
import UpdateBrandModal from '@/app/admin/components/UpdateBrandModal';

import { createBrand, deleteBrand, exportBrand, getAllBrands, importBrand, showBrand, updateBrand } from '@/services/brandServices';
import { Brand } from '@/types/brandInterface';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FaEdit, FaInfoCircle, FaToggleOff, FaToggleOn, FaTrash } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';


export default function BrandPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [updateFormErrors, setUpdateFormErrors] = useState<{ [key: string]: string }>({});
    const [isShowModalOpen, setIsShowModalOpen] = useState(false);

    //PHÂN TRANG
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [lastPage, setLastPage] = useState(1);
    const fileInputRef = useRef<HTMLInputElement>(null);


    //lấy danh sách
    const fetchBrands = async () => {
        setLoading(true);
        try {
            const res = await getAllBrands(currentPage, perPage);
            setBrands(res.data);
            setTotalItems(res.meta?.total || 0);
            setLastPage(res.meta?.last_page || 1);
        } catch (error) {
            toast.error('Lỗi khi tải danh sách thương hiệu');
            console.log(error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchBrands();
    }, [currentPage]);

    //phân trang
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= lastPage) {
            setCurrentPage(newPage);
        }
    };

    const handleAddClick = () => {
        setSelectedBrand(null); // reset
        setIsModalOpen(true);
    };

    const handleEditClick = (brand: Brand) => {
        setSelectedBrand(brand);
        setIsUpdateModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setIsUpdateModalOpen(false);
        setSelectedBrand(null);
        setUpdateFormErrors({});
    };

    //thêm
    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        setFormErrors({}); // reset lỗi trước đó

        try {
            await createBrand(formData);
            toast.success('Thêm thương hiệu thành công!');
            setIsModalOpen(false);
            form.reset();
            fetchBrands();
        } catch (err: any) {
            if (err.errors) {
                const formatted: { [key: string]: string } = {};
                for (const key in err.errors) {
                    formatted[key] = err.errors[key][0]; // chỉ lấy lỗi đầu tiên
                }
                setFormErrors(formatted);
            }
            console.error(err);
        }
    };

    //cập nhật thương hiêu
    const handleUpdateSubmit = async (id: number, formData: FormData) => {
        setUpdateFormErrors({}); // reset lỗi

        try {
            await updateBrand(id, formData);
            toast.success('Cập nhật thương hiệu thành công!');
            setIsUpdateModalOpen(false);
            fetchBrands();
        } catch (err: any) {
            if (err.errors) {
                const formatted: { [key: string]: string } = {};
                for (const key in err.errors) {
                    formatted[key] = err.errors[key][0];
                }
                setUpdateFormErrors(formatted);
            }
            console.error('Lỗi khi cập nhật thương hiệu:', err);
        }
    };

    //xóa
    const handleDelete = async (id: number) => {
        toast((t) => (
            <span className="flex flex-col space-y-2">
                <span>Bạn có chắc muốn xóa thương hiệu này?</span>
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            deleteBrand(id)
                                .then(() => {
                                    toast.success('Xóa thương hiệu thành công!');
                                    fetchBrands();
                                })
                                .catch((error) => {
                                    toast.error(error.response.data.message);
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
            const res = await showBrand(id);
            setSelectedBrand(res.data);
            setIsShowModalOpen(true);
        } catch (err) {
            toast.error('Không thể tải chi tiết thương hiệu');
            console.log(err)
        }
    };

    //thay đổi trang thái
    const handleToggleStatus = async (brand: Brand) => {
        const newStatus = !brand.active;
        const formData = new FormData();
        formData.append('active', newStatus ? '1' : '0');
        console.log(newStatus);

        try {
            await updateBrand(brand.id, formData);
            toast.success(`Đã ${newStatus ? 'bật' : 'tắt'} trạng thái thương hiệu`);
            fetchBrands(); // refresh lại danh sách
        } catch (err) {
            toast.error('Lỗi khi thay đổi trạng thái');
            console.error(err);
        }
    };


    const handleExport = async () => {
        try {
            await exportBrand();
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
            await importBrand(file);
            toast.success('Nhập dữ liệu từ Excel thành công!');
            fetchBrands();
        } catch (error) {
            toast.error('Lỗi khi nhập file Excel');
            console.error(error);
        } finally {
            e.target.value = ''; // reset input để cho phép chọn lại cùng 1 file
        }
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
            {/* hearder */}
            <div className="flex items-center justify-between bg-gray-200 w-full h-16 px-6 mb-7 rounded">
                <h1 className="text-lg font-semibold">Quản lí thương hiệu</h1>
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
                            <th className="px-6 py-3 text-left text-xs font-extrabold uppercase">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-extrabold uppercase">Tên thương hiệu</th>
                            <th className="px-6 py-3 text-left text-xs font-extrabold uppercase">Logo</th>
                            <th className="px-6 py-3 text-left text-xs font-extrabold uppercase sticky right-0">Hoạt động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {brands.map((b, index) => (
                            <tr key={b.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-200'} hover:bg-gray-300`}>
                                <td className="px-6 py-3"><input type="checkbox" /></td>
                                <td className="px-6 py-3 text-sm">{b.id}</td>
                                <td className="px-6 py-3 text-sm">{b.brand_name}</td>
                                <td className="px-6 py-3 text-sm">
                                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                        {b?.icon ? (
                                            <div className="relative w-12 h-12 overflow-hidden rounded">
                                                <Image
                                                    src={`http://localhost:8000/${b.icon}`}
                                                    alt={b.brand_name}
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
                                <td className={`px-6 py-3 sticky right-0 space-x-2  `}>
                                    <button
                                        onClick={() => handleEditClick(b)}
                                        className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 inline-flex items-center space-x-1">
                                        <FaEdit className="text-sm" />
                                        <span>Sửa</span>
                                    </button>
                                    <button onClick={() => handleDelete(b.id)} className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 inline-flex items-center space-x-1">
                                        <FaTrash className="text-sm" />
                                        <span>Xóa</span>
                                    </button>
                                    <button
                                        onClick={() => handleToggleStatus(b)}
                                        className={`${b.active ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-400 hover:bg-gray-500'
                                            } text-white px-2 py-1 rounded text-xs inline-flex items-center space-x-1`}
                                    >
                                        {b.active ? <FaToggleOn className="text-sm" /> : <FaToggleOff className="text-sm" />}
                                        <span>{b.active ? 'Kích hoạt' : 'Ngưng kích hoạt'}</span>
                                    </button>

                                    <button onClick={() => handleViewDetails(b.id)} className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 inline-flex items-center space-x-1">
                                        <FaInfoCircle className="text-sm" />
                                        <span>Chi tiết</span>
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

            <StoreBrandModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onSubmit={handleAddSubmit}
                formErrors={formErrors}
            />

            <UpdateBrandModal
                isOpen={isUpdateModalOpen}
                onClose={handleModalClose}
                onSubmit={handleUpdateSubmit}
                brand={selectedBrand}
                formErrors={updateFormErrors}
            />

            <ShowBrandModal
                isOpen={isShowModalOpen}
                onClose={() => setIsShowModalOpen(false)}
                brand={selectedBrand}
            />
        </div>
    );
}
