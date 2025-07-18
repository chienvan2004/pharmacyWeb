'use client';

import Select from "react-select";

interface ProductFilterSectionProps {
    minPrice: number | undefined;
    maxPrice: number | undefined;
    displayMinPrice: string;
    displayMaxPrice: string;
    selectedBrands: string[];
    availableBrands: { value: string; label: string }[];
    sortOrder: "asc" | "desc";
    onMinPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onMaxPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBrandChange: (selected: any) => void;
    onSortChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function ProductFilterSection({
    minPrice,
    maxPrice,
    displayMinPrice,
    displayMaxPrice,
    selectedBrands,
    availableBrands,
    sortOrder,
    onMinPriceChange,
    onMaxPriceChange,
    onBrandChange,
    onSortChange,
}: ProductFilterSectionProps) {
    // Hàm định dạng giá với dấu phân cách hàng nghìn
    const formatPrice = (value: number | undefined): string => {
        if (value === undefined || isNaN(value)) return "";
        return value.toLocaleString("vi-VN");
    };

    // Hàm chuyển chuỗi giá có dấu phân cách thành số
    const parsePrice = (value: string): number | undefined => {
        const cleaned = value.replace(/[^0-9]/g, "");
        return cleaned ? Number(cleaned) : undefined;
    };

    // Xử lý thay đổi giá tối thiểu
    const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, ""); // Chỉ giữ số
        const parsedValue = parsePrice(value);
        onMinPriceChange(e); // Gọi callback từ props
    };

    // Xử lý thay đổi giá tối đa
    const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, ""); // Chỉ giữ số
        const parsedValue = parsePrice(value);
        onMaxPriceChange(e); // Gọi callback từ props
    };

    return (
        <div className="bg-white my-4 rounded-xl p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Lọc và Sắp xếp</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col">
                    <label htmlFor="minPrice" className="mb-1 text-sm font-medium text-gray-700">Giá tối thiểu</label>
                    <input
                        id="minPrice"
                        type="text"
                        value={displayMinPrice}
                        onChange={handleMinPriceChange}
                        placeholder="VD: 100,000"
                        className="rounded-md p-2 text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-200 transition"
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="maxPrice" className="mb-1 text-sm font-medium text-gray-700">Giá tối đa</label>
                    <input
                        id="maxPrice"
                        type="text"
                        value={displayMaxPrice}
                        onChange={handleMaxPriceChange}
                        placeholder="VD: 500,000"
                        className="rounded-md p-2 text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-200 transition"
                    />
                </div>
                <div className="z-50">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thương hiệu</label>
                    <Select
                        isMulti
                        options={availableBrands}
                        onChange={(selected) => onBrandChange(selected)}
                        value={availableBrands.filter((option) => selectedBrands.includes(option.value))}
                        className="text-sm"
                        classNamePrefix="select"
                        placeholder="Chọn thương hiệu..."
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="sortOrder" className="mb-1 text-sm font-medium text-gray-700">Sắp xếp theo giá</label>
                    <select
                        id="sortOrder"
                        value={sortOrder}
                        onChange={onSortChange}
                        className="rounded-md p-2 text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-200 transition"
                    >
                        <option value="asc">Giá: Thấp đến Cao</option>
                        <option value="desc">Giá: Cao đến Thấp</option>
                    </select>
                </div>
            </div>
        </div>
    );
}