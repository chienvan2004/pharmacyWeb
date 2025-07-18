import { PostDetail } from "./PostDetail";

export const metadata = {
    title: 'Chi tiết bài viết',
    icons: {
        icon: '/logo.jpg', // hoặc .svg, .ico tùy ý
    },
  };
export default function Page({ params }: { params: { id: string } }) {
    const id = parseInt(params.id);

    return <PostDetail id={id} />; // Truyền id thay vì postData
}