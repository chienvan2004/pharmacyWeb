<?php

namespace App\Http\Controllers;

use App\Models\UserAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UserAddressController extends Controller
{


    public function destroy(Request $request, $id)
    {
        try {
            $request->validate(['user_id' => 'required|integer|exists:users,id']);
            $address = UserAddress::where('user_id', $request->user_id)
                ->where('id', $id)
                ->firstOrFail();

            $address->delete();

            return response()->json(['message' => 'Address deleted successfully'], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Address not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error deleting address'], 500);
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'address' => 'required|string',
            'dial_code' => 'string|max:100',
            'postal_code' => 'nullable|string|max:255',
            'address_default' => 'boolean',
            'city' => 'string'
        ]);

        $addressData = [
            'user_id' => $request->user_id,
            'address' => $request->address,
            'dial_code' => $request->dial_code,
            'country' => 'Vietnam',
            'city' => $request->city,
            'postal_code' => $request->postal_code,
            'address_default' => $request->address_default ?? 0,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        if ($request->address_default) {
            // Đặt tất cả địa chỉ khác của user thành false
            UserAddress::where('user_id', $request->user_id)->update(['address_default' => false]);
        }

        $address = UserAddress::create($addressData);

        return response()->json([
            'message' => 'Address added successfully',
            'address' => $address,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'id' => 'required|integer|exists:user_addresses,id',
            'user_id' => 'required|integer|exists:users,id',
            'address' => 'required|string',
            'dial_code' => 'string|max:100',
            'postal_code' => 'nullable|string|max:255',
            'address_default' => 'boolean',
            'city' => 'string'
        ]);

        $address = UserAddress::findOrFail($id);

        $addressData = [
            'user_id' => $request->user_id,
            'address' => $request->address,
            'dial_code' => $request->dial_code,
            'country' => 'Vietnam',
            'city' => $request->city,
            'postal_code' => $request->postal_code,
            'address_default' => $request->address_default ?? 0,
            'updated_at' => now(),
        ];

        if ($request->address_default) {
            // Đặt tất cả địa chỉ khác của user thành false
            UserAddress::where('user_id', $request->user_id)
                ->where('id', '!=', $id)
                ->update(['address_default' => false]);
        }

        $address->update($addressData);

        return response()->json([
            'message' => 'Address updated successfully',
            'address' => $address,
        ], 200);
    }
}
