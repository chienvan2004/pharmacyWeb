import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    console.log('Middleware đang chạy cho:', request.nextUrl.pathname);

    // Bỏ qua middleware cho các đường dẫn công khai
    const excludedPaths = ['/admin/login', '/admin/register', '/dang-nhap'];
    if (excludedPaths.includes(request.nextUrl.pathname)) {
        console.log(`Bỏ qua middleware cho ${request.nextUrl.pathname}`);
        return NextResponse.next();
    }

    // Kiểm tra route admin
    if (request.nextUrl.pathname.startsWith('/admin')) {
        const role_id = request.cookies.get('role_id')?.value;
        if (role_id === '0' || !role_id) {
            console.log('Chuyển hướng đến /admin/login vì role_id không tồn tại hoặc bằng 0');
            const loginUrl = new URL('/admin/login', request.nextUrl.origin);
            const response = NextResponse.redirect(loginUrl);
            response.cookies.set('token', '', { maxAge: 0, path: '/' });
            response.cookies.set('role_id', '', { maxAge: 0, path: '/' });
            return response;
        }

        const token = request.cookies.get('token')?.value;
        if (!token) {
            console.log('Chuyển hướng đến /admin/login vì không có token');
            const loginUrl = new URL('/admin/login', request.nextUrl.origin);
            const response = NextResponse.redirect(loginUrl);
            response.cookies.set('role_id', '', { maxAge: 0, path: '/' });
            return response;
        }

        console.log('Tiếp tục request admin với token:', token, 'và role_id:', role_id);
        return NextResponse.next();
    }

    // Kiểm tra route tai-khoan và gio-thuoc (client)
    if (request.nextUrl.pathname.startsWith('/tai-khoan') || request.nextUrl.pathname === '/gio-thuoc') {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            console.log('Chuyển hướng đến /dang-nhap vì không có token');
            const loginUrl = new URL('/dang-nhap', request.nextUrl.origin);
            loginUrl.searchParams.set('redirect', request.nextUrl.pathname); // Lưu đường dẫn để quay lại sau đăng nhập
            return NextResponse.redirect(loginUrl);
        }

        console.log('Tiếp tục request với token:', token);
        return NextResponse.next();
    }

    // Tiếp tục cho các route khác
    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/tai-khoan/:path*', '/gio-thuoc'], // Áp dụng middleware cho các route này
};