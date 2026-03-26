import CategoryIcons from '../component/CategoryIcons';
import PostList from '../component/PostList';
import ProductBestsaler from '../component/ProductBestsaler';
import ProductSale from '../component/ProductSale';
import ProductTag from '../component/ProductTag';
import PromoBanner from '../component/PromoBanner';

export const metadata = {
  title: 'Nhà thuốc pharmary.com',
  description: 'Chào mừng bạn đến với Nhà thuốc ABC - Sản phẩm uy tín, chất lượng.',
  icons: {
    icon: '/logo.jpg', 
  },
};

export default async function Home() {

  return (
    <div className="font-sans text-gray-800 z-0">
      <div className="bg-white">
        <PromoBanner />
        <CategoryIcons />
      </div>
      <ProductSale />
      <ProductBestsaler />
      <PostList />
      <ProductTag />
    </div>
  );
}