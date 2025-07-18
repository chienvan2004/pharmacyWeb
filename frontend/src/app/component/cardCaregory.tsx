'use client';

import { Category } from "@/types/categoryInterface";
import Image from "next/image";
import Link from "next/link";

interface CategorySectionProps {
    categories: Category[];
}

export default function CategorySection({ categories }: CategorySectionProps) {
    return (
        <section className="max-w-7xl mx-auto px-4 py-6">
            {/* Desktop view */}
            <div className="hidden md:grid md:grid-cols-8 gap-4 text-center">
                {categories.map((cat) => (
                    <Link
                        key={cat.id}
                        href={`/danh-muc/${cat.id}`}
                        className="flex flex-col items-center justify-center rounded-xl bg-blue-50 p-3 hover:bg-blue-100 transition-colors duration-200"
                    >
                        <div className="mb-2 overflow-hidden">
                            <Image
                                src={`http://localhost:8000/${cat.icon}`}
                                alt={cat.category_name}
                                width={70}
                                height={70}
                                className="object-contain"
                            />
                        </div>
                        <p className="text-sm font-medium text-center leading-tight mt-4">
                            {cat.category_name}
                        </p>
                    </Link>
                ))}
            </div>

            {/* Mobile view */}
            <div className="md:hidden overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 pb-2">
                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/danh-muc/${cat.id}`}
                            className="flex flex-col items-center justify-center bg-blue-50 shadow-sm rounded-lg p-3 min-w-[100px] transition-transform hover:scale-105"
                        >
                            <div className="mb-2">
                                <Image
                                    src={`http://localhost:8000/${cat.icon}`}
                                    alt={cat.category_name}
                                    width={40}
                                    height={40}
                                    className="object-contain"
                                />
                            </div>
                            <p className="text-xs font-semibold text-gray-800 text-center">
                                {cat.category_name}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}