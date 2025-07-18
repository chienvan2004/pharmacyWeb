// components/UpdateSlideshowModal.tsx
'use client';

import { Slideshow } from '@/types/slideShowInteface';
import { Fullscreen } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface UpdateSlideshowModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (id: number, data: FormData) => void;
    slideshow: Slideshow | null;
    formErrors: { [key: string]: string };
}

const UpdateSlideshowModal: React.FC<UpdateSlideshowModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    slideshow,
    formErrors,
}) => {
    const [link, setLink] = useState<string | null>('');
    const [active, setActive] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Load dữ liệu slideshow khi mở modal
    useEffect(() => {
        if (slideshow) {
            setLink(slideshow.link || '');
            setActive(slideshow.active || false);
            setImagePreview(slideshow.image ? `http://localhost:8000/storage/${slideshow.image}` : null);
        }
    }, [slideshow]);

    // Xử lý submit form
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!slideshow) return;

        const formData = new FormData();
        formData.append('link', link || '');
        formData.append('active', active ? '1' : '0');

        // Thêm hình ảnh mới nếu có
        const imageInput = (e.target as HTMLFormElement).elements.namedItem('image') as HTMLInputElement;
        if (imageInput?.files?.[0]) {
            formData.append('image', imageInput.files[0]);
        }

        onSubmit(slideshow.id, formData);
    };

    // Xử lý khi chọn hình ảnh mới để preview
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    if (!slideshow) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'
                }`}
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
                    Cập nhật Slideshow
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hình ảnh
                        </label>
                        {imagePreview && (
                            <div className="mb-2">
                                <Image
                                    src={imagePreview}
                                    alt="Slideshow Preview"
                                    width={100}
                                    height={50}
                                    className="w-32 h-32 object-cover rounded-lg"
                                />
                            </div>
                        )}
                        <input
                            type="file"
                            name="image"
                            onChange={handleImageChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        {formErrors.image && (
                            <p className="text-red-500 text-sm">{formErrors.image}</p>
                        )}
                    </div>

                    {/* Link */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Liên kết
                        </label>
                        <input
                            type="text"
                            name="link"
                            value={link || ''}
                            onChange={(e) => setLink(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Nhập liên kết (không bắt buộc)"
                        />
                        {formErrors.link && (
                            <p className="text-red-500 text-sm">{formErrors.link}</p>
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

export default UpdateSlideshowModal;