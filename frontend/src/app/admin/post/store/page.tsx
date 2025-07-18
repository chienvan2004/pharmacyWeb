'use client';

import { createPost } from '@/services/postServices';
import { getAlltopic } from '@/services/topicServices'; 
import { Topic } from '@/types/topicInterface'; 
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';
import EditText from '../../components/EditText';
import { Toaster } from 'react-hot-toast';

export default function AddPostPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        topic_id: '',
        content: '',
        image: null as File | null,
        type: 'post' as 'post' | 'page',
        active: '1',
    });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch topics
    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const topicRes = await getAlltopic(1, 100);
                setTopics(topicRes.data);
            } catch (error) {
                console.error('Fetch topics error:', error);
                toast.error('Lỗi khi tải danh sách chủ đề');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Set default topic_id
    useEffect(() => {
        if (topics.length > 0 && !formData.topic_id) {
            setFormData(prev => ({
                ...prev,
                topic_id: topics[0].id.toString(),
            }));
        }
    }, [topics]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleContentChange = useCallback((value: string) => {
        setFormData(prev => ({
            ...prev,
            content: value,
        }));
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, image: null }));
        setPreviewUrl(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        const data = new FormData();
        data.append('title', formData.title);
        if (formData.slug) data.append('slug', formData.slug);
        data.append('topic_id', formData.topic_id);
        data.append('content', formData.content);
        if (formData.image) data.append('image', formData.image);
        data.append('type', formData.type);
        data.append('active', formData.active);

        try {
            const response = await createPost(data);
            console.log('Post created:', response.data);
            toast.success('Thêm bài viết thành công! 🎉');
            router.push('/admin/post');
        } catch (error: any) {
            if (error.errors) {
                const formatted: { [key: string]: string } = {};
                for (const key in error.errors) {
                    formatted[key] = error.errors[key][0];
                }
                setErrors(formatted);
            }
            console.error(error);
            toast.error('Lỗi khi thêm bài viết');
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
                <h1 className="text-lg font-semibold">Quản lý bài viết</h1>
                <Link href="/admin/post">
                    <button className="bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700">
                        Quay lại
                    </button>
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10" encType="multipart/form-data">
                {/* Tiêu đề và Slug */}
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-9">
                        <label className="block mb-1 font-medium text-gray-700">
                            <span className="text-red-500 text-xl">*</span> Tiêu đề
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full border rounded p-2"
                        />
                        {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                    </div>
                    <div className="col-span-3">
                        <label className="block mb-1 font-medium text-gray-700">Slug</label>
                        <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            className="w-full border rounded p-2"
                        />
                        {errors.slug && <p className="text-red-500 text-sm">{errors.slug}</p>}
                    </div>
                </div>

                {/* Chủ đề, Loại, Trạng thái */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block mb-1 font-medium text-gray-700">
                            <span className="text-red-500 text-xl">*</span> Chủ đề
                        </label>
                        <select
                            name="topic_id"
                            value={formData.topic_id}
                            onChange={handleChange}
                            className="w-full border rounded p-2"
                        >
                            {topics.map((topic) => (
                                <option key={topic.id} value={topic.id}>
                                    {topic.topic_name}
                                </option>
                            ))}
                        </select>
                        {errors.topic_id && <p className="text-red-500 text-sm">{errors.topic_id}</p>}
                    </div>
                    <div>
                        <label className="block mb-1 font-medium text-gray-700">
                            <span className="text-red-500 text-xl">*</span> Loại bài viết
                        </label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full border rounded p-2"
                        >
                            <option value="post">Post</option>
                            <option value="page">Page</option>
                        </select>
                        {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
                    </div>
                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Trạng thái</label>
                        <select
                            name="active"
                            value={formData.active}
                            onChange={handleChange}
                            className="w-full border rounded p-2"
                        >
                            <option value="1">Hiển thị</option>
                            <option value="0">Ẩn</option>
                        </select>
                        {errors.active && <p className="text-red-500 text-sm">{errors.active}</p>}
                    </div>
                </div>

                {/* Nội dung */}
                <div>
                    <label className="block mb-1 font-medium text-gray-700">
                        <span className="text-red-500 text-xl">*</span> Nội dung
                    </label>
                    <div className="border rounded">
                        <EditText
                            value={formData.content}
                            onChange={handleContentChange}
                        />
                    </div>
                    {errors.content && <p className="text-red-500 text-sm">{errors.content}</p>}
                </div>

                {/* Hình ảnh */}
                <div>
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="imageInput"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors w-fit"
                        >
                            <span className="text-red-500 text-xl">*</span>
                            <span className="text-sm font-medium">Tải lên hình ảnh</span>
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M12 4V16M8 8L12 4L16 8M20 12V18C20 19.1 19.1 20 18 20H6C4.9 20 4 19.1 4 18V12"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </label>
                        <input
                            id="imageInput"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                        {previewUrl && (
                            <div className="relative w-24 h-24 cursor-pointer group mt-4">
                                <Image
                                    src={previewUrl}
                                    alt="Preview"
                                    width={96}
                                    height={96}
                                    className="object-cover rounded-lg border-2 border-gray-300"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    ×
                                </button>
                            </div>
                        )}
                    </div>
                    {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition h-14"
                        >
                            Lưu bài viết
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
