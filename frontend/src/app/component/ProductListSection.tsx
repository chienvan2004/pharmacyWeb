import CardProduct from "@/app/component/CardProduct";
import { Product } from "@/types/productInterface";

interface ProductListSectionProps {
    products: Product[];
    error?: string | null;
}

export default function ProductListSection({ products, error }: ProductListSectionProps) {
    if (error) {
        return <p className="text-center text-red-600">{error}</p>;
    }

    if (products.length === 0) {
        return <p className="text-center text-gray-600">Không có sản phẩm nào.</p>;
    }

    return (
        <section className="px-4 py-4 my-4 rounded-xl bg-white shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
                {products.map((product) => (
                    <CardProduct key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
}