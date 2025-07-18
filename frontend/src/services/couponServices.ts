import axios from '@/lib/axios';
import { ApiResponse } from '@/types/ApiResponse';
import { Coupon } from '@/types/couponInterface';
import { ApiErrorResponse } from '@/types/ValidationErrors ';
import { AxiosError } from 'axios';

// Lấy tất cả danh sách coupon
export const getAllCoupons = async (page: number = 1, perPage: number = 10): Promise<ApiResponse<Coupon[]>> => {
    const res = await axios.get('coupon', {
        params: {
            page,
            per_page: perPage,
        },
    });
    return res.data;
};

// Thêm một coupon
export const createCoupon = async (data: FormData): Promise<ApiResponse<Coupon>> => {
    try {
        const res = await axios.post<ApiResponse<Coupon>>('coupon', data, {
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

// Cập nhật một coupon
export const updateCoupon = async (id: number, data: FormData): Promise<ApiResponse<Coupon>> => {
    try {
        const res = await axios.post<ApiResponse<Coupon>>(`coupon/${id}?_method=PUT`, data, {
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

// Xóa một coupon
export const deleteCoupon = async (id: number): Promise<ApiResponse<null>> => {
    const res = await axios.delete(`coupon/${id}`);
    return res.data;
};

// Xem chi tiết một coupon
export const showCoupon = async (id: number): Promise<ApiResponse<Coupon>> => {
    const res = await axios.get(`coupon/${id}`);
    return res.data;
};

// Kiểm tra coupon hợp lệ
export const checkCoupon = async (code: string, orderAmount: number, productIds: number[]): Promise<ApiResponse<{ coupon: Coupon; applicable_products: number[] }>> => {
    try {
        const res = await axios.post('coupon/check', {
            code,
            order_amount: orderAmount,
            product_ids: productIds,
        });
        return res.data;
    } catch (error) {
        const err = error as AxiosError<ApiErrorResponse>;
        throw {
            errors: err.response?.data?.errors || 'Lỗi không xác định',
        };
    }
};

// Tăng số lần sử dụng coupon
export const incrementTimesUsed = async (id: number): Promise<ApiResponse<Coupon>> => {
    try {
        const res = await axios.post(`coupon/${id}/use`);
        return res.data;
    } catch (error) {
        const err = error as AxiosError<ApiErrorResponse>;
        throw {
            errors: err.response?.data?.errors || 'Lỗi không xác định',
        };
    }
};