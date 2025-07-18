import { Product } from "./productInterface";

export interface Coupon {
    id: number;
    code: string;
    discount_value: number;
    discount_type: 'percent' | 'vnd' | 'shipping';
    times_used: number;
    max_usage: number | null;
    order_amount_limit: number | null;
    coupon_start_date: string | null;
    coupon_end_date: string | null;
    created_at: string;
    updated_at: string;
    products: Product[];
}