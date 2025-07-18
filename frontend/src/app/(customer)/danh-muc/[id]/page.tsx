import CategoryPage from "./pageClient";
export const metadata = {
    title: 'Danh mục sản phẩm',
    icons: {
        icon: '/logo.jpg',
    },
};
export default function page() {
    return (
        <div>
            <CategoryPage />
        </div>
    )
}
