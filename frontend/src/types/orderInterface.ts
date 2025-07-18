import { Product } from "./productInterface";
import { User } from "./userInterface";

export interface MonthlyRevenue {
    month: string; // YYYY-MM
    revenue: number;
}

export interface OrderItem {
    id: number;
    product_id: number;
    order_id: number;
    price: string;
    quantity: number;
    created_at: string;
    updated_at: string;
    product: Product;
}

export interface Order {
    id: number;
    coupon_id: number | null;
    user_id: number;
    status: string;
    payment_method: string;
    payment_status: string;
    order_approved_at: string | null;
    order_delivered_carrier_date: string | null;
    order_delivered_customer_date: string | null;
    updated_by: number | null;
    created_at: string;
    updated_at: string;
    total_amount: number;
    user: User;
    items: OrderItem[];
}