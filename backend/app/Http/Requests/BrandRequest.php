<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BrandRequest extends FormRequest
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
            'brand_name' => 'required|string|unique:brands,brand_name',
            'icon' => 'image|max:2048',
            'description'=>'',
            'active'=>''
        ];
    }
    public function messages()
    {
        return [
            'brand_name.required' => 'Tên thương hiệu là bắt buộc.',
            'brand_name.unique' => 'Tên thương hiệu đã tồn tại.',
            'icon.image' => 'Icon phải là một hình ảnh.',
            'icon.max' => 'Kích thước icon không được vượt quá 2MB.',
        ];
    }
    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        throw new \Illuminate\Http\Exceptions\HttpResponseException(
            response()->json([
                'status' => 'error',
                'message' => 'Validation failed.',
                'errors' => $validator->errors()
            ], 422)
        );
    }
}
