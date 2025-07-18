// components/StoreTagModal.tsx
import React, { useState } from 'react';
import { Product } from '@/types/productInterface';

interface FormErrors {
    [key: string]: string;
}

interface StoreTagModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    formErrors: FormErrors;
    products: Product[];
}

const StoreTagModal: React.FC<StoreTagModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    formErrors,
    products,
}) => {
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [productSelect, setProductSelect] = useState('');

    const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value && !selectedProducts.includes(Number(value))) {
            setSelectedProducts((prev) => [...prev, Number(value)]);
        }
        setProductSelect('');
    };

    const removeProduct = (id: number) => {
        setSelectedProducts((prev) => prev.filter((item) => item !== id));
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'
                }`}
        >
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 transform transition-all duration-300 scale-100"
            >
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                    Thêm tag sản phẩm
                </h2>

                <form onSubmit={onSubmit} className="space-y-5">
                    {/* Tag Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên tag
                        </label>
                        <input
                            type="text"
                            name="tag_name"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
                        />
                        {formErrors.tag_name && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.tag_name}</p>
                        )}
                    </div>

                    {/* Products */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sản phẩm
                        </label>
                        <select
                            value={productSelect}
                            onChange={handleProductSelect}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition mb-2"
                        >
                            <option value="">Chọn sản phẩm</option>
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.product_name}
                                </option>
                            ))}
                        </select>
                        <div className="flex flex-wrap gap-2">
                            {selectedProducts.map((id) => {
                                const product = products.find((p) => p.id === id);
                                return product ? (
                                    <button
                                        key={id}
                                        type="button"
                                        onClick={() => removeProduct(id)}
                                        className="flex items-center gap-1 px-3 py-1 rounded border bg-blue-500 text-white border-blue-500"
                                    >
                                        {product.product_name}
                                        <span>×</span>
                                    </button>
                                ) : null;
                            })}
                        </div>
                        {/* Thêm input ẩn cho từng product ID */}
                        {selectedProducts.map((id) => (
                            <input
                                key={id}
                                type="hidden"
                                name="products[]"
                                value={id}
                            />
                        ))}
                        {formErrors.products && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.products}</p>
                        )}
                    </div>

                    {/* Status */}
                    <div>
                        <label
                            htmlFor="active"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Trạng thái
                        </label>
                        <select
                            name="active"
                            id="active"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
                        >
                            <option value="1">Kích hoạt</option>
                            <option value="0">Không kích hoạt</option>
                        </select>
                        {formErrors.active && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.active}</p>
                        )}
                    </div>

                    {/* Action Buttons */}
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
                            Lưu
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StoreTagModal;