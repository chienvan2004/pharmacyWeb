<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class CouponRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'code' => 'required|string|max:50|unique:coupons,code',
            'discount_value' => 'required|numeric|min:0',
            'discount_type' => 'required|in:percent,vnd,shipping',
            'max_usage' => 'nullable|numeric|min:0',
            'order_amount_limit' => 'nullable|numeric|min:0',
            'coupon_start_date' => 'nullable|date',
            'coupon_end_date' => 'nullable|date|after_or_equal:coupon_start_date',
            'products' => 'nullable|array', // Mảng các ID sản phẩm
            'products.*' => 'exists:products,id', // Kiểm tra từng ID có tồn tại trong bảng products
        ];
    }
    public function messages(): array
    {
        return [
            'code.required' => 'Mã coupon là bắt buộc.',
            'code.string' => 'Mã coupon phải là chuỗi.',
            'code.max' => 'Mã coupon không được vượt quá 50 ký tự.',
            'code.unique' => 'Mã coupon đã tồn tại.',
            'discount_value.required' => 'Giá trị giảm là bắt buộc.',
            'discount_value.numeric' => 'Giá trị giảm phải là số.',
            'discount_value.min' => 'Giá trị giảm không được nhỏ hơn 0.',
            'discount_type.required' => 'Loại giảm là bắt buộc.',
            'discount_type.in' => 'Loại giảm phải là percent, vnd hoặc shipping.',
            'max_usage.numeric' => 'Số lần tối đa sử dụng phải là số.',
            'max_usage.min' => 'Số lần tối đa sử dụng không được nhỏ hơn 0.',
            'order_amount_limit.numeric' => 'Giới hạn số tiền đơn hàng phải là số.',
            'order_amount_limit.min' => 'Giới hạn số tiền đơn hàng không được nhỏ hơn 0.',
            'coupon_start_date.date' => 'Ngày bắt đầu phải là ngày hợp lệ.',
            'coupon_end_date.date' => 'Ngày kết thúc phải là ngày hợp lệ.',
            'coupon_end_date.after_or_equal' => 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.',
            'products.array' => 'Danh sách sản phẩm phải là mảng.',
            'products.*.exists' => 'Sản phẩm không tồn tại.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'status' => 'error',
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422)
        );
    }
}
