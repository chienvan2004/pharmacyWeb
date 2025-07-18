// components/StoreSlideshowModal.tsx
import React, { useState } from 'react';

interface FormErrors {
    [key: string]: string;
}

interface StoreSlideshowModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    formErrors: FormErrors;
}

const StoreSlideshowModal: React.FC<StoreSlideshowModalProps> = ({
    isOpen,
    onClose,
    onSubmit,   
    formErrors,
}) => {
    const [link, setLink] = useState(''); // State để lưu liên kết

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'
                }`}
        >
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 transform transition-all duration-300 scale-100"
            >
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                    Thêm Slideshow
                </h2>

                <form onSubmit={onSubmit} className="space-y-5">
                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hình ảnh
                        </label>
                        <input
                            type="file"
                            name="image"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
                        />
                        {formErrors.image && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.image}</p>
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
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
                            placeholder="Nhập liên kết (không bắt buộc)"
                        />
                        {formErrors.link && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.link}</p>
                        )}
                    </div>

                    {/* Status */}
                    <div>
                        <label
                            htmlFor="active"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Trạng thái
                        </label>
                        <select
                            name="active"
                            id="active"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
                        >
                            <option value="1">Kích hoạt</option>
                            <option value="0">Không kích hoạt</option>
                        </select>
                        {formErrors.active && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.active}</p>
                        )}
                    </div>

                    {/* Action Buttons */}
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
                            Lưu
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StoreSlideshowModal;