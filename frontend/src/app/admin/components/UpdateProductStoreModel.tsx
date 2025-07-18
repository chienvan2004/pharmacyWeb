'use client';

import { showProduct } from '@/services/productsServices';
import { ProductStore } from '@/types/productStoreInterface';
import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface FormErrors {
    [key: string]: string;
}

interface UpdateProductStoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (id: number, data: FormData) => void;
    productStore: ProductStore | null;
    formErrors: FormErrors;
}

const UpdateProductStoreModal: React.FC<UpdateProductStoreModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    productStore,
    formErrors,
}) => {
    const [productId, setProductId] = useState<number | undefined>(undefined);
    const [productName, setProductName] = useState<string>('');
    const [rootPrice, setRootPrice] = useState<string>('');
    const [quantity, setQuantity] = useState<string>('');
    const [productNotFound, setProductNotFound] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (productStore) {
            setProductId(productStore.product_id);
            setProductName(productStore.product.product_name || '');
            setRootPrice(String(productStore.root_price || ''));
            setQuantity(String(productStore.quantity || ''));
            setProductNotFound(false);
        }
    }, [productStore]);

    const handleProductIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '') {
            setProductId(undefined);
            setProductName('');
            setProductNotFound(false);
        } else {
            setProductId(Number(value));
        }
    };

    useEffect(() => {
        const fetchProductName = async () => {
            if (productId) {
                setLoading(true);
                try {
                    const response = await showProduct(productId);
                    setProductName(response.data.product_name);
                    setProductNotFound(false);
                } catch (error) {
                    console.error('Không tìm thấy sản phẩm!');
                    setProductName('');
                    setProductNotFound(true);
                } finally {
                    setLoading(false);
                }
            } else {
                setProductName('');
                setProductNotFound(false);
            }
        };

        fetchProductName();
    }, [productId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!productStore) return;

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        onSubmit(productStore.id, formData);
    };

    if (!productStore) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 bg-white w-full max-w-2xl rounded-2xl shadow-lg p-8 space-y-6"
            >
                <h2 className="text-3xl font-bold text-center text-gray-800">
                    Cập nhật sản phẩm trong kho
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-gray-700 font-medium">
                            Mã sản phẩm
                        </label>
                        <input
                            type="number"
                            name="product_id"
                            value={productId ?? ''}
                            onChange={handleProductIdChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
                            placeholder="Nhập mã sản phẩm..."
                            required
                        />
                        {formErrors.product_id && (
                            <p className="text-red-500 text-sm">{formErrors.product_id}</p>
                        )}
                        <div className="min-h-[24px] mt-1">
                            {loading && (
                                <div className="flex items-center text-gray-500 text-sm gap-1">
                                    <Loader2 className="animate-spin w-4 h-4" /> Đang tìm kiếm sản phẩm...
                                </div>
                            )}
                            {!loading && productName && (
                                <p className="text-green-600 text-sm">
                                    Tên sản phẩm: <span className="font-semibold">{productName}</span>
                                </p>
                            )}
                            {!loading && productNotFound && (
                                <p className="text-red-500 text-sm">
                                    Không tìm thấy sản phẩm
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-gray-700 font-medium">
                            Giá gốc
                        </label>
                        <input
                            type="number"
                            name="root_price"
                            value={rootPrice}
                            onChange={(e) => setRootPrice(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
                            placeholder="Nhập giá gốc..."
                            required
                        />
                        {formErrors.root_price && (
                            <p className="text-red-500 text-sm">{formErrors.root_price}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-gray-700 font-medium">
                            Số lượng nhập kho
                        </label>
                        <input
                            type="number"
                            name="quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
                            placeholder="Nhập số lượng..."
                            required
                        />
                        {formErrors.quantity && (
                            <p className="text-red-500 text-sm">{formErrors.quantity}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                            Lưu thay đổi
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateProductStoreModal;