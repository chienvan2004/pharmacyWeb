import instance from "@/lib/axios";
import { CardItem } from "@/types/cardItem";
import { MonthlyRevenue, Order } from "@/types/orderInterface";
import { ApiErrorResponse } from "@/types/ValidationErrors ";
import { AxiosError } from "axios";

interface PlaceOrderRequest {
    user_id: number;
    coupon_id?: number | null;
    items: CardItem[];
    payment_method?: "cash" | "vnpay";
}

interface VnpayReturnResponse {
    vnp_Amount: number;
    vnp_BankCode?: string;
    vnp_BankTranNo?: string;
    vnp_CardType?: string;
    vnp_OrderInfo: string;
    vnp_PayDate: string;
    vnp_ResponseCode: string;
    vnp_TmnCode: string;
    vnp_TransactionNo: string;
    vnp_TxnRef: string;
    vnp_SecureHash: string;
}

interface PlaceOrderSuccessResponse {
    message: string;
    order_id?: number;
    payment_url?: string;
    user_info?: {
        phone_number: string;
        address?: string;
    };
}

interface PlaceOrderErrorResponse {
    message: string;
    requires_input?: boolean;
    has_phone_number?: boolean;
    has_address?: boolean;
    user_id?: number;
}

interface VnpayCallbackResponse {
    message: string;
    status: "success" | "failed";
    order_id?: number;
}

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

interface UpdateOrderRequest {
    status: string;
}

type PlaceOrderResponse = PlaceOrderSuccessResponse | PlaceOrderErrorResponse;

// Thêm interface cho phản hồi của getTotalProfit
interface ProfitResponse {
    message: string;
    total_revenue: number;
    total_profit: number;
    chart: {
        type: string;
        data: {
            labels: string[];
            datasets: {
                label: string;
                data: number[];
                backgroundColor: string[];
                borderColor: string[];
                borderWidth: number;
            }[];
        };
        options: {
            responsive: boolean;
            plugins: {
                legend: { position: string };
                title: { display: boolean; text: string };
            };
            scales: {
                y: {
                    beginAtZero: boolean;
                    title: { display: boolean; text: string };
                };
            };
        };
    };
}

const orderService = {
    placeOrder: async (data: PlaceOrderRequest): Promise<PlaceOrderResponse> => {
        try {
            const response = await instance.post("/place-order", data, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const { data: responseData } = response;

            // Nếu có payment_url (VNPay), mở trong tab mới
            if (responseData.payment_url) {
                window.open(responseData.payment_url, "_blank");
            }

            return responseData;
        } catch (error: any) {
            console.error("Error placing order:", error.response?.data || error.message);
            if (error.response) {
                throw new Error(error.response.data.message || "Failed to place order");
            } else if (error.request) {
                throw new Error("No response from server");
            } else {
                throw new Error("Error setting up request");
            }
        }
    },

    handleVnpayReturn: async (params: VnpayReturnResponse): Promise<VnpayCallbackResponse> => {
        try {
            const response = await instance.post("/vnpay-return", params, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });
            return response.data;
        } catch (error: any) {
            console.error("Error handling VNPay return:", error.response?.data || error.message);
            throw new Error(error.response?.data.message || "Failed to process VNPay callback");
        }
    },

    deleteOrder: async (id: number): Promise<{ message: string }> => {
        try {
            const response = await instance.delete(`/orders/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            return response.data;
        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>;
            throw {
                errors: err.response?.data.errors || "Lỗi không xác định",
            };
        }
    },

    getAllOrders: async (
        page: number = 1,
        perPage: number = 10,
        filters: {
            status?: string;
            payment_status?: string;
            user_id?: number;
        } = {}
    ): Promise<ApiResponse<Order[]>> => {
        try {
            const response = await instance.get("/orders", {
                params: {
                    page,
                    per_page: perPage,
                    status: filters.status,
                    payment_status: filters.payment_status,
                    user_id: filters.user_id,
                },
            });
            return response.data;
        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>;
            throw {
                errors: err.response?.data.errors || "Lỗi không xác định",
            };
        }
    },

    getOrderById: async (id: number): Promise<ApiResponse<Order>> => {
        try {
            const response = await instance.get(`/orders/${id}`);
            return response.data;
        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>;
            throw {
                errors: err.response?.data.errors || "Lỗi không xác định",
            };
        }
    },

    updateOrder: async (id: number, data: UpdateOrderRequest): Promise<{ message: string; data: Order }> => {
        try {
            const response = await instance.put(`/orders/${id}`, data, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            return response.data;
        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>;
            throw {
                errors: err.response?.data.errors || "Lỗi không xác định",
            };
        }
    },

    getMonthlyRevenue: async (year?: number): Promise<ApiResponse<MonthlyRevenue[]>> => {
        try {
            const response = await instance.get("/revenue/monthly", {
                params: { year },
            });
            return response.data;
        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>;
            throw {
                error: err.response?.data?.message || "Lỗi không xác định khi lấy doanh thu theo tháng",
            };
        }
    },

    // Hàm mới: Lấy tổng lợi nhuận và biểu đồ
    getTotalProfit: async (startDate?: string, endDate?: string): Promise<ProfitResponse> => {
        try {
            const response = await instance.get("/profit", {
                params: {
                    start_date: startDate,
                    end_date: endDate,
                },
            });
            return response.data;
        } catch (error: any) {
            console.error("Error getting total profit:", error.response?.data || error.message);
            throw new Error(error.response?.data.message || "Failed to get total profit");
        }
    },

};

export default orderService;