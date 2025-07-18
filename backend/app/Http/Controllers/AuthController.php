<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    // Đăng ký
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|unique:users',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $accessToken = $user->createToken('AccessToken')->accessToken;

        return response()->json([
            'accessToken' => $accessToken,
            'role_id' => $user->role_id
        ]);
    }
    // Đăng nhập
    public function loginAdmin(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Sai thông tin đăng nhập'], 401);
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($user->role_id == 0) {
            Auth::logout(); 
            return response()->json(['message' => 'Tài khoản của bạn không được phép đăng nhập'], 403);
        }

        $accessToken = $user->createToken('AccessToken')->accessToken;

        return response()->json([
            'accessToken' => $accessToken,
            'role_id' => $user->role_id

        ]);
    }


    // Đăng nhập
    public function loginClient(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Sai thông tin đăng nhập'], 401);
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $accessToken = $user->createToken('AccessToken')->accessToken;

        return response()->json([
            'accessToken' => $accessToken,
            'role_id' => $user->role_id
        ]);
    }

    // Lấy thông tin tài khoản
    public function profile(Request $request)
    {
        $user = $request->user()->load('addresses');

        return response()->json($user);
    }

    // Đăng xuất
    public function logout(Request $request)
    {
        $request->user()->token()->revoke();

        return response()->json([
            'message' => 'Đăng xuất thành công',
        ]);
    }

    // Cập nhật thông tin tài khoản
    public function updateProfile(Request $request)
    {
        $user = $request->user(); // Lấy người dùng hiện tại từ token

        $validator = Validator::make($request->all(), [
            'name'         => 'sometimes|string|max:255',
            'email'        => 'sometimes|string|email|unique:users,email,' . $user->id,
            'phone_number' => 'sometimes|string|max:15',
            'avatar'       => 'sometimes|image|max:2048', // Kích thước tối đa 2MB
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $request->only(['name', 'email', 'phone_number']);
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        // Xử lý upload avatar nếu có
        if ($request->hasFile('avatar')) {
            // Xóa avatar cũ nếu tồn tại
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $data['avatar'] = $avatarPath;
        }

        $user->update($data);

        return response()->json([
            'message' => 'Cập nhật thông tin thành công',
            'user' => $user->fresh(),
        ]);
    }

    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'old_password' => 'required|string',
            'new_password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = $request->user();
        if (!Hash::check($request->old_password, $user->password)) {
            return response()->json(['message' => 'Mật khẩu cũ không đúng'], 401);
        }

        $user->update(['password' => Hash::make($request->new_password)]);
        return response()->json(['message' => 'Đổi mật khẩu thành công']);
    }
}
