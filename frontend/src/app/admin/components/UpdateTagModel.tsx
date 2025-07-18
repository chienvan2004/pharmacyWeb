'use client';

import { Tag } from '@/types/tagInterface';
import { Product } from '@/types/productInterface';
import { useEffect, useState } from 'react';

interface UpdateTagModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (id: number, data: FormData) => void; // Giữ nguyên props hiện tại
    tag: Tag | null;
    formErrors: { [key: string]: string };
    products: Product[];
}

const UpdateTagModal: React.FC<UpdateTagModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    tag,
    formErrors,
    products,
}) => {
    const [tagName, setTagName] = useState('');
    const [active, setActive] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [productSelect, setProductSelect] = useState('');

    // Load dữ liệu tag khi mở modal
    useEffect(() => {
        if (tag) {
            setTagName(tag.tag_name || '');
            setActive(tag.active || false);
            // Load danh sách sản phẩm đã liên kết từ tag.products
            const productIds = tag.products
                ? tag.products.map((p: any) => p.id)
                : tag.product_ids || [];
            setSelectedProducts(productIds);
        }
    }, [tag]);

    // Thêm sản phẩm mới vào danh sách đã chọn
    const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value && !selectedProducts.includes(Number(value))) {
            setSelectedProducts((prev) => [...prev, Number(value)]);
        }
        setProductSelect('');
    };

    // Xóa sản phẩm khỏi danh sách đã chọn
    const removeProduct = (id: number) => {
        setSelectedProducts((prev) => prev.filter((item) => item !== id));
    };

    // Xử lý submit form
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!tag) return;

        const formData = new FormData();
        formData.append('tag_name', tagName);
        formData.append('active', active ? '1' : '0');
        // Gửi danh sách sản phẩm đã chọn (chỉ các ID còn lại sau khi xóa)
        selectedProducts.forEach((id) => formData.append('products[]', id.toString()));

        // Log để debug
        const entries = Array.from(formData.entries());
        console.log('FormData entries sent to backend:', entries);

        onSubmit(tag.id, formData); // Gửi dữ liệu đã cập nhật
    };

    if (!tag) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}
        >
            <div
                className="absolute inset-0 bg-white opacity-75 backdrop-blur-sm"
                onClick={onClose}
            />

            <div
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8"
            >
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                    Cập nhật Thẻ
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Tag Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên thẻ <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="tag_name"
                            value={tagName}
                            onChange={(e) => setTagName(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                        {formErrors.tag_name && (
                            <p className="text-red-500 text-sm">{formErrors.tag_name}</p>
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
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none mb-2"
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
                        {formErrors.products && (
                            <p className="text-red-500 text-sm">{formErrors.products}</p>
                        )}
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Trạng thái
                        </label>
                        <select
                            name="active"
                            value={active ? '1' : '0'}
                            onChange={(e) => setActive(e.target.value === '1')}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            <option value="1">Kích hoạt</option>
                            <option value="0">Không kích hoạt</option>
                        </select>
                        {formErrors.active && (
                            <p className="text-red-500 text-sm">{formErrors.active}</p>
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

export default UpdateTagModal;