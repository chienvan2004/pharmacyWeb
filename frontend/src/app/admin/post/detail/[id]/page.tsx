'use client';

import dynamic from 'next/dynamic';
import { showPost } from "@/services/postServices";
import { Post } from "@/types/postInterface";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

// Dynamic import Detail để tránh lỗi SSR
const Detail = dynamic(() => import('@/app/admin/components/Detail'), { ssr: false });

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const BASE_URL = 'http://localhost:8000/';

    useEffect(() => {
        async function fetchPost() {
            setLoading(true);
            try {
                const resolvedParams = await params;
                if (!resolvedParams || !resolvedParams.id) {
                    throw new Error("Params không hợp lệ");
                }

                const id = resolvedParams.id;
                const postId = Number(id);
                if (isNaN(postId)) {
                    throw new Error("ID không hợp lệ");
                }

                const response = await showPost(postId);
                setPost(response.data);
            } catch (err: any) {
                setError(err.message || "Lỗi không xác định");
            } finally {
                setLoading(false);
            }
        }

        fetchPost();
    }, [params]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500">Lỗi: {error}</div>;
    }

    if (!post) {
        return <div className="flex justify-center items-center h-screen">Không tìm thấy bài viết</div>;
    }

    return (
        <div>
            <div className="flex items-center justify-between bg-gray-200 w-full h-16 px-6 mb-7 rounded">
                <h1 className="text-lg font-semibold">Thông tin chi tiết bài viết</h1>
                <Link href="/admin/post">
                    <button className="bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700">
                        Quay lại
                    </button>
                </Link>
            </div>
            <div className="flex flex-col lg:flex-row gap-6 p-6">
                {/* Left Column */}
                <div className="flex-1 space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white p-6 rounded-sm shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">Tiêu đề</label>
                                <input
                                    readOnly
                                    type="text"
                                    value={post.title || ""}
                                    className="w-full border rounded-lg p-2 bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Chủ đề</label>
                                <input
                                    readOnly
                                    type="text"
                                    value={post.topic?.topic_name || ""}
                                    className="w-full border rounded-lg p-2 bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Slug</label>
                                <input
                                    readOnly
                                    type="text"
                                    value={post.slug || ""}
                                    className="w-full border rounded-lg p-2 bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Loại bài viết</label>
                                <input
                                    readOnly
                                    type="text"
                                    value={post.type || ""}
                                    className="w-full border rounded-lg p-2 bg-gray-100"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Nội dung bài viết */}
                    <div className="bg-white p-6 rounded-sm shadow-sm">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Nội dung</label>
                            <Detail content={post.content?.toString() ?? ""} />
                        </div>
                    </div>

                    {/* Hình ảnh bài viết */}
                    <div className="bg-white p-6 rounded-sm shadow-sm">
                        <h2 className="text-sm font-semibold mb-4">Hình ảnh bài viết</h2>
                        {post.image ? (
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden w-48 h-48">
                                <Image
                                    src={post.image.startsWith('http') ? post.image : `${BASE_URL}${post.image}`}
                                    alt={post.title || "Hình ảnh bài viết"}
                                    width={192}
                                    height={192}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div>Không có hình ảnh</div>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div className="w-full lg:w-80 space-y-6">
                    {/* Status */}
                    <div className="bg-white p-6 rounded-sm shadow-sm">
                        <h2 className="text-sm font-semibold mb-4">Trạng thái</h2>
                        <div className="space-y-2">
                            <div>
                                <label className="block text-sm font-medium mb-1">Hiển thị</label>
                                <select
                                    className="w-full border rounded-lg p-2"
                                    value={post.active ? "true" : "false"}
                                    disabled
                                >
                                    <option value="true">Hiển thị</option>
                                    <option value="false">Ẩn</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}