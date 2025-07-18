import axios from '@/lib/axios';
import { ApiResponse } from '@/types/ApiResponse';
import { Unit } from '@/types/unitInterface';
import { ApiErrorResponse } from '@/types/ValidationErrors ';
import { AxiosError } from 'axios';


// Lấy toàn bộ danh sách unit không phân trang
export const getAllUnits = async (): Promise<ApiResponse<Unit[]>> => {
    const res = await axios.get('unit');
    return res.data;
};

// Tạo unit mới
export const createUnit = async (data: FormData): Promise<ApiResponse<Unit>> => {
    try {
        const res = await axios.post<ApiResponse<Unit>>('unit', data);
        return res.data;
    } catch (error) {
        const err = error as AxiosError<ApiErrorResponse>;
        throw {
            errors: err.response?.data.errors || 'Lỗi không xác định',
        };
    }
};

// Cập nhật unit
export const updateUnit = async (
    id: number,
    data: FormData
): Promise<ApiResponse<Unit>> => {
    try {
        const res = await axios.put<ApiResponse<Unit>>(`unit/${id}`, data);
        return res.data;
    } catch (error) {
        const err = error as AxiosError<ApiErrorResponse>;
        throw {
            errors: err.response?.data?.errors || 'Lỗi không xác định',
        };
    }
};

// Xóa unit
export const deleteUnit = async (
    id: number
): Promise<ApiResponse<null>> => {
    const res = await axios.delete(`unit/${id}`);
    return res.data;
};

// Xem chi tiết unit
export const showUnit = async (
    id: number
): Promise<ApiResponse<Unit>> => {
    const res = await axios.get(`unit/${id}`);
    return res.data;
};

// Import
export const importUnit = async (file: File): Promise<ApiResponse<null>> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await axios.post<ApiResponse<null>>('units/import', formData, {
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
export const exportUnit = async (): Promise<void> => {
    const response = await axios.get('units/export', {
        responseType: 'blob',
    });

    const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'unit.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
};