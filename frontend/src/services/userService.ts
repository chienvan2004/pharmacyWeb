import instance from "@/lib/axios";
import { AxiosError } from "axios";
import { User } from "@/types/userInterface";
import { ErrorResponse } from "@/types/auth";

interface UserListResponse {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface UserListParams {
    search?: string;
    role_id?: number;
    active?: 0 | 1;
    sort_by?: string;
    sort_direction?: "asc" | "desc";
    per_page?: number;
    page?: number;
}

export const getUsers = async (params: UserListParams = {}): Promise<UserListResponse> => {
    try {
        const response = await instance.get<UserListResponse>("/users", {
            params: {
                search: params.search,
                role_id: params.role_id,
                active: params.active,
                sort_by: params.sort_by,
                sort_direction: params.sort_direction,
                per_page: params.per_page,
                page: params.page,
            },
        });
        return response.data;
    } catch (error) {
        throw (error as AxiosError<ErrorResponse>).response?.data || { message: "Failed to fetch users" };
    }
};