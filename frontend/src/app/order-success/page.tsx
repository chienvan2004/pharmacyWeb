'use client';

import { useSearchParams } from 'next/navigation';

export default function OrderSuccess() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order_id');

    return (
        <div className="flex items-center justify-center h-screen flex-col">
            <h1 className="text-2xl font-bold">Đặt hàng thành công!</h1>
            <p>Mã đơn hàng: {orderId}</p>
            <button
                onClick={() => window.location.href = '/'}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
                Về trang chủ
            </button>
        </div>
    );
}