import axios from '@/lib/axios';
import { ApiResponse } from '@/types/ApiResponse';
import { Slideshow } from '@/types/slideShowInteface';
import { ApiErrorResponse } from '@/types/ValidationErrors ';
import { AxiosError } from 'axios';

// Lấy tất cả danh sách slideshow
export const getAllSlideshows = async (page: number = 1, perPage: number = 10): Promise<ApiResponse<Slideshow[]>> => {
    const res = await axios.get('slideshow', {
        params: {
            page,
            per_page: perPage,
        },
    });
    return res.data;
};  

// Thêm một slideshow
export const createSlideshow = async (data: FormData): Promise<ApiResponse<Slideshow>> => {
    try {
        const res = await axios.post<ApiResponse<Slideshow>>('slideshow', data, {
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

// Cập nhật một slideshow
export const updateSlideshow = async (id: number, data: FormData): Promise<ApiResponse<Slideshow>> => {
    try {
        const res = await axios.post<ApiResponse<Slideshow>>(`slideshow/${id}?_method=PUT`, data, {
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

// Xóa một slideshow
export const deleteSlideshow = async (id: number): Promise<ApiResponse<null>> => {
    const res = await axios.delete(`slideshow/${id}`);
    return res.data;
};

// Xem chi tiết một slideshow
export const showSlideshow = async (id: number): Promise<ApiResponse<Slideshow>> => {
    const res = await axios.get(`slideshow/${id}`);
    return res.data;
};

// Tăng lượt click của slideshow
export const incrementClicks = async (id: number): Promise<ApiResponse<Slideshow>> => {
    try {
        const res = await axios.post(`slideshow/${id}/click`);
        return res.data;
    } catch (error) {
        const err = error as AxiosError<ApiErrorResponse>;
        throw {
            errors: err.response?.data?.errors || 'Lỗi không xác định',
        };
    }
};