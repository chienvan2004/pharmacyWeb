"use client";

import { getOrderItemStatistics } from "@/services/productStoreServices";
import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import toast from "react-hot-toast";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const OrderItemChart = () => {
    const [chartData, setChartData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await getOrderItemStatistics(startDate, endDate);
            const products = response.data || [];

            if (products.length === 0) {
                setChartData(null);
                return;
            }

            const labels = products.map((p: any) => `Mã SP: ${p.product_id}`);
            const data = products.map((p: any) => p.total_quantity);
            const productNames = products.map((p: any) => p.product_name);

            setChartData({
                labels,
                datasets: [
                    {
                        label: "Tổng số lượng bán",
                        data,
                        backgroundColor: [
                            "#f87171", "#60a5fa", "#fbbf24", "#34d399", "#a78bfa",
                            "#fb923c", "#94a3b8", "#f87171", "#60a5fa", "#fbbf24"
                        ],
                        borderColor: "#e5e7eb",
                        borderWidth: 1,
                        productNames,
                    },
                ],
            });

        } catch (error: any) {
            toast.error(error.errors || "Lỗi khi tải dữ liệu");
            console.error("Lỗi fetch order item statistics:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [startDate, endDate]);

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStartDate(e.target.value);
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEndDate(e.target.value);
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "top" as const },
            title: {
                display: true,
                text: `Thống kê sản phẩm bán chạy (${startDate} đến ${endDate})`,
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        const name = context.dataset.productNames?.[context.dataIndex];
                        const quantity = context.raw;
                        return [`Tên SP: ${name}`, `Số lượng đã bán: ${quantity}`];
                    },
                },
            },
        },
        scales: {
            x: {
                ticks: {
                    align: "center",
                    maxRotation: 0,
                    minRotation: 0,
                    autoSkip: false,
                },
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: "Số lượng",
                },
            },
        },
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                📦 Thống kê sản phẩm bán chạy
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày bắt đầu
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={handleStartDateChange}
                        className="w-full border border-gray-300 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày kết thúc
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={handleEndDateChange}
                        className="w-full border border-gray-300 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10 text-gray-500">Đang tải...</div>
            ) : chartData ? (
                <div className="bg-gray-50 p-4 rounded-lg h-[500px]">
                    <Bar data={chartData} options={options} />
                </div>
            ) : (
                <p className="text-center text-red-500 font-medium">
                    Không có dữ liệu trong khoảng thời gian này.
                </p>
            )}
        </div>
    );
};

export default OrderItemChart;
