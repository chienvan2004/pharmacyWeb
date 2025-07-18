// src/services/authService.ts

import instance from "@/lib/axios";
import { AuthResponse, ErrorResponse, LoginRequest, RegisterRequest } from "@/types/auth";
import { User, UserAddress } from "@/types/userInterface";
import { AxiosError } from "axios";

export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
        const response = await instance.post<AuthResponse>('auth/register', data);
        return response.data;
    } catch (error) {
        throw (error as AxiosError<ErrorResponse>).response?.data || { message: 'Registration failed' };
    }
};

export const loginAdmin = async (data: LoginRequest): Promise<AuthResponse> => {
    try {
        const response = await instance.post<AuthResponse>('auth/login-admin', data);
        return response.data;
    } catch (error) {
        throw (error as AxiosError<ErrorResponse>).response?.data || { message: 'Login failed' };
    }
};

export const loginClient = async (data: LoginRequest): Promise<AuthResponse> => {
    try {
        const response = await instance.post<AuthResponse>('auth/login-client', data);
        return response.data;
    } catch (error) {
        throw (error as AxiosError<ErrorResponse>).response?.data || { message: 'Login failed' };
    }
};

export const getProfile = async (): Promise<User> => {
    try {
        const response = await instance.get<User>('auth/profile');
        return response.data;
    } catch (error) {
        throw (error as AxiosError<ErrorResponse>).response?.data || { message: 'Failed to fetch profile' };
    }
};

export const logout = async (): Promise<{ message: string }> => {
    try {
        const response = await instance.post<{ message: string }>('auth/logout');
        return response.data;
    } catch (error) {
        throw (error as AxiosError<ErrorResponse>).response?.data || { message: 'Logout failed' };
    }
};

export const updateProfile = async (data: Partial<User>): Promise<User> => {
    try {
        const response = await instance.post<User>("/auth/update", data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        throw (error as AxiosError<ErrorResponse>).response?.data || { message: 'update failed' };
    }
};

export const changePassword = async (data: { old_password: string; new_password: string }): Promise<void> => {
    try {
        await instance.post("/auth/change-password", data);
    } catch (error) {
        throw (error as AxiosError<ErrorResponse>).response?.data || { message: 'update failed' };
    }
};




export const addUserAddress = async (data: {
    user_id: number;
    address: string;
    dial_code?: string;
    postal_code?: string;
    address_default?: boolean;
    city?: string;
}): Promise<{ message: string; address: UserAddress }> => {
    try {
        const response = await instance.post('/user-addresses', data);
        return response.data;
    } catch (error) {
        throw (error as AxiosError<{ message: string }>).response?.data || { message: 'Failed to add address' };
    }
};

export const updateAddress = async (id: number, data: {
    user_id: number;
    address: string;
    dial_code?: string;
    postal_code?: string;
    address_default?: boolean;
    city?: string;
}): Promise<{ message: string; address: UserAddress }> => {
    try {
        const response = await instance.put(`/user-addresses/${id}`, data);
        return response.data;
    } catch (error) {
        throw (error as AxiosError<{ message: string }>).response?.data || { message: 'Failed to update address' };
    }
};

export const deleteAddress = async (id: number): Promise<{ message: string }> => {
    try {
        const response = await instance.delete(`/user-addresses/${id}`);
        return response.data;
    } catch (error) {
        throw (error as AxiosError<{ message: string }>).response?.data || { message: 'Failed to delete address' };
    }
};