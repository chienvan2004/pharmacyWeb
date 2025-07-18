"use client";

import Pagination from "@/app/component/button/Pagination";
import CategorySection from "@/app/component/cardCaregory";
import CardProduct from "@/app/component/CardProduct";
import { showCategory } from "@/services/categoryServices";
import { getProductWithCategory } from "@/services/productsServices";
import { Category } from "@/types/categoryInterface";
import { Product } from "@/types/productInterface";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Select from "react-select";
import { ClipLoader } from "react-spinners";

export default function CategoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
    const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
    const [displayMinPrice, setDisplayMinPrice] = useState<string>("");
    const [displayMaxPrice, setDisplayMaxPrice] = useState<string>("");
    const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
    const [availableBrands, setAvailableBrands] = useState<{ value: number; label: string }[]>([]);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const params = useParams();
    const id = params.id;
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [lastPage, setLastPage] = useState(1);

    const formatPrice = (value: number | undefined): string => {
        if (value === undefined || isNaN(value)) return "";
        return value.toLocaleString("vi-VN");
    };

    const parsePrice = (value: string): number | undefined => {
        const cleaned = value.replace(/[^0-9]/g, "");
        return cleaned ? Number(cleaned) : undefined;
    };

    const fetchProducts = async () => {
        try {
            const catId = Number(id);
            const categoryResponse = await showCategory(catId);
            console.log("Category Response:", categoryResponse.data);
            setCategory(categoryResponse.data);

            const response = await getProductWithCategory(catId, currentPage, perPage, {
                sort_by: "buying_price",
                order: sortOrder,
                min_price: minPrice,
                max_price: maxPrice,
                brands: selectedBrands.length > 0 ? selectedBrands : undefined,
            });
            console.log("API Response:", response);
            setProducts(response.data || []);
            setTotalItems(response.meta?.total ?? 0);
            setLastPage(response.meta?.last_page ?? 1);

            if (availableBrands.length === 0) {
                const brandMap = new Map<number, { id: number; name: string }>();
                response.data
                    .flatMap((product: Product) =>
                        product.brands?.map((brand) => ({
                            id: brand.id,
                            name: brand.brand_name,
                        }))
                    )
                    .filter((brand): brand is { id: number; name: string } => !!brand.id)
                    .forEach((brand) => brandMap.set(brand.id, brand));

                const uniqueBrands = Array.from(brandMap.values()).map((brand) => ({
                    value: brand.id,
                    label: brand.name,
                }));
                console.log("Unique Brands:", uniqueBrands);
                setAvailableBrands(uniqueBrands);
            }

            setLoading(false);
        } catch (err) {
            setError("Không thể tải sản phẩm. Vui lòng thử lại.");
            setLoading(false);
            console.error("Lỗi khi tải sản phẩm:", err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [id, minPrice, maxPrice, selectedBrands, sortOrder, currentPage]);

    const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, "");
        const parsedValue = parsePrice(value);
        setMinPrice(parsedValue);
        setDisplayMinPrice(parsedValue ? formatPrice(parsedValue) : "");
        setCurrentPage(1);
    };

    const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, "");
        const parsedValue = parsePrice(value);
        setMaxPrice(parsedValue);
        setDisplayMaxPrice(parsedValue ? formatPrice(parsedValue) : "");
        setCurrentPage(1);
    };

    const handleMultiSelectChange = (selected: any) => {
        const selectedValues = selected ? selected.map((option: any) => option.value) : [];
        setSelectedBrands(selectedValues);
        setCurrentPage(1);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortOrder(e.target.value as "asc" | "desc");
        setCurrentPage(1);
    };

    const children_categories = category?.children_categories;

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white">
                <ClipLoader size={48} color="#2563EB" />
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-red-600">{error}</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4">
            <div className="bg-white mt-5 rounded-2xl p-4 shadow-sm">
                <div className="text-xl font-bold mb-4">{category?.category_name}</div>
                <CategorySection categories={children_categories} />
            </div>

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
                            onChange={handleMultiSelectChange}
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
                            onChange={handleSortChange}
                            className="rounded-md p-2 text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-200 transition"
                        >
                            <option value="asc">Giá: Thấp đến Cao</option>
                            <option value="desc">Giá: Cao đến Thấp</option>
                        </select>
                    </div>
                </div>
            </div>

            <section className="px-4 py-4 my-4 rounded-xl bg-white shadow-sm">
                {error ? (
                    <p className="text-center text-red-600">{error}</p>
                ) : products.length === 0 ? (
                    <p className="text-center text-gray-600">Không có sản phẩm nào.</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
                        {products.map((product) => (
                            <CardProduct key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </section>
            <Pagination
                currentPage={currentPage}
                perPage={perPage}
                totalItems={totalItems}
                lastPage={lastPage}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}