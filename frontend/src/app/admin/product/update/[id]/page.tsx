'use client';

import { getAllBrands } from '@/services/brandServices';
import { getAllCategories } from '@/services/categoryServices';
import { showProduct, updateProduct } from '@/services/productsServices';
import { getAllTags } from '@/services/tagService';
import { getAllUnits } from '@/services/unitServices';
import { Brand } from '@/types/brandInterface';
import { Category } from '@/types/categoryInterface';
import { Tag } from '@/types/tagInterface';
import { Unit } from '@/types/unitInterface';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';
const JoditEditor = dynamic(() => import('jodit-react'), {
    ssr: false,
});

export default function UpdateProductPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const id = resolvedParams.id;
    const BASE_URL = 'http://localhost:8000/';
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [formData, setFormData] = useState({
        product_name: '',
        buying_price: '',
        short_description: '',
        product_description: '',
        active: '1',
        disable_out_of_stock: '1',
        categories: [] as string[],
        brands: [] as string[],
        tags: [] as string[],
        images: [] as File[],
        unit_id: '',
    });
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<{ id: number; url: string }[]>([]);
    const [mainImageIndex, setMainImageIndex] = useState<number | null>(null);
    const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [categorySelect, setCategorySelect] = useState('');
    const [brandSelect, setBrandSelect] = useState('');
    const [tagSelect, setTagSelect] = useState('');

    // Fetch product data, categories, brands, tags, and units
    useEffect(() => {
        async function fetchData() {
            if (!id) return;
            setLoading(true);
            try {
                const [productRes, catRes, brandRes, tagRes, unitRes] = await Promise.all([
                    showProduct(Number(id)),
                    getAllCategories(1, 100),
                    getAllBrands(1, 100),
                    getAllTags(1, 100),
                    getAllUnits(),
                ]);

                const product = productRes.data;
                setCategories(catRes.data);
                setBrands(brandRes.data);
                setTags(tagRes.data);
                setUnits(unitRes.data);

                // Pre-fill form data
                setFormData({
                    product_name: product.product_name || '',
                    buying_price: product.buying_price?.toString() || '',
                    short_description: product.short_description || '',
                    product_description: product.product_description || '',
                    active: product.active ? '1' : '0',
                    disable_out_of_stock: product.disable_out_of_stock ? '1' : '0',
                    categories: product.categories?.map((cat: any) => cat.id.toString()) || [],
                    brands: product.brands?.map((brand: any) => brand.id.toString()) || [],
                    tags: product.tags?.map((tag: any) => tag.id.toString()) || [],
                    images: [],
                    unit_id: product.unit_id?.toString() || '',
                });

                // Set selected categories, brands, tags
                setSelectedCategories(product.categories?.map((cat: any) => cat.id) || []);
                setSelectedBrands(product.brands?.map((brand: any) => brand.id) || []);
                setSelectedTags(product.tags?.map((tag: any) => tag.id) || []);

                // Handle existing images with IDs
                const imageUrls = product.images?.map((img: any) => ({
                    id: img.id,
                    url: img.image.startsWith('http') ? img.image : `${BASE_URL}${img.image}`,
                })) || [];
                setExistingImages(imageUrls);
                setPreviewUrls(imageUrls.map((img: any) => img.url));

                // Set main image index
                const mainImg = product.images?.findIndex((img: any) => img.is_main);
                setMainImageIndex(mainImg !== undefined && mainImg >= 0 ? mainImg : null);
            } catch (error) {
                console.error('Fetch data error:', error);
                toast.error('Không thể tải dữ liệu sản phẩm.');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);

    // Update formData when selections change
    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            categories: selectedCategories.map(String),
            brands: selectedBrands.map(String),
            tags: selectedTags.map(String),
        }));
    }, [selectedCategories, selectedBrands, selectedTags]);

    const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value && !selectedCategories.includes(Number(value))) {
            setSelectedCategories((prev) => [...prev, Number(value)]);
        }
        setCategorySelect('');
    };

    const handleBrandSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value && !selectedBrands.includes(Number(value))) {
            setSelectedBrands((prev) => [...prev, Number(value)]);
        }
        setBrandSelect('');
    };

    const handleTagSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value && !selectedTags.includes(Number(value))) {
            setSelectedTags((prev) => [...prev, Number(value)]);
        }
        setTagSelect('');
    };

    const removeCategory = (id: number) => {
        setSelectedCategories((prev) => prev.filter((item) => item !== id));
    };

    const removeBrand = (id: number) => {
        setSelectedBrands((prev) => prev.filter((item) => item !== id));
    };

    const removeTag = (id: number) => {
        setSelectedTags((prev) => prev.filter((item) => item !== id));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleDescriptionChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            product_description: value,
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const fileArray = Array.from(files);
            setFormData((prev) => ({ ...prev, images: [...prev.images, ...fileArray] }));
            const urls = fileArray.map((file) => URL.createObjectURL(file));
            setPreviewUrls((prev) => [...prev, ...urls]);
        }
    };

    const removeImage = (index: number) => {
        if (index < existingImages.length) {
            // Xóa hình ảnh hiện có
            const imageId = existingImages[index].id;
            setDeletedImageIds((prev) => [...prev, imageId]);
            setExistingImages((prev) => prev.filter((_, idx) => idx !== index));
        } else {
            // Xóa hình ảnh mới
            setFormData((prev) => ({
                ...prev,
                images: prev.images.filter((_, idx) => idx !== (index - existingImages.length)),
            }));
        }
        setPreviewUrls((prev) => prev.filter((_, idx) => idx !== index));

        if (mainImageIndex !== null) {
            if (mainImageIndex === index) {
                setMainImageIndex(null);
            } else if (mainImageIndex > index) {
                setMainImageIndex(mainImageIndex - 1);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const data = new FormData();
        data.append('product_name', formData.product_name);
        data.append('buying_price', formData.buying_price);
        data.append('short_description', formData.short_description);
        data.append('active', formData.active);
        data.append('unit_id', formData.unit_id);
        data.append('product_description', formData.product_description);
        data.append('disable_out_of_stock', formData.disable_out_of_stock);

        formData.categories.forEach((id) => data.append('categories[]', id));
        formData.brands.forEach((id) => data.append('brands[]', id));
        formData.tags.forEach((id) => data.append('tags[]', id));
        formData.images.forEach((image, index) => data.append('images[]', image));
        deletedImageIds.forEach((id) => data.append('deleted_images[]', id.toString()));

        if (mainImageIndex !== null) {
            if (mainImageIndex < existingImages.length) {
                // Hình ảnh chính là hình ảnh hiện có
                data.append('existing_main_image_id', existingImages[mainImageIndex].id.toString());
            } else {
                // Hình ảnh chính là hình ảnh mới
                data.append('is_main', (mainImageIndex - existingImages.length).toString());
            }
        }

        try {
            const response = await updateProduct(Number(id), data);
            console.log('Product updated:', response.data);
            toast.success('Cập nhật sản phẩm thành công! 🎉');
            router.push('/admin/product');
        } catch (error: any) {
            if (error.errors) {
                const formatted: { [key: string]: string } = {};
                for (const key in error.errors) {
                    formatted[key] = error.errors[key][0];
                }
                setErrors(formatted);
            }
            console.error(error);
            toast.error('Cập nhật sản phẩm thất bại.');
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
                <h1 className="text-lg font-semibold">Cập nhật sản phẩm</h1>
                <Link href="/admin/product">
                    <button className="bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700">Quay lại</button>
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10" encType="multipart/form-data">
                {/* Tên, Giá, Đơn vị */}
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-9">
                        <label className="block mb-1 font-medium text-gray-700">
                            <label className="text-red-500 text-xl">*</label> Tên sản phẩm
                        </label>
                        <input
                            type="text"
                            name="product_name"
                            value={formData.product_name}
                            onChange={handleChange}
                            className="w-full border rounded p-2"
                        />
                        {errors.product_name && <p className="text-red-500 text-sm">{errors.product_name}</p>}
                    </div>
                    <div className="col-span-3">
                        <label className="block mb-1 font-medium text-gray-700">
                            <label className="text-red-500 text-xl">*</label> Giá (VNĐ)
                        </label>
                        <input
                            type="number"
                            name="buying_price"
                            value={formData.buying_price}
                            onChange={handleChange}
                            className="w-full border rounded p-2"
                            min="0"
                        />
                        {errors.buying_price && <p className="text-red-500 text-sm">{errors.buying_price}</p>}
                    </div>
                </div>

                {/* Mô tả ngắn, đơn vị, trạng thái */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Mô tả ngắn</label>
                        <textarea
                            name="short_description"
                            value={formData.short_description}
                            onChange={handleChange}
                            rows={1}
                            className="w-full border rounded p-2"
                        />
                        {errors.short_description && <p className="text-red-500 text-sm">{errors.short_description}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">Đơn vị</label>
                            <select
                                name="unit_id"
                                value={formData.unit_id}
                                onChange={handleChange}
                                className="w-full border rounded p-2"
                            >
                                {units.map((unit) => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.unit_name}
                                    </option>
                                ))}
                            </select>
                            {errors.unit_id && <p className="text-red-500 text-sm">{errors.unit_id}</p>}
                        </div>
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">Trạng thái bán</label>
                            <select
                                name="disable_out_of_stock"
                                value={formData.disable_out_of_stock}
                                onChange={handleChange}
                                className="w-full border rounded p-2"
                            >
                                <option value="0">Cho phép đặt hàng</option>
                                <option value="1">Không cho phép đặt hàng</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">Trạng thái</label>
                            <select
                                name="active"
                                value={formData.active}
                                onChange={handleChange}
                                className="w-full border rounded p-2"
                            >
                                <option value="1">Hiển thị</option>
                                <option value="0">Ẩn</option>
                            </select>
                            {errors.active && <p className="text-red-500 text-sm">{errors.active}</p>}
                        </div>
                    </div>
                </div>

                {/* Mô tả chi tiết */}
                <div>
                    <label className="block mb-1 font-medium text-gray-700">Mô tả chi tiết</label>
                    <div className="border rounded min-h-[200px] p-2">
                        <JoditEditor value={formData.product_description} onChange={handleDescriptionChange} />
                    </div>
                    {errors.product_description && <p className="text-red-500 text-sm">{errors.product_description}</p>}
                </div>

                {/* Danh mục và Thương hiệu, thẻ */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* danh mục */}
                    <div>
                        <label className="block mb-1 font-medium text-gray-700">
                            <label className="text-red-500 text-xl">*</label> Danh mục
                        </label>
                        <select
                            value={categorySelect}
                            onChange={handleCategorySelect}
                            className="w-full border rounded p-2 mb-2"
                        >
                            <option value="">Chọn danh mục</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.category_name}
                                </option>
                            ))}
                        </select>
                        <div className="flex flex-wrap gap-2">
                            {selectedCategories.map((id) => {
                                const category = categories.find((cat) => cat.id === id);
                                return category ? (
                                    <button
                                        key={id}
                                        type="button"
                                        onClick={() => removeCategory(id)}
                                        className="flex items-center gap-1 px-3 py-1 rounded border bg-blue-500 text-white border-blue-500"
                                    >
                                        {category.category_name}
                                        <span>×</span>
                                    </button>
                                ) : null;
                            })}
                        </div>
                        {errors.categories && <p className="text-red-500 text-sm">{errors.categories}</p>}
                    </div>

                    {/* thương hiệu */}
                    <div>
                        <label className="block mb-1 font-medium text-gray-700">
                            <label className="text-red-500 text-xl">*</label> Thương hiệu
                        </label>
                        <select
                            value={brandSelect}
                            onChange={handleBrandSelect}
                            className="w-full border rounded p-2 mb-2"
                        >
                            <option value="">Chọn thương hiệu</option>
                            {brands.map((brand) => (
                                <option key={brand.id} value={brand.id}>
                                    {brand.brand_name}
                                </option>
                            ))}
                        </select>
                        <div className="flex flex-wrap gap-2">
                            {selectedBrands.map((id) => {
                                const brand = brands.find((b) => b.id === id);
                                return brand ? (
                                    <button
                                        key={id}
                                        type="button"
                                        onClick={() => removeBrand(id)}
                                        className="flex items-center gap-1 px-3 py-1 rounded border bg-green-500 text-white border-green-500"
                                    >
                                        {brand.brand_name}
                                        <span>×</span>
                                    </button>
                                ) : null;
                            })}
                        </div>
                        {errors.brands && <p className="text-red-500 text-sm">{errors.brands}</p>}
                    </div>
                    {/* Thẻ */}
                    <div>
                        <label className="block mb-1 font-medium text-gray-700">
                            <label className="text-red-500 text-xl">*</label> Thẻ
                        </label>
                        <select
                            value={tagSelect}
                            onChange={handleTagSelect}
                            className="w-full border rounded p-2 mb-2"
                        >
                            <option value="">Chọn thẻ</option>
                            {tags.map((tag) => (
                                <option key={tag.id} value={tag.id}>
                                    {tag.tag_name}
                                </option>
                            ))}
                        </select>
                        <div className="flex flex-wrap gap-2">
                            {selectedTags.map((id) => {
                                const tag = tags.find((t) => t.id === id);
                                return tag ? (
                                    <button
                                        key={id}
                                        type="button"
                                        onClick={() => removeTag(id)}
                                        className="flex items-center gap-1 px-3 py-1 rounded border bg-green-500 text-white border-green-500"
                                    >
                                        {tag.tag_name}
                                        <span>×</span>
                                    </button>
                                ) : null;
                            })}
                        </div>
                        {errors.tags && <p className="text-red-500 text-sm">{errors.tags}</p>}
                    </div>
                </div>

                {/* Hình ảnh */}
                <div>
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="imageInput"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors w-fit"
                        >
                            <label className="text-red-500 text-xl">*</label>
                            <span className="text-sm font-medium">Tải lên hình ảnh</span>
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M12 4V16M8 8L12 4L16 8M20 12V18C20 19.1 19.1 20 18 20H6C4.9 20 4 19.1 4 18V12"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </label>
                        <input
                            id="imageInput"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                        {previewUrls.length > 0 && (
                            <div className="flex flex-wrap gap-4 mt-4">
                                {previewUrls.map((url, idx) => (
                                    <div key={idx} className="relative w-24 h-24 cursor-pointer group">
                                        <Image
                                            src={url}
                                            alt={`Preview ${idx}`}
                                            width={96}
                                            height={96}
                                            className={`object-cover rounded-lg border-2 ${mainImageIndex === idx ? 'border-blue-500' : 'border-gray-300'
                                                }`}
                                            onClick={() => setMainImageIndex(idx)}
                                        />
                                        {mainImageIndex === idx && (
                                            <div className="absolute top-28 inset-0 flex items-center justify-center opacity-70 font-semibold rounded-lg">
                                                <span className="text-red-500">* Ảnh chính</span>
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {errors.images && <p className="text-red-500 text-sm">{errors.images}</p>}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition h-14"
                        >
                            Cập nhật sản phẩm
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}