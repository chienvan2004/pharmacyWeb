'use client';

import AddressPicker from '@/app/component/Addresses';
import { addUserAddress } from '@/services/authServices';
import { getCart, removeItem, updateItemQuantity } from '@/services/cardServices';
import { checkCoupon, incrementTimesUsed } from '@/services/couponServices';
import orderService from '@/services/orderService';
import useAuthStore from '@/stores/authStore';
import { Coupon } from '@/types/couponInterface';
import { AxiosError } from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaMinus, FaPlus, FaTrash } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';

const formatPrice = (price: number | string) => {
    const parsedPrice = parseFloat(price as string);
    return !isNaN(parsedPrice)
        ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parsedPrice)
        : '0 đ';
};

const formatDiscount = (discount: number | string) => {
    const parsedDiscount = parseFloat(discount as string);
    return !isNaN(parsedDiscount) ? parsedDiscount.toFixed(0) + '%' : '0%';
};

export default function MedicineCart() {
    const { cart, setCart, setCartItemCount, cartItemCount, user, clearCart } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tempQuantities, setTempQuantities] = useState<{ [key: number]: number }>({});
    const [couponCode, setCouponCode] = useState<string>('');
    const [coupon, setCoupon] = useState<Coupon | null>(null);
    const [couponError, setCouponError] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<{
        name?: string;
        phone_number?: string;
        address?: string;
        houseNumber?: string;
        provinceCode?: string;
        districtCode?: string;
        wardCode?: string;
    } | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'vnpay' | null>(null); // Phương thức thanh toán mặc định
    const router = useRouter();

    useEffect(() => {
        const fetchCart = async () => {
            setLoading(true);
            try {
                const data = await getCart();
                setCart(data);
                setCartItemCount(data.total_items_count);
                const initialQuantities = data.items.reduce((acc, item) => {
                    acc[item.id] = item.quantity;
                    return acc;
                }, {} as { [key: number]: number });
                setTempQuantities(initialQuantities);
            } catch (err) {
                const error = err as AxiosError;
                setError(error.message || 'Không thể tải giỏ thuốc');
            } finally {
                setLoading(false);
            }
        };
        fetchCart();

        if (user) {
            const defaultAddress = user.addresses?.find(address => address.address_default === 1)?.address || (user.addresses?.length ? user.addresses[0].address : null);
            let houseNumber = '', provinceCode = '', districtCode = '', wardCode = '';
            if (defaultAddress) {
                const addressParts = defaultAddress.split(', ');
                houseNumber = addressParts[0] || '';
                if (addressParts.length >= 3) {
                    wardCode = addressParts[1].trim();
                    districtCode = addressParts[2].trim();
                    provinceCode = addressParts[3].trim();
                }
            }
            setUserInfo({
                name: user.name,
                phone_number: user.phone_number,
                address: defaultAddress,
                houseNumber,
                provinceCode,
                districtCode,
                wardCode,
            });
            // Mặc định chọn cash nếu có thông tin giao hàng
            if (!selectedPaymentMethod && defaultAddress) setSelectedPaymentMethod('cash');
        }
    }, [setCart, setCartItemCount, user]);

    const hasShippingInfo = userInfo && userInfo.name && userInfo.phone_number && userInfo.address;

    const handleUpdateQuantity = async (itemId: number, quantity: number) => {
        if (quantity < 1) {
            setError('Số lượng phải lớn hơn 0');
            return;
        }
        setLoading(true);
        try {
            const data = await updateItemQuantity(itemId, quantity);
            setCart(data.card);
            setCartItemCount(data.card.total_items_count);
            const updatedItem = data.card.items.find((item) => item.id === itemId);
            if (updatedItem) {
                setTempQuantities((prev) => ({ ...prev, [itemId]: updatedItem.quantity }));
            }
            setError(null);
        } catch (err) {
            const error = err as AxiosError;
            setError(error.message || 'Cập nhật số lượng thất bại');
            const originalQuantity = cart?.items.find((item) => item.id === itemId)?.quantity || 1;
            setTempQuantities((prev) => ({ ...prev, [itemId]: originalQuantity }));
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveItem = async (itemId: number) => {
        setLoading(true);
        try {
            const data = await removeItem(itemId);
            setCart(data.card);
            setCartItemCount(data.card.total_items_count);
            setError(null);
        } catch (err) {
            const error = err as AxiosError;
            setError(error.message || 'Xóa sản phẩm thất bại');
        } finally {
            setLoading(false);
        }
    };

    const calculateFinalPrice = (item: any) => {
        const originalPrice = parseFloat(item.product.buying_price);
        const currentDate = new Date();
        if (!item.product.product_sale || !item.product.product_sale.sale_end_date) {
            return originalPrice;
        }
        const saleEndDate = new Date(item.product.product_sale.sale_end_date);
        if (saleEndDate < currentDate) {
            return originalPrice;
        }
        const discount = item.product.product_sale.sale_price || 0;
        return originalPrice - (originalPrice * discount / 100);
    };

    const calculateItemTotal = (item: any) => {
        const finalPrice = calculateFinalPrice(item);
        return finalPrice * (tempQuantities[item.id] || item.quantity);
    };

    const calculateSubtotal = (item: any) => {
        const originalPrice = parseFloat(item.product.buying_price);
        return originalPrice * (tempQuantities[item.id] || item.quantity);
    };

    const calculateDiscount = (item: any) => {
        const originalPrice = parseFloat(item.product.buying_price);
        const currentDate = new Date();
        if (!item.product.product_sale || !item.product.product_sale.sale_end_date) return 0;
        const saleEndDate = new Date(item.product.product_sale.sale_end_date);
        if (saleEndDate < currentDate) return 0;
        const discountRate = item.product.product_sale.sale_price || 0;
        const quantity = tempQuantities[item.id] || item.quantity;
        return (originalPrice * discountRate / 100) * quantity;
    };

    const handleQuantityChange = (itemId: number, value: string) => {
        const newQuantity = parseInt(value);
        if (!isNaN(newQuantity) && newQuantity >= 1) {
            setTempQuantities((prev) => ({ ...prev, [itemId]: newQuantity }));
            handleUpdateQuantity(itemId, newQuantity);
        }
    };

    const handleIncrement = (itemId: number) => {
        const currentQuantity = tempQuantities[itemId] || cart?.items.find((item) => item.id === itemId)?.quantity || 1;
        const newQuantity = currentQuantity + 1;
        setTempQuantities((prev) => ({ ...prev, [itemId]: newQuantity }));
        handleUpdateQuantity(itemId, newQuantity);
    };

    const handleDecrement = (itemId: number) => {
        const currentQuantity = tempQuantities[itemId] || cart?.items.find((item) => item.id === itemId)?.quantity || 1;
        if (currentQuantity > 1) {
            const newQuantity = currentQuantity - 1;
            setTempQuantities((prev) => ({ ...prev, [itemId]: newQuantity }));
            handleUpdateQuantity(itemId, newQuantity);
        }
    };

    const totalSubtotal = cart?.items.reduce((sum, item) => sum + calculateSubtotal(item), 0) || 0;
    const totalProductDiscount = cart?.items.reduce((sum, item) => sum + calculateDiscount(item), 0) || 0;
    const totalPromotionDiscount = coupon
        ? coupon.discount_type === 'percent'
            ? (parseFloat(coupon.discount_value) / 100) * totalSubtotal
            : parseFloat(coupon.discount_value)
        : 0;
    const totalPrice = totalSubtotal - totalProductDiscount - totalPromotionDiscount;

    const checkCouponCode = async (code: string) => {
        setLoading(true);
        setCouponError(null);
        try {
            const productIds = cart?.items.map(item => item.product_id) || [];
            const response = await checkCoupon(code, totalSubtotal, productIds);
            if (response.data && response.data.coupon) {
                const { coupon } = response.data;
                setCoupon(coupon);
                await incrementTimesUsedCode(coupon.id);
                toast.success('Mã giảm giá đã được áp dụng!');
            } else {
                setCouponError('Mã giảm giá không hợp lệ');
                toast.error('Mã giảm giá không hợp lệ');
            }
        } catch (err) {
            const error = err as AxiosError;
            setCouponError(error.response?.data?.errors || 'Mã giảm giá không hợp lệ');
            toast.error(error.response?.data?.errors || 'Mã giảm giá không hợp lệ');
        } finally {
            setLoading(false);
        }
    };

    const incrementTimesUsedCode = async (id: number) => {
        try {
            const response = await incrementTimesUsed(id);
            if (response.data) {
                setCoupon(response.data);
            }
        } catch (err) {
            console.error('Lỗi tăng số lần sử dụng:', err);
        }
    };

    const handlePlaceOrder = async () => {
        if (!cart || cart.items.length === 0) return;
        if (!selectedPaymentMethod) {
            toast.error('Vui lòng chọn phương thức thanh toán!');
            return;
        }

        const requestData = {
            user_id: user?.id,
            coupon_id: coupon?.id,
            payment_method: selectedPaymentMethod,
            items: cart.items.map((item) => ({
                product_id: item.product_id,
                price: calculateFinalPrice(item),
                quantity: tempQuantities[item.id] || item.quantity,
            })),
        };

        setLoading(true);
        try {
            const response = await orderService.placeOrder(requestData);
            if (response.requires_input) {
                setUserInfo({
                    name: user?.name,
                    phone_number: response.has_phone_number ? user?.phone_number : '',
                    address: response.has_address ? userInfo?.address : '',
                });
                toast.warning('Vui lòng cung cấp thông tin thiếu (số điện thoại hoặc địa chỉ).');
            } else {
                toast.success('Đặt hàng thành công');
                clearCart();
                if (response.payment_url) {
                    // Mở payment_url và tự động chuyển hướng đến callback sau khi thanh toán
                    window.open(response.payment_url, '_blank');
                    // Có thể thêm logic để theo dõi tab hoặc redirect về /payment-callback sau khi VNPay xử lý
                } else if (response.order_id) {
                    router.push('/');
                }
                setUserInfo(response.user_info || null);
            }
        } catch (error) {
            toast.error('Lỗi khi đặt thuốc');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAddress = async () => {
        if (!user?.id || !userInfo?.address) {
            console.log('Missing user ID or address:', { userId: user?.id, userInfo });
            return;
        }

        setLoading(true);
        try {
            console.log('Saving address:', { userId: user.id, address: userInfo.address });
            const addressData = {
                user_id: user.id,
                address: userInfo.address,
                address_default: true,
            };
            const response = await addUserAddress(addressData);
            console.log('Address saved successfully:', response);
            toast.success('Đặt hàng thành công');
            setIsEditing(false);
            setUserInfo((prev) => ({ ...prev, address: response.address.address } as any));
        } catch (error) {
            console.error('Error saving address:', error);
            toast.error((error as any)?.message || 'Lỗi khi lưu địa chỉ');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-60">
            <ClipLoader size={48} color="#2563EB" />
        </div>
    );

    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
                <h1 className="text-2xl font-bold mb-4">Giỏ thuốc ({cartItemCount})</h1>
                {cart && cart.items.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b">
                                    <th className="py-2 px-4">Sản phẩm</th>
                                    <th className="py-2 px-4">Đơn giá</th>
                                    <th className="py-2 px-4">Số lượng</th>
                                    <th className="py-2 px-4">Thành tiền</th>
                                    <th className="py-2 px-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart.items.map((item) => {
                                    const originalPrice = parseFloat(item.product.buying_price);
                                    const currentDate = new Date();
                                    const finalPrice = calculateFinalPrice(item);
                                    const currentQuantity = tempQuantities[item.id] || item.quantity;
                                    const itemTotal = calculateItemTotal(item);
                                    const isSaleExpired = item.product.product_sale && item.product.product_sale.sale_end_date
                                        ? new Date(item.product.product_sale.sale_end_date) < currentDate
                                        : true;

                                    return (
                                        <tr key={item.id} className="border-b">
                                            <td className="py-4 px-4 flex items-center space-x-4">
                                                {item.product.images && Array.isArray(item.product.images) && item.product.images.length > 0 ? (
                                                    (() => {
                                                        const mainImage = item.product.images.find((img) => img.is_main) || item.product.images[0];
                                                        return (
                                                            <Image
                                                                src={`http://localhost:8000/${mainImage.image}`}
                                                                alt={mainImage.image || 'Ảnh thuốc'}
                                                                width={48}
                                                                height={48}
                                                                className="object-cover rounded-md"
                                                                onError={(e) => {
                                                                    e.currentTarget.src = '/placeholder-image.jpg';
                                                                }}
                                                            />
                                                        );
                                                    })()
                                                ) : (
                                                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                )}
                                                <div>
                                                    <p className="font-semibold">{item.product.product_name}</p>
                                                    {!isSaleExpired && item.product.product_sale && item.product.product_sale.sale_end_date && (
                                                        <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1 inline-block">
                                                            Giảm ngày {formatDiscount(item.product.product_sale.sale_price)} đến ngày{' '}
                                                            {new Date(item.product.product_sale.sale_end_date).toLocaleDateString('vi-VN')}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                {isSaleExpired || !item.product.product_sale ? (
                                                    <p className="font-semibold">{formatPrice(originalPrice)}</p>
                                                ) : (
                                                    <>
                                                        <p className="text-sm line-through text-gray-400">{formatPrice(originalPrice)}</p>
                                                        <p className="font-semibold">{formatPrice(finalPrice)}</p>
                                                    </>
                                                )}
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleDecrement(item.id)}
                                                        className="w-8 h-8 rounded-full border text-gray-700 hover:bg-gray-100"
                                                        disabled={currentQuantity <= 1}
                                                    >
                                                        <FaMinus size={12} className="mx-auto" />
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={currentQuantity}
                                                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                                        className="w-16 p-1 border rounded text-center"
                                                    />
                                                    <button
                                                        onClick={() => handleIncrement(item.id)}
                                                        className="w-8 h-8 rounded-full border text-gray-700 hover:bg-gray-100"
                                                    >
                                                        <FaPlus size={12} className="mx-auto" />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-right font-semibold">
                                                {formatPrice(itemTotal)}
                                            </td>
                                            <td className="py-4 px-4">
                                                <button
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <FaTrash size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-10">Giỏ thuốc trống</div>
                )}
            </div>
            <div className="bg-white rounded-lg shadow p-6 h-fit lg:sticky lg:top-4">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Tổng quan đơn thuốc</h2>
                <div className="space-y-4">
                    {/* Coupon Input Section */}
                    <div>
                        <label htmlFor="couponCode" className="block text-sm font-medium text-gray-700 mb-2">
                            Mã giảm giá
                        </label>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <input
                                id="couponCode"
                                type="text"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                placeholder="Nhập mã giảm giá"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                            <button
                                onClick={() => checkCouponCode(couponCode)}
                                className="min-w-[100px] px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center"
                                disabled={loading || !couponCode}
                            >
                                {loading ? <ClipLoader size={18} color="#fff" /> : 'Áp dụng'}
                            </button>
                        </div>
                        {couponError && (
                            <p className="text-red-500 text-sm mt-2">{couponError}</p>
                        )}
                        {coupon && (
                            <div className="mt-2 text-green-600 text-sm">
                                Mã <span className="font-semibold">{coupon.code}</span> đã được áp dụng: Giảm{' '}
                                {coupon.discount_type === 'percent'
                                    ? `${coupon.discount_value}%`
                                    : formatPrice(coupon.discount_value)}
                            </div>
                        )}
                    </div>

                    {/* Payment Method Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Chọn phương thức thanh toán</label>
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="cash"
                                    checked={selectedPaymentMethod === 'cash'}
                                    onChange={() => setSelectedPaymentMethod('cash')}
                                    className="text-blue-600 focus:ring-blue-500"
                                    disabled={!hasShippingInfo}
                                />
                                <span className="text-gray-700">Thanh toán tiền mặt khi nhận hàng</span>
                            </label>
                            <label className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="vnpay"
                                    checked={selectedPaymentMethod === 'vnpay'}
                                    onChange={() => setSelectedPaymentMethod('vnpay')}
                                    className="text-blue-600 focus:ring-blue-500"
                                    disabled={!hasShippingInfo}
                                />
                                <span className="text-gray-700">Thanh toán bằng VNPay</span>
                            </label>
                        </div>
                    </div>

                    {/* Order Summary Section */}
                    <div className="border-t pt-4 space-y-3">
                        <div className="flex justify-between text-gray-600">
                            <span>Tạm tính</span>
                            <span className="font-medium">{formatPrice(totalSubtotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Giảm giá ưu đãi</span>
                            <span className="font-medium">
                                {coupon ? `- ${formatPrice(totalPromotionDiscount)}` : '- 0 đ'}
                            </span>
                        </div>
                        <div className="flex justify-between text-red-600 font-semibold">
                            <span>Giảm giá sản phẩm</span>
                            <span>-{formatPrice(totalProductDiscount)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-red-600 pt-2 border-t">
                            <span>Tổng tiền</span>
                            <span>{formatPrice(totalPrice)}</span>
                        </div>
                    </div>

                    {/* Checkout Button */}
                    <button
                        onClick={handlePlaceOrder}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold disabled:bg-gray-300"
                        disabled={cartItemCount === 0 || !hasShippingInfo || !selectedPaymentMethod}
                    >
                        Mua thuốc ({cartItemCount})
                    </button>
                </div>
            </div>
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-4 space-y-4">
                <h1 className="text-xl font-medium mb-4">Thông tin người nhận</h1>
                {hasShippingInfo ? (
                    <div className="mb-4">
                        <div className="flex justify-between items-center">
                            <p>
                                <span className="font-medium">{userInfo.name}</span> | {userInfo.phone_number}
                            </p>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-blue-500 underline ml-4 whitespace-nowrap"
                            >
                                Thay đổi
                            </button>
                        </div>
                        <p>{userInfo.address}</p>
                    </div>
                ) : (
                    <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
                        <AddressPicker
                            onSave={(houseNumber, provinceCode, districtCode, wardCode, provinces, districts, wards) => {
                                const province = provinces.find(p => p.code === provinceCode)?.name || '';
                                const district = districts.find(d => d.code === districtCode)?.name || '';
                                const ward = wards.find(w => w.code === wardCode)?.name || '';
                                const fullAddress = `${houseNumber}, ${ward}, ${district}, ${province}`;
                                setUserInfo((prev) => ({ ...prev, address: fullAddress } as any));
                            }}
                        />
                    </div>
                )}

                {/* Modal để chỉnh sửa thông tin người nhận */}
                {isEditing && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                            <h2 className="text-xl font-semibold mb-4">Chỉnh sửa thông tin người nhận</h2>
                            <div className="space-y-4">
                                <div>
                                    <AddressPicker
                                        onSave={(houseNumber, provinceCode, districtCode, wardCode, provinces, districts, wards) => {
                                            const province = provinces.find(p => p.code === provinceCode)?.name || '';
                                            const district = districts.find(d => d.code === districtCode)?.name || '';
                                            const ward = wards.find(w => w.code === wardCode)?.name || '';
                                            const fullAddress = `${houseNumber}, ${ward}, ${district}, ${province}`;
                                            setUserInfo((prev) => ({ ...prev, address: fullAddress } as any));
                                        }}
                                    />
                                </div>
                                <div className="flex justify-end gap-4">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleSaveAddress}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        disabled={!userInfo?.address || loading}
                                    >
                                        {loading ? <ClipLoader size={18} color="#fff" /> : 'Lưu'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}