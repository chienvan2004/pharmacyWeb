export interface Category {
    id: number;
    category_name: string;
    slug: string;
    description: string | null;
    icon: string;
    active: boolean;
    parent_id: number | null;
    parent_category: {
        id: number;
        category_name: string;
        slug: string;
        icon: string;
    } | null;
    children_categories:Category[];
    created_at: string;
    updated_at: string;
}