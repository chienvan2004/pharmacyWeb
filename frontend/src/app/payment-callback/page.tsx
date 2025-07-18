'use client';

import orderService from '@/services/orderService';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function PaymentCallback() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const handleCallback = async () => {
            // Lấy các tham số từ URL
            const params = Object.fromEntries(searchParams.entries());
            const vnpParams: any = {
                vnp_Amount: parseInt(params.vnp_Amount || '0'),
                vnp_BankCode: params.vnp_BankCode || '',
                vnp_BankTranNo: params.vnp_BankTranNo || '',
                vnp_CardType: params.vnp_CardType || '',
                vnp_OrderInfo: params.vnp_OrderInfo || '',
                vnp_PayDate: params.vnp_PayDate || '',
                vnp_ResponseCode: params.vnp_ResponseCode || '',
                vnp_TmnCode: params.vnp_TmnCode || '',
                vnp_TransactionNo: params.vnp_TransactionNo || '',
                vnp_TxnRef: params.vnp_TxnRef || '',
                vnp_SecureHash: params.vnp_SecureHash || '',
            };

            try {
                const response = await orderService.handleVnpayReturn(vnpParams);
                if (response.status === 'success') {
                    toast.success('Thanh toán thành công!');
                    router.push(`/order-success?order_id=${response.order_id}`);
                } else {
                    toast.error('Thanh toán thất bại!');
                    router.push('/order-failed');
                }
            } catch (error) {
                console.error('Lỗi xử lý callback:', error);
                toast.error('Lỗi khi xử lý thanh toán. Vui lòng thử lại!');
                router.push('/order-failed');
            }
        };

        handleCallback();
    }, [searchParams, router]);

    return (
        <div className="flex items-center justify-center h-screen">
            <p className="text-lg">Đang xử lý thanh toán, vui lòng đợi...</p>
        </div>
    );
}