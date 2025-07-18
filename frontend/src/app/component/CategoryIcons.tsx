'use client';

import { Category } from "@/types/categoryInterface";
import { useEffect, useState } from "react";
import { getCategoryParent } from '@/services/categoryServices';
import { ClipLoader } from 'react-spinners';
import CategorySection from './cardCaregory'; // Import component mới

export default function CategoryIcons() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            try {
                const response = await getCategoryParent();
                setCategories(response.data); // Lấy mảng Category từ response
            } catch (err: any) {
                setError(err.message || 'Không thể tải danh mục');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []); // Chạy một lần khi component mount

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <ClipLoader size={48} color="#2563EB" />
            </div>
        );
    }

    if (error) {
        return (
            <section className="max-w-7xl mx-auto px-4 py-6">
                <p className="text-center text-red-600 mt-4">{error}</p>
            </section>
        );
    }

    return <CategorySection categories={categories} />;
}