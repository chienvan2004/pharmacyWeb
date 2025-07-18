import axios from '@/lib/axios';
import { ApiResponse } from '@/types/ApiResponse';
import { Tag } from '@/types/tagInterface';
import { ApiErrorResponse } from '@/types/ValidationErrors ';
import { AxiosError } from 'axios';

// Lấy tất cả danh sách tags
export const getAllTags = async (page: number = 1, perPage: number = 10): Promise<ApiResponse<Tag[]>> => {
    const res = await axios.get('tags', {
        params: {
            page,
            per_page: perPage
        }
    });
    return res.data;
};

// Thêm 1 tag
export const createTag = async (data: FormData): Promise<ApiResponse<Tag>> => {
    try {
        const res = await axios.post<ApiResponse<Tag>>('tags', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return res.data;
    } catch (error) {
        const err = error as AxiosError<ApiErrorResponse>;
        throw {
            errors: err.response?.data?.errors 
        };
    }
};

export const updateTag = async (id: number, data: FormData): Promise<ApiResponse<Tag>> => {
    try {
        const res = await axios.post<ApiResponse<Tag>>(`tags/${id}?_method=PUT`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return res.data;
    } catch (error) {
        const err = error as AxiosError<ApiErrorResponse>;
        throw {
            errors: err.response?.data?.errors
        };
    }
};

// Xóa 1 tag
export const deleteTag = async (id: number): Promise<ApiResponse<null>> => {
    const res = await axios.delete(`tags/${id}`);
    return res.data;
};

// Xem chi tiết 1 tag
export const showTag = async (id: number): Promise<ApiResponse<Tag>> => {
    const res = await axios.get(`tags/${id}`);
    return res.data;
};

// Import
export const importTag = async (file: File): Promise<ApiResponse<null>> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await axios.post<ApiResponse<null>>('tag/import', formData, {
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
export const exportTag = async (): Promise<void> => {
    const response = await axios.get('tag/export', {
        responseType: 'blob',
    });

    const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'tag.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
};