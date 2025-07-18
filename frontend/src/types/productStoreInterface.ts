export interface ProductStore{
    id:number;
    product_id:number;
    root_price: number;
    quantity: number;
    created_at: string;
    updated_at: string;
    product: {
        product_id:number;
        product_name: string;
    };
}