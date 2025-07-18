import MedicineCart from "./pageClient";

export const metadata = {
    title: 'Giỏ thuốc',
    icons: {
        icon: '/logo.jpg', // hoặc .svg, .ico tùy ý
    },
};
export default function page() {
    return (
        <div>
        <MedicineCart/>
        </div>
    )
}
