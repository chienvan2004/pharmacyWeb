'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { addUserAddress, updateProfile } from '@/services/authServices';
import useAuthStore from '@/stores/authStore'; // Import store để lấy userId
import { toast } from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';

export default function AddressPicker({ onSave }: { onSave: (houseNumber: string, provinceCode: string, districtCode: string, wardCode: string, provinces: any[], districts: any[], wards: any[]) => void }) {
    const { user } = useAuthStore(); // Lấy thông tin user từ store
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedWard, setSelectedWard] = useState('');
    const [houseNumber, setHouseNumber] = useState('');
    const [name, setName] = useState(''); // Thêm state cho tên
    const [phoneNumber, setPhoneNumber] = useState(''); // Thêm state cho số điện thoại
    const [isDefault, setIsDefault] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const res = await axios.get('https://vn-public-apis.fpo.vn/provinces/getAll?limit=-1');
                setProvinces(res.data.data.data);
            } catch (error) {
                console.error('Error fetching provinces:', error);
                toast.error('Lỗi khi lấy danh sách tỉnh/thành phố');
            }
        };
        fetchProvinces();
    }, []);

    useEffect(() => {
        if (selectedProvince) {
            const fetchDistricts = async () => {
                try {
                    const res = await axios.get(
                        `https://vn-public-apis.fpo.vn/districts/getByProvince?provinceCode=${selectedProvince}&limit=-1`
                    );
                    setDistricts(res.data.data.data);
                    setWards([]);
                    setSelectedDistrict('');
                    setSelectedWard('');
                } catch (error) {
                    console.error('Error fetching districts:', error);
                    toast.error('Lỗi khi lấy danh sách quận/huyện');
                }
            };
            fetchDistricts();
        }
    }, [selectedProvince]);

    useEffect(() => {
        if (selectedDistrict) {
            const fetchWards = async () => {
                try {
                    const res = await axios.get(
                        `https://vn-public-apis.fpo.vn/wards/getByDistrict?districtCode=${selectedDistrict}&limit=-1`
                    );
                    setWards(res.data.data.data);
                    setSelectedWard('');
                } catch (error) {
                    console.error('Error fetching wards:', error);
                    toast.error('Lỗi khi lấy danh sách phường/xã');
                }
            };
            fetchWards();
        }
    }, [selectedDistrict]);

    const handleSave = async () => {
        if (!houseNumber || !selectedProvince || !selectedDistrict || !selectedWard || !name || !phoneNumber) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        setLoading(true);
        try {
            const province = provinces.find(p => p.code === selectedProvince)?.name || '';
            const district = districts.find(d => d.code === selectedDistrict)?.name || '';
            const ward = wards.find(w => w.code === selectedWard)?.name || '';
            const fullAddress = `${houseNumber}, ${ward}, ${district}, ${province}`;

            // Lấy userId từ store
            const userId = user?.id;
            if (!userId) {
                toast.error('Không tìm thấy ID người dùng');
                return;
            }

            // Gửi địa chỉ lên API
            await addUserAddress({
                user_id: userId,
                address: fullAddress,
                address_default: isDefault,
            });

            // Cập nhật thông tin cá nhân (tên và số điện thoại)
            const profileData = {
                id: userId,
                name,
                phone_number: phoneNumber,
            };
            await updateProfile(profileData);

            toast.success('Lưu thông tin thành công');
            onSave(houseNumber, selectedProvince, selectedDistrict, selectedWard, provinces, districts, wards);
            // Reset form
            setHouseNumber('');
            setName('');
            setPhoneNumber('');
            setSelectedProvince('');
            setSelectedDistrict('');
            setSelectedWard('');
            setIsDefault(false);
        } catch (error) {
            console.error('Error saving data:', error);
            toast.error((error as any)?.message || 'Lỗi khi lưu thông tin');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w mx-auto space-y-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Thông tin người nhân</label>
            {/* Hàng 1: Tên & Số điện thoại */}
            <div className="grid grid-cols-2 gap-3">
                <input
                    type="text"
                    placeholder="Nhập họ và tên"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md text-sm"
                />
                <input
                    type="text"
                    placeholder="Nhập số điện thoại"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md text-sm"
                />
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ chỉ nhận hàng</label>

            {/* Hàng 2: Tỉnh & Quận */}
            <div className="grid grid-cols-2 gap-3">
                <select
                    className="w-full px-4 py-2 border rounded-md text-sm"
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                >
                    <option value="">Chọn tỉnh/thành phố</option>
                    {provinces.map((province) => (
                        <option key={province.code} value={province.code}>
                            {province.name}
                        </option>
                    ))}
                </select>

                <select
                    className={`w-full px-4 py-2 border rounded-md text-sm ${!selectedProvince
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : ''
                        }`}
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    disabled={!selectedProvince}
                >
                    <option value="">Chọn quận/huyện</option>
                    {districts.map((district) => (
                        <option key={district.code} value={district.code}>
                            {district.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Hàng 3: Phường/xã */}
            <select
                className={`w-full px-4 py-2 border rounded-md text-sm ${!selectedDistrict
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : ''
                    }`}
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                disabled={!selectedDistrict}
            >
                <option value="">Chọn phường/xã</option>
                {wards.map((ward) => (
                    <option key={ward.code} value={ward.code}>
                        {ward.name}
                    </option>
                ))}
            </select>

            {/* Hàng 4: Nhập địa chỉ cụ thể */}
            <input
                type="text"
                placeholder="Nhập số nhà"
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                className="w-full px-4 py-2 border rounded-md text-sm"
            />

            {/* Checkbox địa chỉ mặc định */}
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="isDefault"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="mr-2"
                />
                <label htmlFor="isDefault" className="text-sm">
                    Đặt làm địa chỉ mặc định
                </label>
            </div>

            {/* Nút Lưu */}
            <button
                onClick={handleSave}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                disabled={loading || !houseNumber || !selectedProvince || !selectedDistrict || !selectedWard || !name || !phoneNumber}
            >
                {loading ? <ClipLoader size={18} color="#fff" /> : 'Lưu'}
            </button>
        </div>
    );
}