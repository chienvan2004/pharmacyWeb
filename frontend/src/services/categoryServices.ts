import axios from '@/lib/axios';
import { ApiResponse } from '@/types/ApiResponse';
import { Category } from '@/types/categoryInterface';
import { ApiErrorResponse } from '@/types/ValidationErrors ';
import { AxiosError } from 'axios';

// Lấy danh sách category có phân trang
export const getAllCategories = async (
    page: number = 1,
    perPage: number = 10
): Promise<ApiResponse<Category[]>> => {
    const res = await axios.get('categories', {
        params: {
            page,
            per_page: perPage
        }
    });
    return res.data;
};


export const getAll = async (
    page: number = 1,
    perPage: number = 50
): Promise<ApiResponse<Category[]>> => {
    const res = await axios.get('categories', {
        params: {
            page,
            per_page: perPage
        }
    });
    return res.data;
};
//lấy danh mục cha
export const getCategoryParent = async (
): Promise<ApiResponse<Category[]>> => {
    const res = await axios.get('category-parent');
    return res.data;
};

// Thêm category mới
export const createCategory = async (data: FormData): Promise<ApiResponse<Category>> => {
    try {
        const res = await axios.post<ApiResponse<Category>>('categories', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return res.data;
    } catch (error) {
        const err = error as AxiosError<ApiErrorResponse>;
        throw {
            errors: err.response?.data.errors || 'Lỗi không xác định',
        };
    }
};

// Cập nhật category
export const updateCategory = async (
    id: number,
    data: FormData
): Promise<ApiResponse<Category>> => {
    try {
        const res = await axios.post<ApiResponse<Category>>(
            `categories/${id}?_method=PUT`,
            data,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return res.data;
    } catch (error) {
        const err = error as AxiosError<ApiErrorResponse>;
        throw {
            errors: err.response?.data?.errors || 'Lỗi không xác định',
        };
    }
};

// Xóa category
export const deleteCategory = async (
    id: number
): Promise<ApiResponse<null>> => {
    const res = await axios.delete(`categories/${id}`);
    return res.data;
};

// Xem chi tiết category
export const showCategory = async (
    id: number
): Promise<ApiResponse<Category>> => {
    const res = await axios.get(`categories/${id}`);
    return res.data;
};



// Import
export const importCategory = async (file: File): Promise<ApiResponse<null>> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await axios.post<ApiResponse<null>>('category/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return res.data;
    } catch (error) {
        const err = error as AxiosError<ApiErrorResponse>;
        throw {
            errors: err.response?.data.errors || 'Lỗi không xác định',
        };
    }
};


// Export
export const exportCategory = async (): Promise<void> => {
    const response = await axios.get('category/export', {
        responseType: 'blob',
    });

    const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'category.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
};
