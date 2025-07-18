import React from 'react';

interface PaginationProps {
    currentPage: number;
    perPage: number;
    totalItems: number;
    lastPage: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, perPage, totalItems, lastPage, onPageChange }) => {
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= lastPage) {
            onPageChange(newPage);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 p-4 bg-white rounded-lg shadow-lg">
            <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                Hiển thị từ {(currentPage - 1) * perPage + 1} đến {Math.min(currentPage * perPage, totalItems)} của {totalItems} kết quả
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors duration-150"
                >
                    Trước
                </button>
                {Array.from({ length: lastPage }, (_, i) => i + 1).map((page) => (
                    <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg text-sm ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-100 border border-gray-300 hover:bg-gray-200'}`}
                    >
                        {page}
                    </button>
                ))}
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === lastPage}
                    className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors duration-150"
                >
                    Sau
                </button>
            </div>
        </div>
    );
};

export default Pagination;