export interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}
export interface ApiResponse<T> {
    status: string;
    data: T;
    meta?: PaginationMeta;
}
