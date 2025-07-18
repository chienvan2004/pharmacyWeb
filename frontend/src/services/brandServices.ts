import axios from '@/lib/axios';
import { ApiResponse } from '@/types/ApiResponse';
import { Brand } from '@/types/brandInterface';
import { ApiErrorResponse } from '@/types/ValidationErrors ';
import { AxiosError } from 'axios';

//lấy  tất cả danh sách thương hiệu

export const getAllBrands = async (page: number = 1, perPage: number = 10): Promise<ApiResponse<Brand[]>> => {
    const res = await axios.get('brands', {
        params: {
            page,
            per_page: perPage
        }
    });
    return res.data;
};

//thêm 1 thương hiệu
export const createBrand = async (data: FormData): Promise<ApiResponse<Brand>> => {
    try {
        const res = await axios.post<ApiResponse<Brand>>('brands', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log(res.data)   
        return res.data;
    } catch (error) {
        const err = error as AxiosError<ApiErrorResponse>;
        throw {
            errors: err.response?.data.errors || 'Lỗi không xác định',
        };
    }
};

//cập nhật 1 thương hiệu
export const updateBrand = async (id: number,data: FormData): Promise<ApiResponse<Brand>> => {
    try {
        const res = await axios.post<ApiResponse<Brand>>(`brands/${id}?_method=PUT`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return res.data;
    } catch (error) {
        const err = error as AxiosError<ApiErrorResponse>;
        throw {
            errors: err.response?.data?.errors || 'Lỗi không xác định',
        };
    }
};


//xóa 1 thương hiệu
export const deleteBrand = async (id: number): Promise<ApiResponse<null>> => {
    const res = await axios.delete(`brands/${id}`);
    return res.data;
};

//xem chi tiết 1 thương hiệu
export const showBrand = async (id: number): Promise<ApiResponse<Brand>> => {
    const res = await axios.get(`brands/${id}`);
    return res.data;
};



// Import
export const importBrand= async (file: File): Promise<ApiResponse<null>> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await axios.post<ApiResponse<null>>('brand/import', formData, {
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
export const exportBrand= async (): Promise<void> => {
    const response = await axios.get('brand/export', {
        responseType: 'blob',
    });

    const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'brand.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
};
