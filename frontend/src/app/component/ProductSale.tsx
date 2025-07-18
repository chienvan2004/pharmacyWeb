'use client';

import { Product } from '@/types/productInterface';
import CardProduct from './CardProduct';
import { useState, useCallback, useEffect } from 'react';
import { getProductSale } from '@/services/productsServices';
import Countdown from 'react-countdown';
import { ClipLoader } from 'react-spinners';

export default function ProductSale() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await getProductSale();
                setProducts(response.data);
            } catch (err: any) {
                setError(err.message || 'Không thể tải sản phẩm giảm giá');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const getNextMidnight = useCallback(() => {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);
        if (now >= midnight) midnight.setDate(midnight.getDate() + 1);
        return midnight;
    }, []);

    const [nextReset, setNextReset] = useState(() => getNextMidnight());

    const renderer = ({ hours, minutes, seconds, completed }: {
        hours: number;
        minutes: number;
        seconds: number;
        completed: boolean;
    }) => {
        if (completed) {
            return <span className="text-lg font-bold">Đã kết thúc, chờ ngày mới!</span>;
        } else {
            return (
                <div className="flex items-center space-x-1 text-white text-xl font-bold">
                    <span className="bg-white/40 rounded px-2 py-1 min-w-[60px]">
                        {hours.toString().padStart(2, '0')}
                    </span>
                    <span>:</span>
                    <span className="bg-white/40 rounded px-2 py-1 min-w-[60px]">
                        {minutes.toString().padStart(2, '0')}
                    </span>
                    <span>:</span>
                    <span className="bg-white/40 rounded px-2 py-1 min-w-[60px]">
                        {seconds.toString().padStart(2, '0')}
                    </span>
                </div>
            );
        }
    };

    const onComplete = useCallback(() => {
        setNextReset(getNextMidnight());
    }, [getNextMidnight]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-blue-900">
                <ClipLoader size={48} color="#FFFFFF" />
            </div>
        );
    }

    if (error) {
        return (
            <section className="max-w-7xl mx-auto py-5 rounded-xl bg-blue-900 md:my-5">
                <p className="text-center text-red-600">{error}</p>
            </section>
        );
    }

    return (
        <section className="max-w-7xl mx-auto py-5 rounded-xl bg-blue-900 md:my-5">
            <div className="text-white px-5 rounded-t-xl flex flex-col md:flex-row items-center">
                <h2 className="text-4xl md:text-7xl md:mr-10 font-bold text-yellow-300 italic"
                    style={{
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                        fontFamily: 'serif'
                    }}>
                    Flash Sale
                </h2>
                <div className="text-center mt-2 md:mt-0">
                    <p className="text-sm font-bold uppercase tracking-wide mb-1">KẾT THÚC SAU</p>
                    <div className="bg-opacity-20 rounded-lg px-3 py-2">
                        <Countdown
                            date={nextReset}
                            renderer={renderer}
                            onComplete={onComplete}
                        />
                    </div>
                </div>
            </div>
            {products.length === 0 ? (
                <p className="text-center text-white">Không có sản phẩm nào.</p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6 p-4">
                    {products.map((product) => (
                        <CardProduct key={product.id} product={product} />
                    ))}
                </div>
            )}
        </section>
    );
}