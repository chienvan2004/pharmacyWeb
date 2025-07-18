import ChartComponent from './components/ChartComponent';
import LowStockAlert from './components/getLowStockProducts';
import OrderItemChart from './components/OrderItemChart';

export default function DashboardPage() {
    return (
        <main className="min-h-screen py-10 px-4 ">
            <div className="max-w-7xl mx-auto">
                

                {/* Hai biểu đồ nằm cùng một hàng */}
                <section className="grid grid-cols-2 lg:grid-cols-2 gap-4">
                    <OrderItemChart />
                    <ChartComponent />
                </section>
                {/* Cảnh báo tồn kho */}
                <section className="mt-10" >
                    <LowStockAlert />
                </section>
            </div>
        </main>
    );
}
