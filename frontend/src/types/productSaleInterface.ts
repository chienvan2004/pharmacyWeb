export interface ProductSale{
    id:number;
    product_id:number;
    sale_price: number;
    sale_start_date: string;
    sale_end_date: string;
    product: {
        product_id:number;
        product_name: string;
        buying_price: string;
    };
}