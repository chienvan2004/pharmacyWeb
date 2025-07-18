    'use client';

    import { createTag, deleteTag, exportTag, getAllTags, importTag, updateTag } from '@/services/tagService';
    import { Tag } from '@/types/tagInterface';
    import { useEffect, useRef, useState } from 'react';
    import toast from 'react-hot-toast';
    import { FaEdit, FaToggleOff, FaToggleOn, FaTrash } from 'react-icons/fa';
    import { ClipLoader } from 'react-spinners';
    import StoreTagModal from '../components/StoreTagModal';
    import axios from 'axios';
    import UpdateTagModal from '../components/UpdateTagModel';
    import { Product } from '@/types/productInterface';
    import { getAllProducts } from '@/services/productsServices';

    export default function TagPage() {
        const [tags, setTags] = useState<Tag[]>([]);
        const [products, setProducts] = useState<Product[]>([]);
        const [loading, setLoading] = useState(true);
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
        const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
        const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
        const [updateFormErrors, setUpdateFormErrors] = useState<{ [key: string]: string }>({});
        const fileInputRef = useRef<HTMLInputElement>(null);

        const fetchTags = async () => {
            setLoading(true);
            try {
                const res = await getAllTags();
                setTags(res.data);
            } catch (error) {
                toast.error('Lỗi khi tải danh sách thẻ');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        const fetchProducts = async () => {
            try {
                const res = await getAllProducts(1, 100); // Lấy tối đa 100 sản phẩm
                setProducts(res.data);
            } catch (error) {
                toast.error('Lỗi khi tải danh sách sản phẩm');
                console.error(error);
            }
        };

        useEffect(() => {
            fetchTags();
            fetchProducts();
        }, []);

        const handleAddClick = () => {
            setSelectedTag(null);
            setIsModalOpen(true);
        };

        const handleModalClose = () => {
            setIsModalOpen(false);
            setIsUpdateModalOpen(false);
            setSelectedTag(null);
            setUpdateFormErrors({});
        };

        const handleEditClick = (tag: Tag) => {
            setSelectedTag(tag);
            setIsUpdateModalOpen(true);
        };

        const handleAddTagSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);
            setFormErrors({});

            try {
                await createTag(formData);
                toast.success('Thêm thẻ thành công!');
                setIsModalOpen(false);
                form.reset();
                fetchTags();
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

        const handleUpdateSubmit = async (id: number, formData: FormData) => {
            setUpdateFormErrors({});

            try {
                await updateTag(id, formData);
                toast.success('Cập nhật thẻ thành công!');
                setIsUpdateModalOpen(false);
                fetchTags();
            } catch (err: any) {
                if (err.errors) {
                    const formatted: { [key: string]: string } = {};
                    for (const key in err.errors) {
                        formatted[key] = err.errors[key][0];
                    }
                    setUpdateFormErrors(formatted);
                }
                console.error('Lỗi khi cập nhật thẻ:', err);
            }
        };

        const handleDelete = async (id: number) => {
            toast((t) => (
                <span className="flex flex-col space-y-2">
                    <span>Bạn có chắc muốn xóa thẻ này?</span>
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                deleteTag(id)
                                    .then(() => {
                                        toast.success('Xóa thẻ thành công!');
                                        fetchTags();
                                    })
                                    .catch((error) => {
                                        toast.error('Lỗi khi xóa thẻ!');
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
            ), { duration: 5000 });
        };

        const handleToggleStatus = async (tag: Tag) => {
            const newStatus = !tag.active;
            const formData = new FormData();
            formData.append('active', newStatus ? '1' : '0');

            try {
                await updateTag(tag.id, formData);
                toast.success(`Đã ${newStatus ? 'bật' : 'tắt'} trạng thái thẻ`);
                fetchTags();
            } catch (err) {
                console.error('Toggle Status Error:', err);

                if (axios.isAxiosError(err)) {
                    const message = err.response?.data?.message || 'Lỗi server';
                    toast.error(message);
                } else {
                    toast.error('Lỗi không xác định');
                }
            }

        };


        const handleExport = async () => {
            try {
                await exportTag();
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
                await importTag(file);
                toast.success('Nhập dữ liệu từ Excel thành công!');
                fetchTags();
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
                <div className="flex items-center justify-between bg-gray-200 w-full h-16 px-6 mb-7 rounded">
                    <h1 className="text-lg font-semibold">Quản lí thẻ</h1>
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
                                <th className="px-6 py-3 text-left">Tên thẻ</th>
                                <th className="px-6 py-3 text-left text-xs font-extrabold uppercase sticky right-0">Hoạt động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tags.map((t, index) => (
                                <tr key={t.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-200'} hover:bg-gray-300`}>
                                    <td className="px-6 py-3"><input type="checkbox" /></td>
                                    <td className="px-6 py-3 text-sm">{t.id}</td>
                                    <td className="px-6 py-3 text-sm">{t.tag_name}</td>
                                    <td className="px-6 py-3 sticky right-0 space-x-2">
                                        <button
                                            onClick={() => handleEditClick(t)}
                                            className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 inline-flex items-center space-x-1">
                                            <FaEdit className="text-sm" />
                                            <span>Sửa</span>
                                        </button>
                                        <button onClick={() => handleDelete(t.id)} className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 inline-flex items-center space-x-1">
                                            <FaTrash className="text-sm" />
                                            <span>Xóa</span>
                                        </button>
                                        <button
                                            onClick={() => handleToggleStatus(t)}
                                            className={`${t.active ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-400 hover:bg-gray-500'
                                                } text-white px-2 py-1 rounded text-xs inline-flex items-center space-x-1`}
                                        >
                                            {t.active ? <FaToggleOn className="text-sm" /> : <FaToggleOff className="text-sm" />}
                                            <span>{t.active ? 'Kích hoạt' : 'Ngưng kích hoạt'}</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <StoreTagModal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    onSubmit={handleAddTagSubmit}
                    formErrors={formErrors}
                    products={products}
                />

                <UpdateTagModal
                    isOpen={isUpdateModalOpen}
                    onClose={handleModalClose}
                    onSubmit={handleUpdateSubmit}
                    tag={selectedTag}
                    formErrors={updateFormErrors}
                    products={products}
                />
            </div>
        );
    }
