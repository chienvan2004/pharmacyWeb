import axios from '@/lib/axios';
import { ApiResponse } from '@/types/ApiResponse';
import { Product } from '@/types/productInterface';
import { ApiErrorResponse } from '@/types/ValidationErrors ';
import { AxiosError } from 'axios';

// Lấy tất cả sản phẩm
export const getAllProducts = async (page: number = 1, perPage: number = 10, filters: {
    id?: number;
    name?: string;
    min_price?: number;
    max_price?: number;
    category?: string;
    brand?: string
} = {}): Promise<ApiResponse<Product[]>> => {
    const res = await axios.get('products', {
        params: {
            page,
            per_page: perPage,
            ...filters,
        }
    });
    return res.data;
};

// Thêm sản phẩm mới
export const createProduct = async (data: FormData): Promise<ApiResponse<Product>> => {
    try {
        const res = await axios.post<ApiResponse<Product>>('products', data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
        });
        return res.data;
    } catch (error) {
        const err = error as AxiosError<ApiErrorResponse>;
        throw {
            errors: err.response?.data.errors || 'Lỗi không xác định',
        };
    }
};

// Cập nhật sản phẩm
export const updateProduct = async (id: number, data: FormData): Promise<ApiResponse<Product>> => {
    try {
        const res = await axios.post<ApiResponse<Product>>(`products/${id}?_method=PUT`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return res.data;
    } catch (error) {
        const err = error as AxiosError<ApiErrorResponse>;
        throw {
            errors: err.response?.data.errors || 'Lỗi không xác định',
        };
    }
};
//chi tiết
export const showProduct = async (id: number): Promise<ApiResponse<Product>> => {
    try {
        const res = await axios.get<ApiResponse<Product>>(`products/${id}`);
        console.log('chi tiet san pham', res)
        return res.data;
    } catch (error) {
        const err = error as AxiosError<ApiErrorResponse>;
        throw {
            errors: err.response?.data.errors || 'Lỗi không xác định',
        };
    }
};
//xóa
export const deleteProduct = async (id: number): Promise<ApiResponse<null>> => {
    try {
        const res = await axios.delete<ApiResponse<null>>(`products/${id}`);
        return res.data;
    } catch (error) {
        const err = error as AxiosError<ApiErrorResponse>;
        throw {
            errors: err.response?.data.errors || 'Lỗi không xác định',
        };
    }
};



// Import
export const importProduct = async (file: File): Promise<ApiResponse<null>> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await axios.post<ApiResponse<null>>('product/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return res.data;
    } catch (error) {
        const err = error as AxiosError<ApiErrorResponse>;
        throw {
            errors: err.response?.data.errors || 'Lỗi không xác định',
        };
    }
};


// Export
export const exportProduct = async (): Promise<void> => {
    const response = await axios.get('product/export', {
        responseType: 'blob',
    });

    const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'product.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
};




//sản phẩm bán chạy
export const getProductBestsaler = async (): Promise<ApiResponse<Product[]>> => {
    try {
        const res = await axios.get('/product/best-seller');
        console.log(res)
        return res.data;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw new Error('Failed to fetch new products');
    }
};


//sản phẩm đang giảm giá
export const getProductSale = async (): Promise<ApiResponse<Product[]>> => {
    try {
        const res = await axios.get('/product/sale');
        console.log(res)
        return res.data;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw new Error('Failed to fetch new products');
    }
};

// Lấy sản phẩm theo slug danh mục
export const getProductWithCategory = async (
    categoryId: number,
    page: number,
    perPage: number,
    filters: {
        sort_by?: string;
        order?: "asc" | "desc";
        min_price?: number;
        max_price?: number;
        brand?: string; // Chuỗi ID thương hiệu, ví dụ: "1,2,3"
    } = {}
): Promise<any> => {
    const res = await axios.get(`/products/category/${categoryId}`, {
        params: {
            page,
            per_page: perPage,
            ...filters,
        },
    });
    return res.data;
};

// Lấy sản phẩm theo slug thương hiệu
export const getProductWithBrand = async (
    id: number,
    page: number = 1,
    perPage: number = 10,
    filters: {
        sort_by?: string;
        order?: "asc" | "desc";
    } = {}
): Promise<ApiResponse<Product[]>> => {
    try {
        const res = await axios.get(`products/brand/${id}`, {
            params: {
                page,
                per_page: perPage,
                sort_by: filters.sort_by || "buying_price",
                order: filters.order || "asc",
            },
        });
        return res.data;
    } catch (error) {
        throw new Error("Không thể lấy sản phẩm theo thương hiệu");
    }
};


// Lấy sản phẩm theo slug thương hiệu
export const getProductWithTag = async (
    id = 4
): Promise<ApiResponse<Product[]>> => {
    try {
        const res = await axios.get(`product/tag/${id}`);
        console.log(res.data)
        return res.data;
    } catch (error) {
        throw new Error("Không thể lấy sản phẩm theo thẻ");
    }
};
// Lấy sản phẩm liên quan
export const getProductWithCategoryAndBrand = async (
    brandId: number,
    categoryId: number,
    page: number = 1,
    perPage: number = 10,
    excludeProductId?: number 
): Promise<ApiResponse<Product[]>> => {
    try {
        const res = await axios.get(`products/category/${categoryId}/brand/${brandId}/exclude/${excludeProductId || ''}`, {
            params: {
                page,
                per_page: perPage,
            },
        });
        return res.data;
    } catch (error) {
        throw new Error("Không thể lấy sản phẩm theo thương hiệu");
    }
};

export const searchProduct = async (
    searchTerm: string,
    page: number = 1,
    perPage: number = 10
): Promise<ApiResponse<Product[]>> => {
    try {
        const res = await axios.get('product/search', {
            params: {
                search: searchTerm,
                page,
                per_page: perPage,
            },
        });
        return res.data;
    } catch (error) {
        const err = error as AxiosError<ApiErrorResponse>;
        throw {
            errors: err.response?.data.errors || 'Lỗi không xác định',
        };
    }
};