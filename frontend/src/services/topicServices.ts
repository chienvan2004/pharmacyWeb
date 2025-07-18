import axios from '@/lib/axios';
import { ApiResponse } from '@/types/ApiResponse';
import { Topic } from '@/types/topicInterface';
import { ApiErrorResponse } from '@/types/ValidationErrors ';
import { AxiosError } from 'axios';

// Lấy tất cả danh sách topic
export const getAlltopic = async (page: number = 1, perPage: number = 10): Promise<ApiResponse<Topic[]>> => {
    const res = await axios.get('topic', {
        params: {
            page,
            per_page: perPage
        }
    });
    return res.data;
};

// Thêm 1 tag
export const createTopic = async (data: FormData): Promise<ApiResponse<Topic>> => {
    try {
        const res = await axios.post<ApiResponse<Topic>>('topic', data, {
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

export const updateTopic = async (id: number, data: FormData): Promise<ApiResponse<Topic>> => {
    try {
        const res = await axios.post<ApiResponse<Topic>>(`topic/${id}?_method=PUT`, data, {
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

// Xóa 1 Topic
export const deleteTopic = async (id: number): Promise<ApiResponse<null>> => {
    const res = await axios.delete(`topic/${id}`);
    return res.data;
};

// Xem chi tiết 1 Topic
export const showTopic = async (id: number): Promise<ApiResponse<Topic>> => {
    const res = await axios.get(`topic/${id}`);
    return res.data;
};
