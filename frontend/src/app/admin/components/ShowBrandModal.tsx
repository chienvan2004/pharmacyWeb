import React from 'react';
import Image from 'next/image';
import { Brand } from '@/types/brandInterface';

const ShowBrandModal = ({
    isOpen,
    onClose,
    brand,
}: {
    isOpen: boolean;
    onClose: () => void;
    brand: Brand | null;
}) => {
    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'
                }`}
        >
            <div
                className="absolute inset-0 bg-black opacity-50 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 bg-white w-full max-w-4xl max-h-screen overflow-y-auto rounded-lg shadow-xl p-8 transform transition-all duration-300 scale-100"
            >
                <div className="flex items-start space-x-6">
                    {/* Placeholder Image (replace with actual logic if needed) */}
                    <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center">
                        {brand?.icon ? (
                            <div className="relative w-32 h-32 overflow-hidden rounded">
                                <Image
                                    src={`http://localhost:8000/${brand.icon}`}
                                    alt={brand.brand_name}
                                    layout="fill"
                                    objectFit="cover"
                                />
                            </div>
                        ) : (
                            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        )}
                    </div>

                    {/* Brand Information */}
                    <div className="flex-grow">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">{brand?.brand_name}</h2>
                        {brand?.description && (
                            <p className="text-gray-700 text-sm leading-relaxed">{brand.description}</p>
                        )}
                        {!brand?.description && <p className="text-gray-500 text-sm">Không có mô tả chi tiết.</p>}
                    </div>
                </div>

                <div className="flex justify-end mt-8">
                    <button
                        onClick={onClose}
                        className="px-5 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition text-lg"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShowBrandModal;