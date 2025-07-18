export interface ErrorResponse {
    message: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export interface AuthResponse {
    accessToken: string;
    role_id: string;
    user: {
        id: number;
        name: string;
        email: string;
        avatar?: string;
        account_type?: string;
        providers?: string[];
    };
}