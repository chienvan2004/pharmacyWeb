
export interface Product {
    id: number;
    slug: string;
    product_name: string;
    buying_price: string;
    short_description: string | null;
    product_description: string | null;
    active: boolean;
    disable_out_of_stock: boolean;
    created_by: string | null;
    updated_by: string | null;
    created_at: string;
    updated_at: string;
    images: { id: number; product_id: number; image: string; is_main: number }[];
    unit: { id: number; unit_name: string };
    categories: { id: number; category_name: string }[];
    brands: { id: number; brand_name: string }[];
    tags: { id: number; tag_name: string }[];
    product_store: { root_price: number; quantity:number } | null;
    product_sale: { sale_price: number; sale_start_date: string; sale_end_date: string } | null;
    total_quantity:number ;
    
}
