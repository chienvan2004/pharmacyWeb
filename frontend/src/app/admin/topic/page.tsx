'use client';

import { Topic } from '@/types/topicInterface';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import { createTopic, deleteTopic, getAlltopic, updateTopic } from '@/services/topicServices';
import StoreTopicModal from '../components/StoreTopicModal';
import UpdateTopicModal from '../components/UpdateTopicModal';

export default function TopicPage() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [updateFormErrors, setUpdateFormErrors] = useState<{ [key: string]: string }>({});

    const fetchTopics = async () => {
        setLoading(true);
        try {
            const res = await getAlltopic();
            setTopics(res.data);
        } catch (error) {
            toast.error('Lỗi khi tải danh sách chủ đề');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchTopics();
    }, []);

    const handleAddClick = () => {
        setSelectedTopic(null);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setIsUpdateModalOpen(false);
        setSelectedTopic(null);
        setUpdateFormErrors({});
        setFormErrors({});
    };

    const handleEditClick = (topic: Topic) => {
        setSelectedTopic(topic);
        setIsUpdateModalOpen(true);
    };

    const handleAddTopicSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        setFormErrors({});

        try {
            await createTopic(formData);
            toast.success('Thêm chủ đề thành công!');
            setIsModalOpen(false);
            form.reset();
            fetchTopics();
        } catch (err: any) {
            if (err.errors) {
                const formatted: { [key: string]: string } = {};
                for (const key in err.errors) {
                    formatted[key] = err.errors[key][0];
                }
                setFormErrors(formatted);
            }
            console.error('Lỗi khi thêm chủ đề:', err);
        }
    };

    const handleUpdateSubmit = async (id: number, formData: FormData) => {
        setUpdateFormErrors({});

        try {
            await updateTopic(id, formData);
            toast.success('Cập nhật chủ đề thành công!');
            setIsUpdateModalOpen(false);
            fetchTopics();
        } catch (err: any) {
            if (err.errors) {
                const formatted: { [key: string]: string } = {};
                for (const key in err.errors) {
                    formatted[key] = err.errors[key][0];
                }
                setUpdateFormErrors(formatted);
            }
            console.error('Lỗi khi cập nhật chủ đề:', err);
        }
    };

    const handleDelete = async (id: number) => {
        toast((t) => (
            <span className="flex flex-col space-y-2">
                <span>Bạn có chắc muốn xóa chủ đề này?</span>
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            deleteTopic(id)
                                .then(() => {
                                    toast.success('Xóa chủ đề thành công!');
                                    fetchTopics();
                                })
                                .catch((error) => {
                                    toast.error('Lỗi khi xóa chủ đề!');
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
        ), );
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
                <h1 className="text-lg font-semibold">Quản lí chủ đề</h1>
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
                            <th className="px-6 py-3 text-left">Tên chủ đề</th>
                            <th className="px-6 py-3 text-left text-xs font-extrabold uppercase sticky right-0">Hoạt động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topics.map((t, index) => (
                            <tr key={t.id} className={`${ index % 2 === 0 ? 'bg-white' : 'bg-gray-200' } hover: bg - gray - 300`}>
                                <td className="px-6 py-3"><input type="checkbox" /></td>
                                <td className="px-6 py-3 text-sm">{t.id}</td>
                                <td className="px-6 py-3 text-sm">{t.topic_name}</td>
                                <td className="px-6 py-3 sticky right-0 space-x-2">
                                    <button
                                        onClick={() => handleEditClick(t)}
                                        className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 inline-flex items-center space-x-1"
                                    >
                                        <FaEdit className="text-sm" />
                                        <span>Sửa</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(t.id)}
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
            </div>

            <StoreTopicModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onSubmit={handleAddTopicSubmit}
                formErrors={formErrors}
            />

            <UpdateTopicModal
                isOpen={isUpdateModalOpen}
                onClose={handleModalClose}
                onSubmit={handleUpdateSubmit}
                topic={selectedTopic}
                formErrors={updateFormErrors}
            />
        </div>
    );
}
