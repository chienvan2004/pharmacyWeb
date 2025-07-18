export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    avatar: string;
    role_id?: number | null;
    phone_number?: string | null;
    account_type: string;
    providers: string[];
    active: boolean;
    created_at?: string | null;
    updated_at?: string | null;
    addresses?: UserAddress[]; 
}

export interface UserAddress {
    id: number;
    user_id: number;
    address: string;
    dial_code: string;
    country: string;
    postal_code: string;
    city: string;
    address_default: number;
    created_at?: string | null;
    updated_at?: string | null;
}