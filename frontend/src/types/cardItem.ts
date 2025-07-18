import { Product } from "./productInterface";

export interface CardItem {
    id: number;
    card_id: number;
    product_id: number;
    quantity: number;
    created_at: string;
    updated_at: string;
    product: Product;
}
