export default function Footer() {
    return (
        <footer className="bg-white py-10 text-gray-700 text-sm mt-7">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <h3 className="text-base font-semibold mb-3">Về Pharmacity</h3>
                        <ul className="space-y-2">
                            <li>Giới thiệu</li>
                            <li>Hệ thống cửa hàng</li>
                            <li>Quy chế hoạt động</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-base font-semibold mb-3">Danh mục</h3>
                        <ul className="space-y-2">
                            <li>Thuốc</li>
                            <li>Tra cứu bệnh</li>
                            <li>Chăm sóc cá nhân</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-base font-semibold mb-3">Tổng đài miễn cước</h3>
                        <ul className="space-y-2">
                            <li>Hỗ trợ đặt hàng: 1800 6821</li>
                            <li>Thông tin nhà thuốc: 1800 6821</li>
                            <li>Khiếu nại: 1800 6821</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-base font-semibold mb-3">Theo dõi chúng tôi</h3>
                        <ul className="space-y-2">
                            <li>Facebook</li>
                            <li>YouTube</li>
                            <li>Zalo</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t mt-8 pt-4 text-center text-xs text-gray-500">
                    <p className="mb-1">Công Ty Cổ Phần Dược Phẩm Pharmacity</p>
                    <p>Trụ sở: 248A Nơ Trang Long, P.12, Q. Bình Thạnh, TP.HCM</p>
                </div>
            </div>
        </footer>
    );
}
  