// types/tagInterface.ts
export interface Tag {
    id: number;
    tag_name: string;
    active: boolean;
    product_ids?: number[]; 
    products?: { id: number; product_name: string }[]; 
}