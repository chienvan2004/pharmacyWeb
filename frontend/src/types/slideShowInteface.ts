export interface Slideshow {
    id: number;
    image: string;
    link: string | null;
    active: boolean;
    clicks: number;
    created_by: number | null;
    updated_by: number | null;
    created_at: string;
    updated_at: string;
}