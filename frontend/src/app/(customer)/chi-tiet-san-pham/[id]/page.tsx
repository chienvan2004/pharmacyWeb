"use client";

import Detail from "@/app/admin/components/Detail";
import AddToCartButton from "@/app/component/button/handleAddToCart";
import CardProduct from "@/app/component/CardProduct";
import { getProductWithCategoryAndBrand, showProduct } from "@/services/productsServices";
import { Product } from "@/types/productInterface";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [relatedLoading, setRelatedLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [relatedError, setRelatedError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage] = useState(5); // Updated to 5 to match the 5-column layout in the image
    const [totalItems, setTotalItems] = useState(0);
    const [lastPage, setLastPage] = useState(1);

    // Fetch product data by ID
    useEffect(() => {
        const fetchData = async () => {
            try {
                const resolvedParams = await params;
                const id = resolvedParams.id;
                const productId = Number(id);

                const response = await showProduct(productId);
                setProduct(response.data);
                const mainImage = response.data.images.find((img: any) => img.is_main);
                setSelectedImage(mainImage ? `http://localhost:8000/${mainImage.image}` : null);
                setLoading(false);
            } catch (err) {
                setError("Không thể tải thông tin sản phẩm. Vui lòng thử lại.");
                setLoading(false);
                console.error("Lỗi khi tải sản phẩm:", err);
            }
        };
        fetchData();
    }, [params]);

    // Fetch related products based on brandId, categoryId, and exclude current product
    useEffect(() => {
        const fetchRelatedProducts = async () => {
            if (!product || !product.brands.length || !product.categories.length) return;

            try {
                setRelatedLoading(true);
                const brandId = product.brands[0].id;
                const categoryId = product.categories[0].id;
                const productId = product.id;
                const response = await getProductWithCategoryAndBrand(brandId, categoryId, currentPage, perPage, productId);
                setRelatedProducts(response.data || []);
                setTotalItems(response.meta?.total ?? 0);
                setLastPage(response.meta?.last_page ?? 1);
                setRelatedLoading(false);
            } catch (err) {
                setRelatedError("Không thể tải sản phẩm liên quan. Vui lòng thử lại.");
                setRelatedLoading(false);
                console.error("Lỗi khi tải sản phẩm liên quan:", err);
            }
        };
        fetchRelatedProducts();
    }, [product, currentPage]);

    // Format price function
    const formatPrice = (price: number | string) => {
        const parsedPrice = parseFloat(price as string);
        return !isNaN(parsedPrice)
            ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(parsedPrice)
            : "0 đ";
    };

    // Handle quantity change
    const handleQuantityChange = (value: number) => {
        if (value >= 1) {
            setQuantity(value);
        }
    };

    // Check for sale price
    const originalPrice = product?.buying_price ?? 0;
    const salePercent = product?.product_sale?.sale_price ?? 0;
    const discountedPrice = originalPrice * (1 - salePercent / 100);

    // Handle page change
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= lastPage) {
            setCurrentPage(newPage);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <ClipLoader size={48} color="#2563EB" />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-red-600 text-lg font-medium">{error || "Sản phẩm không tồn tại."}</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 bg-white rounded-2xl">
                {/* Product Images */}
                <div className="space-y-6">
                    <div className="w-full aspect-[1/1] relative rounded-xl shadow-lg overflow-hidden bg-white">
                        {selectedImage ? (
                            <Image
                                src={selectedImage}
                                alt={product.product_name}
                                fill
                                className="object-contain p-6 transition-transform duration-300 hover:scale-105"
                                sizes="(min-width: 1024px) 500px, 100vw"
                                priority
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <svg className="w-20 h-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {product.images.map((img) => (
                            <div
                                key={img.id}
                                className={`w-20 h-20 relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-200 ${selectedImage === `http://localhost:8000/${img.image}` ? "border-blue-500 shadow-md" : "border-gray-200 hover:border-blue-300"
                                    }`}
                                onClick={() => setSelectedImage(`http://localhost:8000/${img.image}`)}
                            >
                                <Image src={`http://localhost:8000/${img.image}`} alt={product.product_name} fill className="object-contain p-2" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Product Information */}
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold text-gray-900">{product.product_name}</h1>

                    {/* Categories, Brands, Tags */}
                    <div className="flex flex-wrap gap-3">
                        {product.categories.length > 0 && (
                            <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                                Danh mục: {product.categories[0].category_name}
                            </span>
                        )}
                        {product.brands.length > 0 && (
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                Thương hiệu: {product.brands[0].brand_name}
                            </span>
                        )}
                    </div>

                    {/* Price and Sale */}
                    <div className="space-y-2">
                        {product?.product_sale ? (
                            <>
                                <p className="text-red-600 text-3xl font-bold">
                                    {formatPrice(discountedPrice) + (product.unit?.unit_name ? `/${product.unit.unit_name}` : "")}
                                </p>
                                <p className="text-gray-500 text-lg line-through">
                                    {formatPrice(product.buying_price) + (product.unit?.unit_name ? `/${product.unit.unit_name}` : "")}
                                </p>
                                <p className="text-sm text-green-600 font-medium">
                                    Giảm {product.product_sale.sale_price != null ? `${Number(product.product_sale.sale_price).toFixed(0)}%` : "N/A"}
                                </p>
                            </>
                        ) : (
                            <p className="text-gray-900 text-3xl font-bold">
                                {formatPrice(product.buying_price) + (product.unit?.unit_name ? `/${product.unit.unit_name}` : "")}
                            </p>
                        )}
                    </div>

                    {/* Short Description */}
                    {product.short_description && (
                        <div>
                            <p className="text-gray-700 text-xl leading-relaxed">
                                <span className="font-medium">Mô tả ngắn:</span> {product.short_description}
                            </p>
                        </div>
                    )}

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-4">
                        <label className="text-gray-700 font-medium">Số lượng:</label>
                        <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                                onClick={() => handleQuantityChange(quantity - 1)}
                                className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                                disabled={quantity <= 1}
                            >
                                -
                            </button>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                                className="w-16 text-center border-none focus:ring-0"
                                min="1"
                            />
                            <button
                                onClick={() => handleQuantityChange(quantity + 1)}
                                className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <AddToCartButton productId={product.id} quantity={quantity} />
                </div>
            </div>

            {/* Product Description */}
            <div className="mt-12 p-6 bg-white rounded-2xl">
                <div className="rounded-lg">
                    <Detail content={product.product_description?.toString() ?? ""} maxHeight={500} showMoreText="Xem thêm" showLessText="Thu gọn" />
                </div>
            </div>

            {/* Related Products */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Sản phẩm liên quan</h2>
                {relatedLoading ? (
                    <div className="flex items-center justify-center">
                        <ClipLoader size={48} color="#2563EB" />
                    </div>
                ) : relatedError ? (
                    <div className="text-red-600 text-lg font-medium text-center">{relatedError}</div>
                ) : relatedProducts.length > 0 ? (
                    <div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mt-12 p-6 bg-white rounded-2xl">
                            {relatedProducts.map((relatedProduct) => (
                                <CardProduct key={relatedProduct.id} product={relatedProduct} />
                            ))}
                        </div>
                        <div className="flex justify-center items-center gap-4 mt-4">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
                            >
                                &lt;
                            </button>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === lastPage}
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-600 text-center">Không có sản phẩm liên quan.</p>
                )}
            </div>
        </div>
    );
}