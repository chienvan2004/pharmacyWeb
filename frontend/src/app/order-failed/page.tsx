'use client';

export default function OrderFailed() {
    return (
        <div className="flex items-center justify-center h-screen flex-col">
            <h1 className="text-2xl font-bold text-red-600">Đặt hàng thất bại!</h1>
            <p>Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
            <button
                onClick={() => window.location.href = '/gio-thuoc'}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
                Quay lại giỏ hàng
            </button>
        </div>
    );
}