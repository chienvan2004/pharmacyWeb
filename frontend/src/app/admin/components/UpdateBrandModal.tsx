'use client';

import { Brand } from '@/types/brandInterface';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const UpdateBrandModal = ({
    isOpen,
    onClose,
    onSubmit,
    brand,
    formErrors,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (id: number, data: FormData) => void;
    brand: Brand | null;
    formErrors: { [key: string]: string }
}) => {
    const [brandName, setBrandName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (brand) {
            setBrandName(brand.brand_name || '');
            setDescription(brand.description || '');
        }
    }, [brand]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!brand) return;

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        onSubmit(brand.id, formData);
    };

    if (!brand) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'visible opacity-100' : 'invisible opacity-0' }`}>
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-white opacity-75 backdrop-blur-sm"
                onClick={onClose}>
            </div>

            {/* Modal Box */}
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8"
            >
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                    Cập nhật Thương Hiệu
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Brand Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên thương hiệu
                        </label>
                        <input
                            type="text"
                            name="brand_name"
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                        {formErrors.brand_name && <p className="text-red-500 text-sm">{formErrors.brand_name}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mô tả
                        </label>
                        <textarea
                            name="description"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* Icon upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cập nhật icon (nếu có)
                        </label>
                        <input
                            type="file"
                            name="icon"
                            accept="image/*"
                            className="w-full text-sm"
                        />
                        {brand.icon && (
                            <Image
                                src={`http://localhost:8000/${brand.icon}`}
                                alt="Icon hiện tại"
                                width={50}
                                height={50}
                                className="mt-2 w-16 h-16 object-contain border rounded"
                            />
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Lưu thay đổi
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateBrandModal;
