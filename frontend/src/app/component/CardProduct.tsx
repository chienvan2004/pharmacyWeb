import { Product } from "@/types/productInterface";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "./button/handleAddToCart";

interface CardProductProps {
    product: Product;
}

function CardProduct({ product }: CardProductProps) {
    const hasSale = product.product_sale !== null;
    const discountAmount = hasSale
        ? product.buying_price * (product.product_sale.sale_price / 100)
        : 0;
    const finalPrice = product.buying_price - discountAmount;

    const formatPrice = (price: number | string) => {
        const parsedPrice = parseFloat(price as string);
        return price && !isNaN(parsedPrice)
            ? new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
            }).format(parsedPrice)
            : "0";
    };

    return (
        <div
            key={product.id}
            className="bg-white rounded-xl p-2 sm:p-3 border border-gray-200 shadow-sm relative group hover:shadow-md transition overflow-hidden flex flex-col h-full" // Thêm flex-col và h-full
        >
            {hasSale && (
                <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded z-30">
                    {product.product_sale.sale_price != null
                        ? `${Number(product.product_sale.sale_price).toFixed(0)}%`
                        : "N/A"}
                </div>
            )}

            <Link href={`/chi-tiet-san-pham/${product.id}?${product.slug}`}>
                <div className="flex-grow"> {/* Cho phép nội dung co giãn */}
                    <div className="w-full aspect-[4/5] mb-2 relative overflow-hidden rounded-md bg-gray-50">
                        {product.images && product.images.length > 0 ? (
                            (() => {
                                const mainImage =
                                    product.images.find((img) => img.is_main) || product.images[0];
                                return (
                                    <Image
                                        src={`http://localhost:8000/${mainImage.image}`}
                                        alt={product.product_name}
                                        fill
                                        className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                                        sizes="(min-width: 768px) 160px, 100vw"
                                        priority
                                    />
                                );
                            })()
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <svg
                                    className="w-10 h-10 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
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

                    <div className="flex flex-wrap gap-1 mb-1 text-[10px] sm:text-xs">
                        {product.tags[0]?.tag_name && (
                            <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                                {product.tags[0].tag_name}
                            </span>
                        )}
                        {product.categories[0]?.category_name && (
                            <span className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded">
                                {product.categories[0].category_name}
                            </span>
                        )}
                    </div>

                    <p className="text-sm font-medium mb-1 line-clamp-2">
                        {product.product_name}
                    </p>

                    {hasSale ? (
                        <>
                            <p className="text-red-600 font-semibold text-sm sm:text-base">
                                {formatPrice(finalPrice)}/{product.unit.unit_name}
                            </p>
                            <p className="text-gray-400 text-xs line-through">
                                {formatPrice(product.buying_price)}/{product.unit.unit_name}
                            </p>
                        </>
                    ) : (
                        <p className="text-gray-800 font-semibold text-sm sm:text-base">
                            {formatPrice(product.buying_price)}/{product.unit.unit_name}
                        </p>
                    )}
                </div>
            </Link>

            {/* Nút cố định ở dưới cùng */}
            <div className="mt-auto"> {/* Đẩy nút xuống dưới cùng */}
                <AddToCartButton
                    productId={product.id}
                    quantity={1}
                    className="w-full py-2 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                />
            </div>
        </div>
    );
}

export default CardProduct;