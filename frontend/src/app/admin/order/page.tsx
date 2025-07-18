"use client";
import orderService from "@/services/orderService";
import { Order } from "@/types/orderInterface";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaInfoCircle, FaSearch, FaTrash } from "react-icons/fa";
import Select from "react-select";
import { ClipLoader } from "react-spinners";
import Pagination from "../../component/button/Pagination";

export default function OrdersPage() {
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [lastPage, setLastPage] = useState(1);

    const [filters, setFilters] = useState({
        user_id: "",
        status: [] as string[],
        payment_status: [] as string[],
    });

    const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
    const [editStatus, setEditStatus] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [modalLoading, setModalLoading] = useState(false);

    const statusOptions = [
        { value: "pending", label: "Chờ xử lý" },
        { value: "confirmed", label: "Đã xác nhận" },
        { value: "shipping", label: "Đang giao hàng" },
        { value: "completed", label: "Hoàn thành" },
        { value: "cancelled", label: "Đã hủy" },
        { value: "refunded", label: "Đã hoàn tiền" },
        { value: "failed", label: "Thất bại" },
    ];

    const paymentStatusOptions = [
        { value: "paid", label: "Đã thanh toán" },
        { value: "unpaid", label: "Chưa thanh toán" },
        { value: "failed", label: "Thất bại" },
    ];

    const fetchOrders = async () => {
        setTableLoading(true);
        try {
            const res = await orderService.getAllOrders(currentPage, perPage, {
                user_id: filters.user_id ? parseInt(filters.user_id, 10) : undefined,
                status: filters.status.length > 0 ? filters.status : undefined,
                payment_status: filters.payment_status.length > 0 ? filters.payment_status : undefined,
            });
            setOrders(res.data || []);
            setTotalItems(res.meta?.total ?? 0);
            setLastPage(res.meta?.last_page ?? 1);
        } catch (error: any) {
            toast.error("Lỗi khi tải danh sách đơn hàng");
            console.error("Lỗi fetch đơn hàng:", error);
        } finally {
            setTableLoading(false);
        }
    };

    const fetchOrderDetails = async (id: number) => {
        setModalLoading(true);
        try {
            const res = await orderService.getOrderById(id);
            setSelectedOrder(res.data);
            setIsModalOpen(true);
        } catch (error: any) {
            toast.error("Lỗi khi tải chi tiết đơn hàng: " + (error.error || "Lỗi không xác định"));
            console.error("Lỗi fetch chi tiết:", error);
        } finally {
            setModalLoading(false);
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                await fetchOrders();
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu ban đầu:", error);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [currentPage, filters]);

    const handleSearch = () => {
        setCurrentPage(1);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleMultiSelectChange = (selectedOptions: any, field: string) => {
        const values = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
        setFilters((prev) => ({
            ...prev,
            [field]: values,
        }));
    };

    const handleResetFilters = () => {
        setFilters({
            user_id: "",
            status: [],
            payment_status: [],
        });
        setCurrentPage(1);
    };

    const handleDelete = async (id: number) => {
        toast(
            (t) => (
                <span className="flex flex-col space-y-2">
                    <span>Bạn có chắc muốn xóa đơn hàng này?</span>
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                orderService
                                    .deleteOrder(id)
                                    .then(() => {
                                        toast.success("Xóa đơn hàng thành công!");
                                        fetchOrders();
                                    })
                                    .catch((error: any) => {
                                        toast.error("Lỗi khi xóa đơn hàng: " + (error.error || "Lỗi không xác định"));
                                        console.error("Lỗi khi xóa:", error);
                                    });
                            }}
                            className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 text-sm"
                        >
                            Xóa
                        </button>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="bg-gray-300 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-400 text-sm"
                        >
                            Hủy
                        </button>
                    </div>
                </span>
            ),
            { duration: 5000 }
        );
    };

    const startEditing = (order: Order) => {
        setEditingOrderId(order.id);
        setEditStatus(order.status);
    };

    const handleUpdateStatus = async (orderId: number) => {
        try {
            await orderService.updateOrder(orderId, { status: editStatus });
            toast.success("Cập nhật trạng thái đơn hàng thành công!");
            setEditingOrderId(null);
            fetchOrders();
        } catch (error: any) {
            toast.error("Lỗi khi cập nhật trạng thái: " + (error.error || "Lỗi không xác định"));
            console.error("Lỗi khi cập nhật:", error);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const renderTableBody = useMemo(() => {
        return (
            <tbody>
                {orders.map((order, index) => (
                    <tr
                        key={order.id}
                        className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition-colors duration-150`}
                    >
                        <td className="px-6 py-4">
                            <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{order.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{order.user.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                            {order.total_amount.toLocaleString("vi-VN")} VNĐ
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                            {editingOrderId === order.id ? (
                                <select
                                    value={editStatus}
                                    onChange={(e) => setEditStatus(e.target.value)}
                                    onBlur={() => handleUpdateStatus(order.id)}
                                    className="border border-gray-300 rounded-lg py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                >
                                    {statusOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <span
                                    className="cursor-pointer hover:text-blue-600"
                                    onClick={() => startEditing(order)}
                                >
                                    {statusOptions.find((opt) => opt.value === order.status)?.label || order.status}
                                </span>
                            )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                            {paymentStatusOptions.find((opt) => opt.value === order.payment_status)?.label || order.payment_status}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                            {new Date(order.created_at).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="px-6 py-4 sticky right-0 bg-white">
                            <div className="flex items-center space-x-3">
                                <button onClick={() => fetchOrderDetails(order.id)}>
                                    <FaInfoCircle className="text-blue-600 hover:text-blue-700" />
                                </button>
                                <button onClick={() => handleDelete(order.id)}>
                                    <FaTrash className="text-red-600 hover:text-red-700" />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        );
    }, [orders, editingOrderId, editStatus]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <ClipLoader color="#2563eb" size={60} />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 min-h-screen">
            <div className="bg-gray-200 p-4 sm:p-6 rounded-lg shadow-lg mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý đơn hàng</h1>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-80">
                            <input
                                type="number"
                                name="user_id"
                                value={filters.user_id}
                                onChange={handleFilterChange}
                                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                                placeholder="Tìm kiếm theo ID người dùng..."
                                className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="z-50">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái đơn hàng</label>
                        <Select
                            isMulti
                            options={statusOptions}
                            onChange={(selected) => handleMultiSelectChange(selected, "status")}
                            value={statusOptions.filter((option) => filters.status.includes(option.value))}
                            className="text-sm"
                            classNamePrefix="select"
                            placeholder="Chọn trạng thái..."
                        />
                    </div>
                    <div className="z-50">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái thanh toán</label>
                        <Select
                            isMulti
                            options={paymentStatusOptions}
                            onChange={(selected) => handleMultiSelectChange(selected, "payment_status")}
                            value={paymentStatusOptions.filter((option) => filters.payment_status.includes(option.value))}
                            className="text-sm"
                            classNamePrefix="select"
                            placeholder="Chọn trạng thái thanh toán..."
                        />
                    </div>
                    <div>
                        <button
                            onClick={handleResetFilters}
                            className="bg-gray-200 text-gray-800 px-4 py-3 mt-5 rounded-lg hover:bg-gray-300 transition-colors duration-150 text-sm"
                        >
                            Đặt lại bộ lọc
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-x-auto relative">
                {tableLoading ? (
                    <div className="flex justify-center items-center py-10">
                        <ClipLoader color="#2563eb" size={40} />
                    </div>
                ) : (
                    <table className="min-w-full table-auto">
                        <thead className="bg-gray-200 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                    <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Mã đơn hàng</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Khách hàng</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tổng tiền</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Trạng thái đơn hàng</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Trạng thái thanh toán</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Ngày tạo</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 sticky right-0 bg-gray-200">Hành động</th>
                            </tr>
                        </thead>
                        {renderTableBody}
                    </table>
                )}
            </div>

            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-5xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Chi tiết đơn hàng #{selectedOrder.id}</h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        {modalLoading ? (
                            <div className="flex justify-center items-center py-10">
                                <ClipLoader color="#2563eb" size={40} />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <span className="font-semibold text-gray-700">Khách hàng:</span> {selectedOrder.user.name} ({selectedOrder.user.email})
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Tổng tiền:</span> {selectedOrder.total_amount.toLocaleString("vi-VN")} VNĐ
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Phương thức thanh toán:</span> {selectedOrder.payment_method}
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Trạng thái:</span>{" "}
                                    {statusOptions.find((opt) => opt.value === selectedOrder.status)?.label || selectedOrder.status}
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Trạng thái thanh toán:</span>{" "}
                                    {paymentStatusOptions.find((opt) => opt.value === selectedOrder.payment_status)?.label || selectedOrder.payment_status}
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Ngày tạo:</span>{" "}
                                    {new Date(selectedOrder.created_at).toLocaleString("vi-VN")}
                                </div>
                                {selectedOrder.order_approved_at && (
                                    <div>
                                        <span className="font-semibold text-gray-700">Ngày phê duyệt:</span>{" "}
                                        {new Date(selectedOrder.order_approved_at).toLocaleString("vi-VN")}
                                    </div>
                                )}
                                {selectedOrder.coupon_id && (
                                    <div>
                                        <span className="font-semibold text-gray-700">Mã giảm giá:</span> #{selectedOrder.coupon_id}
                                    </div>
                                )}
                                <div>
                                    <span className="font-semibold text-gray-700">Sản phẩm:</span>
                                    <table className="min-w-full mt-2 border border-gray-200">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Tên sản phẩm</th>
                                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Giá</th>
                                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Số lượng</th>
                                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Tổng</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.items.map((item) => (
                                                <tr key={item.id} className="border-t">
                                                    <td className="px-4 py-2 text-sm text-gray-700">{item.product.product_name}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">{item.price.toLocaleString("vi-VN")} VNĐ</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">{item.quantity}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">
                                                        {(item.price * item.quantity).toLocaleString("vi-VN")} VNĐ
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={closeModal}
                                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 text-sm"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Pagination
                currentPage={currentPage}
                perPage={perPage}
                totalItems={totalItems}
                lastPage={lastPage}
                onPageChange={setCurrentPage}
            />
        </div>
    );
  }