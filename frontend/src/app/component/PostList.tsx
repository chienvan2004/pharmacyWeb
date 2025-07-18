'use client';

import { useEffect, useState } from 'react';
import { getAllPost } from '@/services/postServices';
import { Post } from '@/types/postInterface';
import { ClipLoader } from 'react-spinners';
import CardPost from './CardPost';
import Link from 'next/link';

export default function PostList() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const response = await getAllPost(1, 10); // Lấy trang 1, tối đa 10 bài để đảm bảo có đủ
                const filteredPosts = response.data.filter((post) => post.type === 'post');
                // Giới hạn chỉ 6 bài viết
                const limitedPosts = filteredPosts.slice(0, 6);
                setPosts(limitedPosts);
            } catch (err: any) {
                setError(err.message || 'Không thể tải bài viết');
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <ClipLoader size={48} color="#2563EB" />
            </div>
        );
    }

    if (error) {
        return <p className="text-center text-red-600 mt-4">{error}</p>;
    }

    return (
        <section className="max-w-7xl mx-auto pb-6 md:pb-10 bg-white rounded-2xl shadow-md overflow-hidden mt-5">
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-4 bg-blue-900 rounded-t-2xl">
                <h2 className="text-lg md:text-2xl font-semibold text-white">
                    Bài viết mới nhất
                </h2>
                <Link href={'/bai-viet'} className="text-white hover:text-gray-400 font-medium  transition-colors duration-300 ">
                    Xem tất cả
                </Link>
            </div>

            {/* Nội dung */}
            {posts.length === 0 ? (
                <p className="text-center text-gray-500 mt-4">Không có bài viết nào.</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6 px-2">
                        {posts.map((post) => (
                            <CardPost key={post.id} post={post} />
                        ))}
                    </div>
                    
                </>
            )}
        </section>
    );
}