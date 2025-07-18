"use client";

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
import orderService from "@/services/orderService";
import toast from "react-hot-toast";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CompletedMonthlyRevenueChart = () => {
    const [chartData, setChartData] = useState({
        labels: ["Revenue", "Profit"],
        datasets: [
            {
                label: "Amount (VNĐ)",
                data: [0, 0],
                backgroundColor: ["#4ade80", "#60a5fa"],
                borderColor: ["#22c55e", "#3b82f6"],
                borderWidth: 1,
            },
        ],
    });
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalProfit, setTotalProfit] = useState(0);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const fetchProfit = async () => {
        try {
            const res = await orderService.getTotalProfit(startDate, endDate);
            const { total_revenue, total_profit, chart } = res;

            setChartData({
                labels: chart.data.labels
                    .filter((label) => label !== "COGS")
                    .map((label) =>
                        label === "Revenue"
                            ? "Doanh thu"
                            : label === "Profit"
                                ? "Lợi nhuận"
                                : label
                    ),
                datasets: [
                    {
                        label: "Số tiền (VNĐ)",
                        data: [total_revenue, total_profit],
                        backgroundColor: ["#4ade80", "#60a5fa"],
                        borderColor: ["#22c55e", "#3b82f6"],
                        borderWidth: 1,
                    },
                ],
            });
            setTotalRevenue(total_revenue);
            setTotalProfit(total_profit);
        } catch (error: any) {
            toast.error("Lỗi khi tải dữ liệu lợi nhuận: " + (error.message || "Lỗi không xác định"));
            console.error("Lỗi fetch lợi nhuận:", error);
        }
    };

    useEffect(() => {
        fetchProfit();
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
                text: `Tổng quan lợi nhuận (${startDate || "Bắt đầu"} đến ${endDate || "Hết"})`,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: "Số tiền (VNĐ)" },
            },
            x: {
                barPercentage: 0.5,
                categoryPercentage: 0.7,
            },
        },
    };

    return (
        <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                📊 Tổng quan lợi nhuận
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

            <div className="bg-gray-50 p-4 rounded-lg h-[400px]">
                <Bar data={chartData} options={options} />
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm">
                    <p className="text-lg font-semibold text-green-800">
                        💰 Tổng doanh thu:
                    </p>
                    <p className="text-xl font-bold text-green-600">
                        {totalRevenue.toLocaleString("vi-VN")} VNĐ
                    </p>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
                    <p className="text-lg font-semibold text-blue-800">
                        📈 Tổng lợi nhuận:
                    </p>
                    <p className="text-xl font-bold text-blue-600">
                        {totalProfit.toLocaleString("vi-VN")} VNĐ
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CompletedMonthlyRevenueChart;
