import axios from '@/lib/axios';
import { ApiResponse } from '@/types/ApiResponse';
import { ProductSale } from '@/types/productSaleInterface';
import { ApiErrorResponse } from '@/types/ValidationErrors ';
import { AxiosError } from 'axios';

// Lấy tất cả danh sách kho
export const getAllProductSale = async (
    page: number = 1,
    perPage: number = 10,
    filters: {
        product_id?: number;
        name?: string;
    } = {}
): Promise<ApiResponse<ProductSale[]>> => {
    const res = await axios.get('product-sale', {
        params: {
            page,
            per_page: perPage,
            ...filters,
        },
    });
    return res.data;
};

// Thêm một sản phẩm vào kho
export const createProductSale = async (data: FormData): Promise<ApiResponse<ProductSale>> => {
    try {
        const res = await axios.post<ApiResponse<ProductSale>>('product-sale', data, {
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
export const updateProductSale = async (id: number, data: FormData): Promise<ApiResponse<ProductSale>> => {
    try {
        const res = await axios.post<ApiResponse<ProductSale>>(`product-sale/${id}?_method=PUT`, data, {
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
export const deleteProductSale = async (id: number): Promise<ApiResponse<null>> => {
    const res = await axios.delete(`product-sale/${id}`);
    return res.data;
};

// Xem chi tiết 
export const showProductSale = async (
    id: number
): Promise<ApiResponse<ProductSale>> => {
    const res = await axios.get(`product-sale/${id}`);
    return res.data;
};



// Import
export const importProductSale = async (file: File): Promise<ApiResponse<null>> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await axios.post<ApiResponse<null>>('product-sales/import', formData, {
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
export const exportProductSale = async (): Promise<void> => {
    const response = await axios.get('product-sales/export', {
        responseType: 'blob', 
    });

    const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'product_Sale.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
};

