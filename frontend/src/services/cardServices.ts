import instance from "@/lib/axios";
import { Card } from "@/types/card";
import { CardItem } from "@/types/cardItem";

export const addItemToCart = async (data: {
    product_id: number;
    quantity: number;
}): Promise<{
    message: string;
    cardItem: CardItem;
    card: Card;
}> => {
    try {
        const response = await instance.post("/cart/add", data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getCart = async (): Promise<Card> => {
    try {
        const response = await instance.get("/cart");
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateItemQuantity = async (
    itemId: number,
    quantity: number
): Promise<{
    message: string;
    cardItem: CardItem;
    card: Card;
}> => {
    try {
        const response = await instance.patch(`/cart/update/${itemId}`, { quantity });
        return response.data;
    } catch (error) {
        throw error;
    }
};
export const removeItem = async (itemId: number): Promise<{
    message: string;
    card: Card;
}> => {
    try {
        const response = await instance.delete(`/cart/remove/${itemId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};