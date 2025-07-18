'use client';

import { deletePost, getAllPost, updatePost } from '@/services/postServices';
import { Post } from '@/types/postInterface';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaEdit, FaInfoCircle, FaToggleOff, FaToggleOn, FaTrash } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';


export default function PostPage() {
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<Post[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [lastPage, setLastPage] = useState(1);

    // HÀM LOAD DỮ LIỆU
    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await getAllPost(currentPage, perPage);
            setPosts(res.data);
            setTotalItems(res.meta?.total || 0);
            setLastPage(res.meta?.last_page || 1);
        } catch (error) {
            toast.error('Lỗi khi tải danh sách bài viết');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // GỌI API KHI PAGE THAY ĐỔI
    useEffect(() => {
        fetchPosts();
    }, [currentPage]);

    // XỬ LÝ CHUYỂN TRANG
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= lastPage) {
            setCurrentPage(newPage);
        }
    };

    // XỬ LÝ XÓA
    const handleDelete = async (id: number) => {
        toast(
            (t) => (
                <span className="flex flex-col space-y-2">
                    <span>Bạn có chắc muốn xóa bài viết này?</span>
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                deletePost(id)
                                    .then(() => {
                                        toast.success('Xóa bài viết thành công!')
                                        fetchPosts();
                                    })
                                    .catch((error) => {
                                        toast.error('Lỗi khi xóa bài viết!');
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
            ),
        );
    };

    // THAY ĐỔI TRẠNG THÁI
    const handleToggleStatus = async (post: Post) => {
        const newStatus = !post.active;
        const formData = new FormData();
        formData.append('active', newStatus ? '1' : '0');

        try {
            await updatePost(post.id, formData);
            toast.success(`Đã ${newStatus ? 'bật' : 'tắt'} trạng thái bài viết`);
            fetchPosts();
        } catch (err) {
            toast.error('Lỗi khi thay đổi trạng thái');
            console.error(err);
        }
    };

    // PHẦN HIỂN THỊ LOADING
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <ClipLoader color="#123abc" size={50} />
            </div>
        );
    }

    return (
        <div className="overflow-x-auto p-4">

            <div className="px-6 flex items-center justify-between bg-gray-200 w-full h-16 mb-7 rounded">
                <h1 className="text-lg font-semibold">Quản lý bài viết</h1>
                <div className="space-x-2">
                    <Link href="/admin/post/store">
                        <button className="bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700">
                            Thêm
                        </button>
                    </Link>
                </div>
            </div>

            <div className="relative">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                    <thead className="bg-gray-400">
                        <tr>
                            <th className="pl-6 py-3 text-left">
                                <input type="checkbox" />
                            </th>
                            <th className="py-3 text-left">ID</th>
                            <th className="pl-6 py-3 text-left">Tiêu đề</th>
                            <th className="py-3 text-left">Chủ đề</th>
                            <th className="py-3 text-left">Hình ảnh</th>
                            <th className="py-3 text-left">Loại</th>
                            <th className="py-3 text-left text-xs font-extrabold uppercase sticky right-0">
                                Hoạt động
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map((p, index) => (
                            <tr
                                key={p.id}
                                className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-200'} hover: bg - gray - 300`}
                            >
                                <td className="pl-6 py-3">
                                    <input type="checkbox" />
                                </td>
                                <td className="py-3 text-sm">{p.id}</td>
                                <td className="pl-6 py-3 text-sm">{p.title}</td>
                                <td className="py-3 text-sm">{p.topic?.topic_name || 'N/A'}</td>
                                <td className="py-3 text-sm">
                                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                        {p.image ? (
                                            <div className="relative w-12 h-12 overflow-hidden rounded">
                                                <Image
                                                    src={`http://localhost:8000/${p.image}`}
                                                    alt={p.title}
                                                    fill
                                                    className="object-cover"
                                                    sizes="48px"
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            </div >
                                        ) : (
                                            <svg
                                                className="w-12 h-12 text-gray-400"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                        )}
                                    </div >
                                </td >
                                <td className="py-3 text-sm">{p.type}</td>
                                <td className="py-3 text-sm sticky right-0">
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => handleToggleStatus(p)}>
                                            {p.active ? (
                                                <FaToggleOn className="text-green-500" />
                                            ) : (
                                                <FaToggleOff className="text-gray-400" />
                                            )}
                                        </button>
                                        <Link href={`/admin/post/detail/${p.id}`}>
                                            <FaInfoCircle className="text-blue-500 cursor-pointer" />
                                        </Link>
                                        <Link href={`/admin/post/update/${p.id}`}>
                                            <FaEdit className="text-yellow-500 cursor-pointer" />
                                        </Link>
                                        <button onClick={() => handleDelete(p.id)}>
                                            <FaTrash className="text-red-500" />
                                        </button>
                                    </div>
                                </td>
                            </tr >
                        ))}
                    </tbody >
                </table >
            </div >

            {/* PHÂN TRANG */}
            < div className="flex justify-between items-center mt-4 px-4 py-3 bg-gray-100 rounded-lg" >
                <div className="text-sm text-gray-700">
                    Hiển thị từ {(currentPage - 1) * perPage + 1} đến{' '}
                    {Math.min(currentPage * perPage, totalItems)} của {totalItems} kết quả
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
            </div >
        </div >
    );
}
