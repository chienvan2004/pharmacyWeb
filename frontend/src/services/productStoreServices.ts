import instance from '@/lib/axios';
import axios from '@/lib/axios';
import { ApiResponse } from '@/types/ApiResponse';
import { ProductStore } from '@/types/productStoreInterface';
import { ApiErrorResponse } from '@/types/ValidationErrors ';
import { AxiosError } from 'axios';

// Lấy tất cả danh sách kho
export const getAllProductStores = async (
    page: number = 1,
    perPage: number = 10,
    filters: {
        product_id?: number;
        name?: string;
    } = {}
): Promise<ApiResponse<ProductStore[]>> => {
    const res = await axios.get('store', {
        params: {
            page,
            per_page: perPage,
            ...filters,
        },
    });
    return res.data;
};

// Thêm một sản phẩm vào kho
export const createProductStore = async (data: FormData): Promise<ApiResponse<ProductStore>> => {
    try {
        const res = await axios.post<ApiResponse<ProductStore>>('store', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log(res.data);
        return res.data;
    } catch (error) {
        const err = error as AxiosError<ApiErrorResponse>;
        throw {
            errors: err.response?.data.errors || 'Lỗi không xác định',
        };
    }
};
// Cập nhật một sản phẩm trong kho
export const updateProductStore = async (id: number, data: FormData): Promise<ApiResponse<ProductStore>> => {
    try {
        const res = await axios.post<ApiResponse<ProductStore>>(`store/${id}?_method=PUT`, data, {
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
// Xóa một sản phẩm khỏi kho
export const deleteProductStore = async (id: number): Promise<ApiResponse<null>> => {
    const res = await axios.delete(`store/${id}`);
    return res.data;
};

// Import
export const importProductStore = async (file: File): Promise<ApiResponse<null>> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await axios.post<ApiResponse<null>>('store/import', formData, {
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
export const exportProductStore = async (): Promise<void> => {
    const response = await axios.get('store/export', {
        responseType: 'blob', 
    });

    const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'product_store.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
};

export const getLowStockProducts = async (): Promise<ApiResponse<any[]>> => {
    try {
        const response = await axios.get('/low-stock-products');
        return response.data;
    } catch (error) {
        const err = error as AxiosError<ApiErrorResponse>;
        throw {
            errors: err.response?.data.errors || 'Lỗi không xác định khi lấy sản phẩm tồn kho thấp',
        };
    }
}

export const getOrderItemStatistics = async (startDate?: string, endDate?: string): Promise<ApiResponse<any[]>> => {
    try {
        const response = await instance.get("/order-item-statistics", {
            params: {
                start_date: startDate,
                end_date: endDate,
            },
        });
        return response.data;

    } catch (error) {
        const err = error as AxiosError<ApiErrorResponse>;
        throw {
            errors: err.response?.data.errors 
        };
    }
};
