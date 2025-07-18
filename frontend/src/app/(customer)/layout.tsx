'use client';
import { getAll } from '@/services/categoryServices';
import { Category } from '@/types/categoryInterface';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Footer from '../component/Footer';
import Header from '../component/Header';

export default function Layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Gọi API lấy danh sách categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getAll();
                // Kiểm tra dữ liệu trả về
                if (response.status === 'success' && Array.isArray(response.data)) {
                    setCategories(response.data);
                } else {
                    throw new Error('Dữ liệu categories không hợp lệ');
                }
            } catch (err) {
                console.error('Lỗi khi lấy categories:', err);
                setError('Không thể tải danh mục. Vui lòng thử lại sau.');
            } finally {
            }
        };

        fetchCategories();
    }, []);

    if (pathname === '/dang-nhap') {
        return <>{children}</>;
    }

    if (error) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="bg-blue-50">
            <Header categories={categories} />
            <div className="h-28 md:hidden"></div>
            <main >{children}</main>
            <Footer />
        </div>
    );
}