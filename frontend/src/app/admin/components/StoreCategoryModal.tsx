import React from 'react';

interface FormErrors {
    [key: string]: string;
}

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    formErrors: FormErrors;
    categories?: Array<{ id: number; category_name: string }>;
}

const StoreCategoryModal: React.FC<CategoryModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    formErrors,
    categories = [],
}) => {
    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'
                }`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8 transform transition-all duration-300 scale-100"
            >
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                    Thêm Danh Mục
                </h2>

                <form onSubmit={onSubmit} className="space-y-5">
                    {/* Category Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên danh mục
                        </label>
                        <input
                            type="text"
                            name="category_name"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        {formErrors.category_name && (
                            <p className="text-red-500 text-sm mt-1">
                                {formErrors.category_name}
                            </p>
                        )}
                    </div>

                    {/* Parent Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Danh mục cha
                        </label>
                        <select
                            name="parent_id"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            <option value="">Không có danh mục cha</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.category_name}
                                </option>
                            ))}
                        </select>
                        {formErrors.parent_id && (
                            <p className="text-red-500 text-sm mt-1">
                                {formErrors.parent_id}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mô tả
                        </label>
                        <textarea
                            name="description"
                            rows={3}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* Icon upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Icon (tuỳ chọn)
                        </label>
                        <input
                            type="file"
                            name="icon"
                            accept="image/*"
                            className="w-full text-sm"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label htmlFor="active" className="block text-sm font-medium text-gray-700 mb-1">
                            Trạng thái
                        </label>
                        <select
                            name="active"
                            id="active"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            <option value="1">Kích hoạt</option>
                            <option value="0">Không kích hoạt</option>
                        </select>
                        {formErrors.active && (
                            <p className="text-red-500 text-sm mt-1">
                                {formErrors.active}
                            </p>
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
                            Lưu
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StoreCategoryModal;
