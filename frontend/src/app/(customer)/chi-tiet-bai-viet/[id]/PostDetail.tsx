'use client';

import { showPost } from "@/services/postServices"; // Import hàm showPost
import { Post } from "@/types/postInterface"; // Điều chỉnh đường dẫn import
import Image from "next/image";
import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";

interface PostDetailProps {
    id: number; // Thay post bằng id
}

export function PostDetail({ id }: PostDetailProps) {
    const [displayPost, setDisplayPost] = useState<Post | null>(null); // Khởi tạo với null
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch dữ liệu khi id thay đổi
    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            setError(null);
            try {
                const post = await showPost(id); // Gọi API với id
                setDisplayPost(post.data); // Lưu dữ liệu từ API
            } catch (err) {
                setError("Không thể tải bài viết. Vui lòng thử lại.");
                console.error("Lỗi khi fetch post:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]); // Chạy lại khi id thay đổi

    if (loading) {
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <ClipLoader size={48} color="#2563EB" />
        </div>
    }

    if (error) {
        return <div className="max-w-4xl mx-auto p-6 text-center text-red-600">{error}</div>;
    }

    if (!displayPost) {
        return <div className="max-w-4xl mx-auto p-6 text-center">Không tìm thấy bài viết</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white my-5 rounded-xl">
            <h1 className="text-3xl font-bold mb-4">{displayPost.title}</h1>
            {displayPost.image && (
                <div className="relative w-full h-64 mb-4">
                    <Image
                        src={`http://localhost:8000/${displayPost.image}`}
                        alt={displayPost.title}
                        fill
                        className="object-cover rounded-lg"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
            )}
            <div className="mb-4">
                <p className="text-gray-600">
                    Chủ đề: {displayPost.topic?.topic_name || "Chưa có chủ đề"}
                </p>
            </div>
            <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: displayPost.content }}
            />
        </div>
    );
}