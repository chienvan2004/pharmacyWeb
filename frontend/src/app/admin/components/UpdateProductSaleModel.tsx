'use client';

import { showProduct } from '@/services/productsServices';
import { ProductSale } from '@/types/productSaleInterface';
import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface FormErrors {
    [key: string]: string;
}

interface UpdateProductSaleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (id: number, data: FormData) => void;
    productSale: ProductSale | null;
    formErrors: FormErrors;
}

const UpdateProductSaleModel: React.FC<UpdateProductSaleModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    productSale,
    formErrors,
}) => {
    const [productId, setProductId] = useState<number | undefined>(undefined);
    const [productName, setProductName] = useState<string>('');
    const [salePrice, setSalePrice] = useState<string>('');
    const [saleStartDate, setSaleStartDate] = useState<string>('');
    const [saleEndDate, setSaleEndDate] = useState<string>('');
    const [productNotFound, setProductNotFound] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (productSale) {
            setProductId(productSale.product_id);
            setProductName(productSale.product.product_name || '');
            setSalePrice(String(productSale.sale_price || ''));

            // Hàm chuyển đổi định dạng ngày giờ về YYYY-MM-DDTHH:mm
            const formatDateTime = (dateStr: string | undefined): string => {
                if (!dateStr) return '';
                try {
                    const date = new Date(dateStr);
                    if (isNaN(date.getTime())) return ''; // Nếu không phải định dạng ngày hợp lệ
                    return date.toISOString().slice(0, 16); // Định dạng YYYY-MM-DDTHH:mm
                } catch (error) {
                    console.error('Lỗi định dạng ngày:', error);
                    return '';
                }
            };

            setSaleStartDate(formatDateTime(productSale.sale_start_date));
            setSaleEndDate(formatDateTime(productSale.sale_end_date));
            setProductNotFound(false);
        } else {
            setProductId(undefined);
            setProductName('');
            setSalePrice('');
            setSaleStartDate('');
            setSaleEndDate('');
            setProductNotFound(false);
        }
    }, [productSale]);

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
                    console.error('Không tìm thấy sản phẩm!', error);
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
        if (!productSale) return;

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        console.log('Submitting with id:', productSale.id, 'formData:', Object.fromEntries(formData));
        onSubmit(productSale.id, formData);
    };

    if (!productSale) return null;

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
                    Cập nhật sản phẩm giảm giá
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
                            Giá giảm (%)
                        </label>
                        <input
                            type="number"
                            name="sale_price"
                            value={salePrice ?? ''}
                            onChange={(e) => {
                                const value = e.target.value === '' ? undefined : Number(e.target.value);
                                if (value === undefined || (value >= 1 && value <= 100)) {
                                    setSalePrice(value);
                                }
                            }}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
                            placeholder="Nhập giá giảm (1-100%)..."
                            min="1"
                            max="100"
                            required
                        />
                        {formErrors.sale_price && (
                            <p className="text-red-500 text-sm">{formErrors.sale_price}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-gray-700 font-medium">
                            Ngày bắt đầu giảm giá
                        </label>
                        <input
                            type="datetime-local"
                            name="sale_start_date"
                            value={saleStartDate}
                            onChange={(e) => setSaleStartDate(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
                            required
                        />
                        {formErrors.sale_start_date && (
                            <p className="text-red-500 text-sm">{formErrors.sale_start_date}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-gray-700 font-medium">
                            Ngày kết thúc giảm giá
                        </label>
                        <input
                            type="datetime-local"
                            name="sale_end_date"
                            value={saleEndDate}
                            onChange={(e) => setSaleEndDate(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
                            required
                            min={saleStartDate || new Date().toISOString().slice(0, 16)}
                        />
                        {formErrors.sale_end_date && (
                            <p className="text-red-500 text-sm">{formErrors.sale_end_date}</p>
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

export default UpdateProductSaleModel;