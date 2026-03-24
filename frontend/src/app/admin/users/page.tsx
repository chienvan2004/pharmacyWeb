"use client";

import React, { useState, useEffect } from "react";
import { User } from "@/types/userInterface";
import { FaSearch } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import Select from "react-select";
import Pagination from "../../component/button/Pagination";
import { getUsers } from "@/services/userService";

const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
    });
    const [filters, setFilters] = useState({
        search: "",
        role_id: "",
        active: "",
        sort_by: "created_at",
        sort_direction: "desc",
        per_page: "15",
    });
    const [loading, setLoading] = useState(true); // Loading toàn trang
    const [tableLoading, setTableLoading] = useState(false); // Loading bảng
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        setTableLoading(true);
        setError(null);
        try {
            const params = {
                search: filters.search || undefined,
                role_id: filters.role_id ? Number(filters.role_id) : undefined,
                active: filters.active ? Number(filters.active) as 0 | 1 : undefined,
                sort_by: filters.sort_by,
                sort_direction: filters.sort_direction as "asc" | "desc",
                per_page: Number(filters.per_page),
                page: pagination.current_page,
            };
            const response: UserListResponse = await getUsers(params);
            setUsers(response.data);
            setPagination({
                current_page: response.current_page,
                last_page: response.last_page,
                per_page: response.per_page,
                total: response.total,
            });
        } catch (err: any) {
            setError(err.message || "Failed to fetch users");
        } finally {
            setTableLoading(false);
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                await fetchUsers();
            } catch (error) {
                setError("Failed to load users");
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
        
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [pagination.current_page, filters]);

    const handleFilterChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFilters((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        setPagination((prev) => ({ ...prev, current_page: 1 }));
    };

    const handleSelectChange = (selectedOption: any, field: string) => {
        const value = selectedOption ? selectedOption.value : "";
        setFilters((prev) => ({
            ...prev,
            [field]: value,
        }));
        setPagination((prev) => ({ ...prev, current_page: 1 }));
    };

    const handleResetFilters = () => {
        setFilters({
            search: "",
            role_id: "",
            active: "",
            sort_by: "created_at",
            sort_direction: "desc",
            per_page: "15",
        });
        setPagination((prev) => ({ ...prev, current_page: 1 }));
    };

    const handlePageChange = (page: number) => {
        setPagination((prev) => ({ ...prev, current_page: page }));
    };

    const roleOptions = [
        { value: "", label: "All Roles" },
        { value: "1", label: "Admin" },
        { value: "2", label: "Customer" },
    ];

    const activeOptions = [
        { value: "", label: "All Status" },
        { value: "1", label: "Active" },
        { value: "0", label: "Inactive" },
    ];

    const sortByOptions = [
        { value: "created_at", label: "Created At" },
        { value: "name", label: "Name" },
        { value: "email", label: "Email" },
    ];

    const sortDirectionOptions = [
        { value: "desc", label: "Descending" },
        { value: "asc", label: "Ascending" },
    ];

    const perPageOptions = [
        { value: "10", label: "10" },
        { value: "15", label: "15" },
        { value: "20", label: "20" },
        { value: "50", label: "50" },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <ClipLoader color="#2563eb" size={60} />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 min-h-screen">
            {/* Header Section with Search */}
            <div className="bg-gray-200 p-4 sm:p-6 rounded-lg shadow-lg mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h1>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-80">
                            <input
                                type="text"
                                name="search"
                                value={filters.search}
                                onChange={handleFilterChange}
                                onKeyPress={(e) => e.key === "Enter" && fetchUsers()}
                                placeholder="Tìm kiếm người dùng..."
                                className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="z-50">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Vai trò
                        </label>
                        <Select
                            options={roleOptions}
                            onChange={(selected) => handleSelectChange(selected, "role_id")}
                            value={roleOptions.find(
                                (option) => option.value === filters.role_id
                            )}
                            className="text-sm"
                            classNamePrefix="select"
                            placeholder="Chọn vai trò..."
                        />
                    </div>
                    <div className="z-50">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Trạng thái
                        </label>
                        <Select
                            options={activeOptions}
                            onChange={(selected) => handleSelectChange(selected, "active")}
                            value={activeOptions.find(
                                (option) => option.value === filters.active
                            )}
                            className="text-sm"
                            classNamePrefix="select"
                            placeholder="Chọn trạng thái..."
                        />
                    </div>
                    <div>
                        <button
                            onClick={handleResetFilters}
                            className="bg-gray-200 text-gray-800 px-4 py-3 mt-5 rounded-lg hover:bg-gray-300 transition-colors duration-150 text-sm"
                        >
                            Chọn lại
                        </button>
                    </div>
                </div>
            </div>

            {/* Users Table */}
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
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 rounded"
                                    />
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                    ID
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                    Tên
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                    Email
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                    Số điện thoại
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                    Vai trò
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-

4 text-left text-sm font-semibold text-gray-700">
                                    Loại tài khoản
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                    Ngày tạo
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="px-6 py-4 text-center text-sm text-gray-700"
                                    >
                                        Không tìm thấy người dùng
                                    </td>
                                </tr>
                            ) : (
                                users.map((user, index) => (
                                    <tr
                                        key={user.id}
                                        className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                            } hover:bg-gray-100 transition-colors duration-150`}
                                    >
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 text-blue-600 rounded"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {user.id}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {user.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {user.phone_number || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {user.role_id}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {user.active ? "Active" : "Inactive"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {user.account_type || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {user.created_at}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            <Pagination
                currentPage={pagination.current_page}
                perPage={pagination.per_page}
                totalItems={pagination.total}
                lastPage={pagination.last_page}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default UsersPage;