'use client';

import { getProductBestsaler } from '@/services/productsServices';
import { Product } from '@/types/productInterface';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FaChevronCircleLeft, FaChevronCircleRight } from "react-icons/fa";
import CardProduct from './CardProduct';
import { ClipLoader } from 'react-spinners';


export default function ProductBestsaler() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await getProductBestsaler();
                setProducts(response.data);
            } catch (err: any) {
                setError(err.message || 'Không thể tải sản phẩm bán chạy');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const totalPages = Math.ceil(products.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const selectedProducts = products.slice(startIndex, startIndex + itemsPerPage);

    const handlePrevious = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <ClipLoader size={48} color="#2563EB" />
            </div>
        );
    }

    if (error) {
        return (
            <section className="max-w-7xl mx-auto pb-6 md:pb-10 bg-white rounded-2xl shadow-md overflow-hidden">
                <p className="text-center text-red-600 mt-4">{error}</p>
            </section>
        );
    }

    return (
        <section className="max-w-7xl mx-auto pb-6 md:pb-10 bg-white rounded-2xl shadow-md overflow-hidden">
            {/* Header with blue background and top rounded */}
            <div className="flex justify-between items-center px-4 py-4 bg-blue-900 rounded-t-2xl">
                <h2 className="text-lg md:text-2xl font-semibold text-white">
                    Top thuốc bán chạy
                </h2>
                <div className="flex space-x-2">
                    <button
                        onClick={handlePrevious}
                        disabled={currentPage === 1}
                        className="p-2 bg-white hover:bg-blue-100 rounded-full border border-gray-300 disabled:opacity-50"
                    >
                        <FaChevronCircleLeft size={20} className="text-blue-900" />
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={currentPage === totalPages}
                        className="p-2 bg-white hover:bg-blue-100 rounded-full border border-gray-300 disabled:opacity-50"
                    >
                        <FaChevronCircleRight size={20} className="text-blue-900" />
                    </button>
                </div>
            </div>

            {/* Nội dung */}
            {products.length === 0 ? (
                <p className="text-center text-gray-500 mt-4">Không có sản phẩm nào.</p>
            ) : (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentPage}
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-6 px-2"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.4 }}
                    >
                        {selectedProducts.map((product) => (
                            <CardProduct key={product.id} product={product} />
                        ))}
                    </motion.div>
                </AnimatePresence>
            )}
        </section>
    );
}