'use client';

import { createProductStore, deleteProductStore, exportProductStore, getAllProductStores, importProductStore, updateProductStore } from '@/services/productStoreServices';
import { ProductStore } from '@/types/productStoreInterface';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FaEdit, FaSearch, FaTrash } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import UpdateProductStoreModal from '../components/UpdateProductStoreModel';
import ProductStoreModal from '../components/ProductStoreModal ';

export default function ProductStorePage() {
  // STATE LIÊN QUAN ĐẾN LOAD DỮ LIỆU
  const [productStores, setProductStores] = useState<ProductStore[]>([]);
  const [loading, setLoading] = useState(true); // Loading cho lần tải đầu tiên của toàn trang
  const [tableLoading, setTableLoading] = useState(false); // Loading riêng cho bảng
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selected, setSelectedProductStore] = useState<ProductStore | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [updateFormErrors, setUpdateFormErrors] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // STATE CHO PHÂN TRANG
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  // STATE CHO BỘ LỌC (sử dụng một ô input duy nhất)
  const [searchTerm, setSearchTerm] = useState('');

  // HÀM LOAD DỮ LIỆU VỚI BỘ LỌC VÀ PHÂN TRANG
  const fetchProductStores = async (page: number = 1, perPage: number = 10) => {
    setTableLoading(true); // Chỉ bật loading cho bảng
    try {
      const filters = {};
      if (searchTerm) {
        // Tự động lọc theo product_id nếu là số, hoặc name nếu là chuỗi
        const isNumeric = !isNaN(parseInt(searchTerm));
        if (isNumeric) {
          filters.product_id = parseInt(searchTerm);
        } else {
          filters.name = searchTerm;
        }
      }
      const res = await getAllProductStores(page, perPage, filters);
      setProductStores(res.data);
      setTotalItems(res.meta?.total || 0);
      setLastPage(res.meta?.last_page || 1);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách sản phẩm trong kho');
      console.error(error);
    } finally {
      setTableLoading(false); // Tắt loading cho bảng
    }
  };

  // GỌI API KHI PAGE ĐƯỢC TẢI LẦN ĐẦU HOẶC THAY ĐỔI TRANG
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true); // Bật loading toàn trang
      try {
        await fetchProductStores(currentPage, perPage);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu ban đầu:', error);
      } finally {
        setLoading(false); // Tắt loading toàn trang
      }
    };
    loadInitialData();
  }, [currentPage, perPage]);

  // GỌI API KHI SEARCH TERM THAY ĐỔI
  useEffect(() => {
    fetchProductStores(currentPage, perPage);
  }, [searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= lastPage) {
      setCurrentPage(newPage);
    }
  };

  const handleAddClick = () => {
    setSelectedProductStore(null); // reset
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsUpdateModalOpen(false);
    setSelectedProductStore(null);
    setUpdateFormErrors({});
  };

  const handleEditClick = (productStore: ProductStore) => {
    setSelectedProductStore(productStore);
    setIsUpdateModalOpen(true);
  };

  // Thêm sản phẩm vào kho
  const handleAddProductStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    setFormErrors({}); // reset lỗi trước đó

    try {
      await createProductStore(formData);
      toast.success('Thêm sản phẩm vào kho thành công!');
      setIsModalOpen(false);
      form.reset();
      fetchProductStores(currentPage, perPage); // Làm mới dữ liệu với trang hiện tại
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

  // Cập nhật sản phẩm trong kho
  const handleUpdateSubmit = async (id: number, formData: FormData) => {
    setUpdateFormErrors({}); // reset lỗi

    try {
      await updateProductStore(id, formData);
      toast.success('Cập nhật sản phẩm trong kho thành công!');
      setIsUpdateModalOpen(false);
      fetchProductStores(currentPage, perPage); // Làm mới dữ liệu với trang hiện tại
    } catch (err: any) {
      if (err.errors) {
        const formatted: { [key: string]: string } = {};
        for (const key in err.errors) {
          formatted[key] = err.errors[key][0];
        }
        setUpdateFormErrors(formatted);
      }
      console.error('Lỗi khi cập nhật sản phẩm trong kho:', err);
    }
  };

  // Xóa sản phẩm khỏi kho
  const handleDelete = async (id: number) => {
    toast((t) => (
      <span className="flex flex-col space-y-2">
        <span>Bạn có chắc muốn xóa sản phẩm này khỏi kho?</span>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              deleteProductStore(id)
                .then(() => {
                  toast.success('Xóa sản phẩm khỏi kho thành công!');
                  fetchProductStores(currentPage, perPage); // Làm mới dữ liệu với trang hiện tại
                })
                .catch((error) => {
                  toast.error('Lỗi khi xóa sản phẩm!');
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
    ));
  };

  const handleExport = async () => {
    try {
      await exportProductStore();
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
      await importProductStore(file);
      toast.success('Nhập dữ liệu từ Excel thành công!');
      fetchProductStores(currentPage, perPage); // Làm mới dữ liệu với trang hiện tại
    } catch (error) {
      toast.error('Lỗi khi nhập file Excel');
      console.error(error);
    } finally {
      e.target.value = ''; // reset input để cho phép chọn lại cùng 1 file
    }
  };

  // PHẦN HIỂN THỊ LOADING CHO TOÀN TRANG
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
        <h1 className="text-lg font-semibold">Quản lí sản phẩm trong kho</h1>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 sm:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Tìm kiếm mã hoặc tên sản phẩm..."
              className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
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
        {tableLoading ? (
          <div className="flex justify-center items-center py-10">
            <ClipLoader color="#123abc" size={40} />
          </div>
        ) : (
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
            <thead className="bg-gray-400">
              <tr>
                <th className="px-6 py-3 text-left"><input type="checkbox" /></th>
                <th className="px-6 py-3 text-left">ID</th>
                <th className="px-6 py-3 text-left">Tên sản phẩm</th>
                <th className="px-6 py-3 text-left">Mã sản phẩm</th>
                <th className="px-6 py-3 text-left">Giá nhập</th>
                <th className="px-6 py-3 text-left">Số lượng</th>
                <th className="px-6 py-3 text-left text-xs font-extrabold uppercase sticky right-0">Hoạt động</th>
              </tr>
            </thead>
            <tbody>
              {productStores.map((p, index) => (
                <tr key={p.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-200'} hover:bg-gray-300`}>
                  <td className="px-6 py-3"><input type="checkbox" /></td>
                  <td className="px-6 py-3 text-sm">{p.id}</td>
                  <td className="px-6 py-3 text-sm">{p.product.product_name}</td>
                  <td className="px-6 py-3 text-sm">{p.product_id}</td>
                  <td className="py-3 text-sm">
                    {p.root_price ? (
                      new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(p.root_price)
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="px-6 py-3 text-sm">{p.quantity}</td>
                  <td className={`px-6 py-3 sticky right-0 space-x-2`}>
                    <button
                      onClick={() => handleEditClick(p)}
                      className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 inline-flex items-center space-x-1"
                    >
                      <FaEdit className="text-sm" />
                      <span>Sửa</span>
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 inline-flex items-center space-x-1"
                    >
                      <FaTrash className="text-sm" />
                      <span>Xóa</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* PHÂN TRANG */}
      <div className="flex justify-between items-center mt-4 px-4 py-3 bg-gray-100 rounded-lg">
        <div className="text-sm text-gray-700">
          Hiển thị từ {(currentPage - 1) * perPage + 1} đến {Math.min(currentPage * perPage, totalItems)} của {totalItems} kết quả
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trước
          </button>
          {Array.from({ length: lastPage }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 ${currentPage === page
                ? 'bg-blue-500 text-white'
                : 'bg-white border border-gray-300'
                } rounded-md text-sm`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === lastPage}
            className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sau
          </button>
        </div>
      </div>

      <ProductStoreModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleAddProductStoreSubmit}
        formErrors={formErrors}
      />

      <UpdateProductStoreModal
        isOpen={isUpdateModalOpen}
        onClose={handleModalClose}
        onSubmit={handleUpdateSubmit}
        productStore={selected}
        formErrors={updateFormErrors}
      />
    </div>
  );
}