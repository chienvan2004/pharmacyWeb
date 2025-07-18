import axios from '@/lib/axios';
import { ApiResponse } from '@/types/ApiResponse';
import { Post } from '@/types/postInterface';
import { ApiErrorResponse } from '@/types/ValidationErrors ';
import { AxiosError } from 'axios';

//lấy  tất cả danh sách bài viết

export const getAllPost = async (page: number = 1, perPage: number = 10): Promise<ApiResponse<Post[]>> => {
    const res = await axios.get('post', {
        params: {
            page,
            per_page: perPage
        }
    });
    return res.data;
};

//thêm 1 bài viết
export const createPost = async (data: FormData): Promise<ApiResponse<Post>> => {
    try {
        const res = await axios.post<ApiResponse<Post>>('post', data, {
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

//cập nhật 1 bài viết
export const updatePost = async (id: number,data: FormData): Promise<ApiResponse<Post>> => {
    try {
        const res = await axios.post<ApiResponse<Post>>(`post/${id}?_method=PUT`, data, {
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


//xóa 1 bài viết
export const deletePost = async (id: number): Promise<ApiResponse<null>> => {
    const res = await axios.delete(`post/${id}`);
    return res.data;
};

//xem chi tiết 1 bài viết
export const showPost = async (id: number): Promise<ApiResponse<Post>> => {
    const res = await axios.get(`post/${id}`);
    return res.data;
};


