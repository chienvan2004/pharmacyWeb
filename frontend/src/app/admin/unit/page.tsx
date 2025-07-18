'use client';

import StoreUnitModal from '@/app/admin/components/StoreUnitModal';
import UpdateUnitModal from '@/app/admin/components/UpdateUnitModal';
import { createUnit, deleteUnit, exportUnit, getAllUnits, importUnit, updateUnit } from '@/services/unitServices';
import { Unit } from '@/types/unitInterface';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FaEdit, FaToggleOff, FaToggleOn, FaTrash } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';

export default function UnitPage() {
    // STATE LIÊN QUAN ĐẾN LOAD DỮ LIỆU
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selected, setSelectedUnit] = useState<Unit | null>(null);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [updateFormErrors, setUpdateFormErrors] = useState<{ [key: string]: string }>({});
    const fileInputRef = useRef<HTMLInputElement>(null);


    // HÀM LOAD DỮ LIỆU
    const fetchUnits = async () => {
        setLoading(true);
        try {
            const res = await getAllUnits();
            setUnits(res.data);
        } catch (error) {
            toast.error('Lỗi khi tải danh sách đơn vị');
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    // GỌI API KHI PAGE THAY ĐỔI
    useEffect(() => {
        fetchUnits();
    }, []);


    const handleAddClick = () => {
        setSelectedUnit(null); // reset
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setIsUpdateModalOpen(false);
        setSelectedUnit(null);
        setUpdateFormErrors({});
    };
    const handleEditClick = (unit: Unit) => {
        setSelectedUnit(unit);
        setIsUpdateModalOpen(true);
    };

    //thêm đơn vị
    const handleAddunitSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        setFormErrors({}); // reset lỗi trước đó

        try {
            await createUnit(formData);
            toast.success('Thêm đơn vị thành công!');
            setIsModalOpen(false);
            form.reset();
            fetchUnits();
        } catch (err: any) {
            if (err.errors) {
                const formatted: { [key: string]: string } = {};
                for (const key in err.errors) {
                    formatted[key] = err.errors[key][0]; // chỉ lấy lỗi đầu tiên
                }
                setFormErrors(formatted);
            }
            console.error(err);
        }
    };


    //cập nhật đơn vị
    const handleUpdateSubmit = async (id: number, formData: FormData) => {
        setUpdateFormErrors({}); // reset lỗi

        try {
            await updateUnit(id, formData);
            toast.success('Cập nhật đơn vị thành công!');
            setIsUpdateModalOpen(false);
            fetchUnits();
        } catch (err: any) {
            if (err.errors) {
                const formatted: { [key: string]: string } = {};
                for (const key in err.errors) {
                    formatted[key] = err.errors[key][0];
                }
                setUpdateFormErrors(formatted);
            }
            console.error('Lỗi khi cập nhật đơn vị:', err);
        }
    };

    //xóa đơn vị
    const handleDelete = async (id: number) => {
        toast((t) => (
            <span className="flex flex-col space-y-2">
                <span>Bạn có chắc muốn xóa đơn vị này?</span>
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            deleteUnit(id)
                                .then(() => {
                                    toast.success('Xóa đơn vị thành công!');
                                    fetchUnits();
                                })
                                .catch((error) => {
                                    toast.error('Lỗi khi xóa đơn vị!');
                                    console.error('Lỗi khi xóa:', error);
                                });
                        }}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                    >
                        Xóa
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 text-sm"
                    >
                        Hủy
                    </button>
                </div>
            </span>
        ), {
            duration: 5000,
        });
    };


    const handleToggleStatus = async (unit: Unit) => {
        const newStatus = !unit.active;
        const formData = new FormData();
        formData.append('active', newStatus ? '1' : '0');
        console.log(newStatus);

        try {
            await updateUnit(unit.id, formData);
            toast.success(`Đã ${newStatus ? 'bật' : 'tắt'} trạng thái thương hiệu`);
            fetchUnits(); // refresh lại danh sách
        } catch (err) {
            toast.error('Lỗi khi thay đổi trạng thái');
            console.error(err);
        }
    };
const handleExport = async () => {
        try {
            await exportUnit();
            toast.success('Xuất file Excel thành công!');
        } catch (error) {
            toast.error('Lỗi khi xuất file Excel');
            console.error(error);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            await importUnit(file);
            toast.success('Nhập dữ liệu từ Excel thành công!');
            fetchUnits();
        } catch (error) {
            toast.error('Lỗi khi nhập file Excel');
            console.error(error);
        } finally {
            e.target.value = ''; // reset input để cho phép chọn lại cùng 1 file
        }
    };

    // PHẦN HIỂN THỊ LOADING
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <ClipLoader color="#123abc" size={50} />
            </div>
        );
    }

    // PHẦN HIỂN THỊ BẢNG
    return (
        <div className="overflow-x-auto p-4">
            <div className="flex items-center justify-between bg-gray-200 w-full h-16 px-6 mb-7 rounded">
                <h1 className="text-lg font-semibold">Quản lí đơn vị</h1>
                <div className="space-x-2">
                    <button
                        onClick={handleExport}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                    >
                        Xuất Excel
                    </button>
                    <button
                        onClick={handleImportClick}
                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 text-sm"
                    >
                        Nhập Excel
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <button
                        onClick={handleAddClick}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                    >
                        Thêm
                    </button>
                </div>
            </div>

            <div className="relative">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                    <thead className="bg-gray-400">
                        <tr>
                            <th className="px-6 py-3 text-left"><input type="checkbox" /></th>
                            <th className="px-6 py-3 text-left">ID</th>
                            <th className="px-6 py-3 text-left">Tên đơn vị</th>
                            <th className="px-6 py-3 text-left text-xs font-extrabold uppercase sticky right-0">Hoạt động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {units.map((u, index) => (
                            <tr key={u.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-200'} hover:bg-gray-300`}>
                                <td className="px-6 py-3"><input type="checkbox" /></td>
                                <td className="px-6 py-3 text-sm">{u.id}</td>
                                <td className="px-6 py-3 text-sm">{u.unit_name}</td>
                                <td className={`px-6 py-3 sticky right-0 space-x-2`}>
                                    <button
                                        onClick={() => handleEditClick(u)}
                                        className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 inline-flex items-center space-x-1">
                                        <FaEdit className="text-sm" />
                                        <span>Sửa</span>
                                    </button>
                                    <button onClick={() => handleDelete(u.id)} className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 inline-flex items-center space-x-1">
                                        <FaTrash className="text-sm" />
                                        <span>Xóa</span>
                                    </button>
                                    <button
                                        onClick={() => handleToggleStatus(u)}
                                        className={`${u.active ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-400 hover:bg-gray-500'
                                            } text-white px-2 py-1 rounded text-xs inline-flex items-center space-x-1`}
                                    >
                                        {u.active ? <FaToggleOn className="text-sm" /> : <FaToggleOff className="text-sm" />}
                                        <span>{u.active ? 'Kích hoạt' : 'Ngưng kích hoạt'}</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <StoreUnitModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onSubmit={handleAddunitSubmit}
                formErrors={formErrors}
            />

            <UpdateUnitModal
                isOpen={isUpdateModalOpen}
                onClose={handleModalClose}
                onSubmit={handleUpdateSubmit}
                unit={selected}
                formErrors={updateFormErrors}
            />
        </div>
    );
}