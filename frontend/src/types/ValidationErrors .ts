export interface ValidationErrors {
    [field: string]: string[];
}

export interface ApiErrorResponse {
    message: string;
    errors?: ValidationErrors;
}
