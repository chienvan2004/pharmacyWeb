'use client';

import { useRouter } from 'next/navigation';
import { use, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';
import Link from 'next/link';
import { showCoupon, updateCoupon } from '@/services/couponServices';
import { getAllProducts } from '@/services/productsServices';
import { Product } from '@/types/productInterface';
import * as XLSX from 'xlsx'; // Thêm thư viện xlsx

export default function UpdateCouponPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const id = resolvedParams.id;
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [formData, setFormData] = useState({
        code: '',
        discount_value: '',
        discount_type: 'percent',
        times_used: '0',
        max_usage: '',
        order_amount_limit: '',
        coupon_start_date: '',
        coupon_end_date: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [productSelect, setProductSelect] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch coupon data and products
    useEffect(() => {
        async function fetchData() {
            if (!id) return;
            setLoading(true);
            try {
                const [couponRes, productsRes] = await Promise.all([
                    showCoupon(Number(id)),
                    getAllProducts(1, 100),
                ]);

                const coupon = couponRes.data;
                setProducts(productsRes.data);

                // Pre-fill form data
                setFormData({
                    code: coupon.code || '',
                    discount_value: coupon.discount_value?.toString() || '',
                    discount_type: coupon.discount_type || 'percent',
                    times_used: coupon.times_used?.toString() || '0',
                    max_usage: coupon.max_usage?.toString() || '',
                    order_amount_limit: coupon.order_amount_limit?.toString() || '',
                    coupon_start_date: coupon.coupon_start_date ? new Date(coupon.coupon_start_date).toISOString().slice(0, 16) : '',
                    coupon_end_date: coupon.coupon_end_date ? new Date(coupon.coupon_end_date).toISOString().slice(0, 16) : '',
                });

                // Set selected products
                setSelectedProducts(coupon.products?.map((prod: any) => prod.id) || []);
            } catch (error) {
                console.error('Fetch data error:', error);
                toast.error('Không thể tải dữ liệu coupon.');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Kiểm tra discount_value nếu discount_type là percent
        if (name === 'discount_value' && formData.discount_type === 'percent') {
            const numValue = parseFloat(value);
            if (value !== '' && (numValue < 1 || numValue > 100)) {
                setErrors((prev) => ({
                    ...prev,
                    discount_value: 'Giá trị giảm giá phải từ 1 đến 100 khi loại giảm giá là phần trăm',
                }));
                return;
            }
        }

        setErrors((prev) => ({
            ...prev,
            discount_value: '',
        }));

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

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

    // Xử lý khi người dùng chọn file Excel
    const handleImportExcelClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const reader = new FileReader();
            reader.onload = (event) => {
                const binaryStr = event.target?.result;
                const workbook = XLSX.read(binaryStr, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(sheet);

                // Giả định file Excel có cột "product_id" hoặc "product_name"
                const importedProductIds: number[] = [];
                data.forEach((row: any) => {
                    const productId = row.product_id ? Number(row.product_id) : null;
                    const productName = row.product_name || '';

                    if (productId) {
                        const product = products.find((p) => p.id === productId);
                        if (product && !selectedProducts.includes(productId)) {
                            importedProductIds.push(productId);
                        }
                    } else if (productName) {
                        const product = products.find((p) => p.product_name.toLowerCase() === productName.toLowerCase());
                        if (product && !selectedProducts.includes(product.id)) {
                            importedProductIds.push(product.id);
                        }
                    }
                });

                if (importedProductIds.length === 0) {
                    toast.error('Không tìm thấy sản phẩm nào hợp lệ trong file Excel!');
                } else {
                    setSelectedProducts((prev) => [...prev, ...importedProductIds]);
                    toast.success(`Đã thêm ${importedProductIds.length} sản phẩm từ file Excel!`);
                }
            };
            reader.readAsBinaryString(file);
        } catch (error) {
            toast.error('Lỗi khi đọc file Excel!');
            console.error(error);
        } finally {
            e.target.value = ''; // Reset input để cho phép chọn lại cùng file
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        if (formData.discount_type === 'percent') {
            const discountValue = parseFloat(formData.discount_value);
            if (formData.discount_value && (discountValue < 1 || discountValue > 100)) {
                setErrors((prev) => ({
                    ...prev,
                    discount_value: 'Giá trị giảm giá phải từ 1 đến 100 khi loại giảm giá là phần trăm',
                }));
                return;
            }
        }

        const data = new FormData();
        data.append('code', formData.code);
        data.append('discount_value', formData.discount_value);
        data.append('discount_type', formData.discount_type);
        data.append('times_used', formData.times_used);
        data.append('max_usage', formData.max_usage || '');
        data.append('order_amount_limit', formData.order_amount_limit || '');
        data.append('coupon_start_date', formData.coupon_start_date || '');
        data.append('coupon_end_date', formData.coupon_end_date || '');

        if (selectedProducts.length > 0) {
            selectedProducts.forEach((id) => data.append('products[]', id.toString()));
        }

        // Log chi tiết hơn
        const entries = Array.from(data.entries());
        console.log('FormData entries:', entries);

        try {
            const response = await updateCoupon(Number(id), data);
            console.log('Coupon updated:', response.data);
            toast.success('Cập nhật coupon thành công! 🎉');
            router.push('/admin/coupon');
        } catch (error: any) {
            if (error.errors) {
                const formatted: { [key: string]: string } = {};
                for (const key in error.errors) {
                    formatted[key] = error.errors[key][0];
                }
                setErrors(formatted);
            }
            console.error(error);
            toast.error('Cập nhật coupon thất bại.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <ClipLoader color="#123abc" size={50} />
            </div>
        );
    }

    return (
        <div className="overflow-x-auto p-4">
            <div className="flex items-center justify-between bg-gray-200 w-full h-16 px-6 mb-7 rounded">
                <h1 className="text-lg font-semibold">Cập nhật Coupon</h1>
                <Link href="/admin/coupon">
                    <button className="bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700">Quay lại</button>
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Mã Coupon */}
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-6">
                        <label className="block mb-1 font-medium text-gray-700">
                            <span className="text-red-500 text-xl">*</span> Mã Coupon
                        </label>
                        <input
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            className="w-full border rounded p-2"
                            placeholder="Nhập mã coupon (ví dụ: SALE2025)"
                        />
                        {errors.code && <p className="text-red-500 text-sm">{errors.code}</p>}
                    </div>
                    <div className="col-span-6">
                        <label className="block mb-1 font-medium text-gray-700">
                            <span className="text-red-500 text-xl">*</span> Giá trị giảm giá
                        </label>
                        <input
                            type="number"
                            name="discount_value"
                            value={formData.discount_value}
                            onChange={handleChange}
                            className="w-full border rounded p-2"
                            min={formData.discount_type === 'percent' ? 1 : 0}
                            max={formData.discount_type === 'percent' ? 100 : undefined}
                            step="0.01"
                            placeholder="Nhập giá trị giảm (VD: 10.50)"
                        />
                        {errors.discount_value && <p className="text-red-500 text-sm">{errors.discount_value}</p>}
                    </div>
                </div>

                {/* Loại giảm giá */}
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-6">
                        <label className="block mb-1 font-medium text-gray-700">
                            <span className="text-red-500 text-xl">*</span> Loại giảm giá
                        </label>
                        <select
                            name="discount_type"
                            value={formData.discount_type}
                            onChange={(e) => {
                                handleChange(e);
                                setFormData((prev) => ({
                                    ...prev,
                                    discount_value: '',
                                }));
                                setErrors((prev) => ({
                                    ...prev,
                                    discount_value: '',
                                }));
                            }}
                            className="w-full border rounded p-2"
                        >
                            <option value="percent">Phần trăm (%)</option>
                            <option value="vnd">VND</option>
                            <option value="shipping">Miễn phí vận chuyển</option>
                        </select>
                        {errors.discount_type && <p className="text-red-500 text-sm">{errors.discount_type}</p>}
                    </div>
                    <div className="col-span-6">
                        <label className="block mb-1 font-medium text-gray-700">Số lần đã sử dụng</label>
                        <input
                            type="number"
                            name="times_used"
                            value={formData.times_used}
                            onChange={handleChange}
                            className="w-full border rounded p-2"
                            min="0"
                            disabled
                        />
                        {errors.times_used && <p className="text-red-500 text-sm">{errors.times_used}</p>}
                    </div>
                </div>

                {/* Số lần sử dụng tối đa, Giá trị đơn hàng tối thiểu */}
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-6">
                        <label className="block mb-1 font-medium text-gray-700">Số lần sử dụng tối đa</label>
                        <input
                            type="number"
                            name="max_usage"
                            value={formData.max_usage}
                            onChange={handleChange}
                            className="w-full border rounded p-2"
                            min="0"
                            placeholder="Nhập số lần tối đa (không bắt buộc)"
                        />
                        {errors.max_usage && <p className="text-red-500 text-sm">{errors.max_usage}</p>}
                    </div>
                    <div className="col-span-6">
                        <label className="block mb-1 font-medium text-gray-700">Giá trị đơn hàng tối thiểu (VNĐ)</label>
                        <input
                            type="number"
                            name="order_amount_limit"
                            value={formData.order_amount_limit}
                            onChange={handleChange}
                            className="w-full border rounded p-2"
                            min="0"
                            step="0.01"
                            placeholder="Nhập giá trị tối thiểu (không bắt buộc)"
                        />
                        {errors.order_amount_limit && <p className="text-red-500 text-sm">{errors.order_amount_limit}</p>}
                    </div>
                </div>

                {/* Ngày bắt đầu, Ngày kết thúc */}
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-6">
                        <label className="block mb-1 font-medium text-gray-700">
                            <span className="text-red-500 text-xl">*</span> Ngày bắt đầu
                        </label>
                        <input
                            type="datetime-local"
                            name="coupon_start_date"
                            value={formData.coupon_start_date}
                            onChange={handleChange}
                            className="w-full border rounded p-2"
                            min={new Date().toISOString().slice(0, 16)}
                        />
                        {errors.coupon_start_date && <p className="text-red-500 text-sm">{errors.coupon_start_date}</p>}
                    </div>
                    <div className="col-span-6">
                        <label className="block mb-1 font-medium text-gray-700">
                            <span className="text-red-500 text-xl">*</span> Ngày kết thúc
                        </label>
                        <input
                            type="datetime-local"
                            name="coupon_end_date"
                            value={formData.coupon_end_date}
                            onChange={handleChange}
                            className="w-full border rounded p-2"
                            min={formData.coupon_start_date || new Date().toISOString().slice(0, 16)}
                        />
                        {errors.coupon_end_date && <p className="text-red-500 text-sm">{errors.coupon_end_date}</p>}
                    </div>
                </div>

                {/* Danh sách sản phẩm áp dụng */}
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12">
                        <label className="block mb-1 font-medium text-gray-700">Sản phẩm áp dụng</label>
                        <div className="flex gap-2 mb-2">
                            <select
                                value={productSelect}
                                onChange={handleProductSelect}
                                className="w-full border rounded p-2"
                            >
                                <option value="">Chọn sản phẩm</option>
                                {products.map((product) => (
                                    <option key={product.id} value={product.id}>
                                        {product.product_name}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={handleImportExcelClick}
                                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 text-sm"
                            >
                                Nhập từ Excel
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
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
                        {errors.products && <p className="text-red-500 text-sm">{errors.products}</p>}
                    </div>
                </div>

                {/* Nút lưu */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition h-14"
                    >
                        Cập nhật Coupon
                    </button>
                </div>
            </form>
        </div>
    );
}