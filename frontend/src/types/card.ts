import { CardItem } from "./cardItem";

export interface Card {
    card_id: number;
    user_id: number;
    items: CardItem[];
    total_items_count: number;
    created_at: string;
    updated_at: string;
}
