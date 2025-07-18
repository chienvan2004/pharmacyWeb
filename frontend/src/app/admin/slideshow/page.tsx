'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import {
    createSlideshow,
    deleteSlideshow,
    getAllSlideshows,
    updateSlideshow,
    incrementClicks,
} from '@/services/slideShowServices';
import StoreSlideshowModal from '../components/StoreSlideshowModal';
import UpdateSlideshowModal from '../components/UpdateSlideshowModel';
import { Slideshow } from '@/types/slideShowInteface';
import Image from 'next/image';

export default function SlideshowPage() {
    const [slideshows, setSlideshows] = useState<Slideshow[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedSlideshow, setSelectedSlideshow] = useState<Slideshow | null>(null);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [updateFormErrors, setUpdateFormErrors] = useState<{ [key: string]: string }>({});

    const fetchSlideshows = async () => {
        setLoading(true);
        try {
            const res = await getAllSlideshows();
            setSlideshows(res.data);
        } catch (error) {
            toast.error('Lỗi khi tải danh sách slideshow');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSlideshows();
    }, []);

    const handleAddClick = () => {
        setSelectedSlideshow(null);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setIsUpdateModalOpen(false);
        setSelectedSlideshow(null);
        setUpdateFormErrors({});
        setFormErrors({});
    };

    const handleEditClick = (slideshow: Slideshow) => {
        setSelectedSlideshow(slideshow);
        setIsUpdateModalOpen(true);
    };

    const handleAddSlideshowSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        setFormErrors({});

        try {
            await createSlideshow(formData);
            toast.success('Thêm slideshow thành công!');
            setIsModalOpen(false);
            form.reset();
            fetchSlideshows();
        } catch (err: any) {
            if (err.errors) {
                const formatted: { [key: string]: string } = {};
                for (const key in err.errors) {
                    formatted[key] = err.errors[key][0];
                }
                setFormErrors(formatted);
            }
            console.error('Lỗi khi thêm slideshow:', err);
        }
    };

    const handleUpdateSubmit = async (id: number, formData: FormData) => {
        setUpdateFormErrors({});

        try {
            await updateSlideshow(id, formData);
            toast.success('Cập nhật slideshow thành công!');
            setIsUpdateModalOpen(false);
            fetchSlideshows();
        } catch (err: any) {
            if (err.errors) {
                const formatted: { [key: string]: string } = {};
                for (const key in err.errors) {
                    formatted[key] = err.errors[key][0];
                }
                setUpdateFormErrors(formatted);
            }
            console.error('Lỗi khi cập nhật slideshow:', err);
        }
    };

    const handleDelete = async (id: number) => {
        toast((t) => (
            <span className="flex flex-col space-y-2">
                <span>Bạn có chắc muốn xóa slideshow này?</span>
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            deleteSlideshow(id)
                                .then(() => {
                                    toast.success('Xóa slideshow thành công!');
                                    fetchSlideshows();
                                })
                                .catch((error) => {
                                    toast.error('Lỗi khi xóa slideshow!');
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

    // const handleIncrementClicks = async (id: number) => {
    //     try {
    //         const res = await incrementClicks(id);
    //         setSlideshows((prev) =>
    //             prev.map((slideshow) =>
    //                 slideshow.id === id ? res.data : slideshow
    //             )
    //         );
    //         toast.success('Tăng lượt click thành công!');
    //     } catch (err) {
    //         toast.error('Lỗi khi tăng lượt click!');
    //         console.error('Lỗi khi tăng lượt click:', err);
    //     }
    // };

    // Hàm thay đổi trạng thái active
    const handleToggleStatus = async (slideshow: Slideshow) => {
        const newStatus = !slideshow.active;
        const formData = new FormData();
        formData.append('active', newStatus ? '1' : '0');

        try {
            await updateSlideshow(slideshow.id, formData);
            setSlideshows((prev) =>
                prev.map((s) =>
                    s.id === slideshow.id ? { ...s, active: newStatus } : s
                )
            );
            toast.success(`Đã ${newStatus ? 'kích hoạt' : 'ngưng kích hoạt'} slideshow!`);
        } catch (err) {
            toast.error('Lỗi khi thay đổi trạng thái!');
            console.error('Lỗi khi thay đổi trạng thái:', err);
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
                <h1 className="text-lg font-semibold">Quản lý Slideshow</h1>
                <div className="space-x-2">
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
                            <th className="px-6 py-3 text-left">Hình ảnh</th>
                            <th className="px-6 py-3 text-left">Liên kết</th>
                            <th className="px-6 py-3 text-left">Lượt click</th>
                            <th className="px-6 py-3 text-left text-xs font-extrabold uppercase">Trạng thái</th>
                            <th className="px-6 py-3 text-left text-xs font-extrabold uppercase sticky right-0">Hoạt động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {slideshows.map((s, index) => (
                            <tr key={s.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-200'} hover:bg-gray-300`}>
                                <td className="px-6 py-3"><input type="checkbox" /></td>
                                <td className="px-6 py-3 text-sm">{s.id}</td>
                                <td className="px-6 py-3 text-sm">
                                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                        {s.image ? (
                                            <div className="relative w-12 h-12 overflow-hidden rounded">
                                                <Image
                                                    src={`http://localhost:8000/storage/${s.image}`}
                                                    alt="Slideshow"
                                                    width={50}
                                                    height={50}
                                                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                                />
                                            </div>
                                        ) : (
                                            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-3 text-sm">{s.link || 'Không có liên kết'}</td>
                                <td className="px-6 py-3 text-sm">
                                    {s.clicks}
                                </td>
                                <td className="px-6 py-3 text-sm">
                                    {s.active ? 'Kích hoạt' : 'Ngưng kích hoạt'}
                                </td>
                                <td className="px-6 py-3 sticky right-0 space-x-2">
                                    <button
                                        onClick={() => handleEditClick(s)}
                                        className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 inline-flex items-center space-x-1"
                                    >
                                        <FaEdit className="text-sm" />
                                        <span>Sửa</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(s.id)}
                                        className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 inline-flex items-center space-x-1"
                                    >
                                        <FaTrash className="text-sm" />
                                        <span>Xóa</span>
                                    </button>
                                    <button
                                        onClick={() => handleToggleStatus(s)}
                                        className={`px-2 py-1 rounded text-xs inline-flex items-center space-x-1 ${s.active ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-gray-400 hover:bg-gray-500 text-white'}`}
                                    >
                                        {s.active ? 'Ngưng kích hoạt' : 'Kích hoạt'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <StoreSlideshowModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onSubmit={handleAddSlideshowSubmit}
                formErrors={formErrors}
            />

            <UpdateSlideshowModal
                isOpen={isUpdateModalOpen}
                onClose={handleModalClose}
                onSubmit={handleUpdateSubmit}
                slideshow={selectedSlideshow}
                formErrors={updateFormErrors}
            />
        </div>
    );
}