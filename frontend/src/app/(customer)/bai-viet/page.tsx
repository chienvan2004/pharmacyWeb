'use client';

import CardPost from '@/app/component/CardPost';
import PaginationSection from '@/app/component/PaginationSection';
import { getAllPost } from '@/services/postServices';
import { Post } from '@/types/postInterface';
import { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(18); // Số bài viết trên mỗi trang
  const [totalItems, setTotalItems] = useState(0); // Tổng số bài viết
  const [lastPage, setLastPage] = useState(1); // Trang cuối cùng

  // Hàm xử lý thay đổi trang
  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await getAllPost(currentPage, perPage); // Gọi API với trang và số lượng
        const filteredPosts = response.data.filter((post) => post.type === 'post');
        setPosts(filteredPosts);
        // Cập nhật tổng số bài viết và trang cuối cùng từ API (giả sử response.meta)
        setTotalItems(response.meta?.total || 0); // Thay bằng trường thực tế từ API
        setLastPage(response.meta?.last_page || 1); // Thay bằng trường thực tế từ API
      } catch (err: any) {
        setError(err.message || 'Không thể tải bài viết');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage, perPage]); // Chạy lại khi currentPage hoặc perPage thay đổi

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
    <section className="max-w-7xl mx-auto overflow-hidden mt-5">
      {/* Nội dung */}
      {posts.length === 0 ? (
        <p className="text-center text-gray-500 mt-4">Không có bài viết nào.</p>
      ) : (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6 px-2 bg-white rounded-2xl p-5">
            {posts.map((post) => (
              <CardPost key={post.id} post={post} />
            ))}
          </div>

        </>
      )}
      <div className="mt-4 rounded-xl bg-white">
        <PaginationSection
          currentPage={currentPage}
          perPage={perPage}
          totalItems={totalItems}
          lastPage={lastPage}
          onPageChange={onPageChange}
        />
      </div>
    </section>
  );
}