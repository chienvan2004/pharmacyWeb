'use client';

import { Post } from '@/types/postInterface';
import Image from 'next/image';
import Link from 'next/link'; // Import Link từ next/link

interface CardPostProps {
    post: Post;
}

export default function CardPost({ post }: CardPostProps) {
    const getRelativeTime = (dateString: string) => {
        const now = new Date();
        const postDate = new Date(dateString);
        const diffMs = now.getTime() - postDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays < 1) return 'Hôm nay';
        if (diffDays === 1) return '1 ngày trước';
        if (diffDays < 7) return `${diffDays} ngày trước`;
        const diffWeeks = Math.floor(diffDays / 7);
        return `${diffWeeks} tuần trước`;
    };

    const defaultImage = '/logo.jpg';
    const displayImage = post.image ? `http://localhost:8000/${post.image}` : defaultImage;

    return (
        <Link href={`/chi-tiet-bai-viet/${post.id}`} className="block"> {/* Thêm Link bao quanh và dẫn tới /posts/[id] */}
            <div className="flex bg-white border border-gray-100 rounded-xl shadow hover:shadow-lg transition duration-300 overflow-hidden transform hover:scale-[1.02]">
                <div className="relative w-32 h-32 flex-shrink-0">
                    <Image
                        src={displayImage}
                        alt={post.title} // Thay alt bằng tiêu đề bài viết để mô tả tốt hơn
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="p-4 flex flex-col justify-between flex-grow">
                    <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2">
                        {post.title}
                    </h3>
                    <p className="text-sm text-gray-500">{getRelativeTime(post.created_at)}</p>
                </div>
            </div>
        </Link>
    );
}