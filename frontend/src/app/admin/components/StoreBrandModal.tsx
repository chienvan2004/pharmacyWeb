import React from 'react';

interface FormErrors {
    [key: string]: string;
}

interface StoreBrandModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    formErrors: FormErrors;
}

const StoreBrandModal: React.FC<StoreBrandModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    formErrors,
}) => {
    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'} transition-opacity duration-300`}>
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8 transform transition-all duration-300 scale-100"
            >
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
                    Thêm Thương Hiệu
                </h2>

                <form onSubmit={onSubmit} className="space-y-6">
                    {/* Brand Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên thương hiệu <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="brand_name"
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700"
                            required
                        />
                        {formErrors.brand_name && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.brand_name}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mô tả
                        </label>
                        <textarea
                            name="description"
                            rows={4}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700 resize-none"
                        />
                    </div>

                    {/* Icon Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Icon (tùy chọn)
                        </label>
                        <input
                            type="file"
                            name="icon"
                            accept="image/*"
                            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>

                    {/* Active Status */}
                    <div>
                        <label htmlFor="active" className="block text-sm font-medium text-gray-700 mb-2">
                            Trạng thái
                        </label>
                        <select
                            name="active"
                            id="active"
                            className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                        >
                            <option value="1">Kích hoạt</option>
                            <option value="0">Không kích hoạt</option>
                        </select>
                        {formErrors.active && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.active}</p>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-4 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-semibold"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold"
                        >
                            Lưu
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StoreBrandModal;
