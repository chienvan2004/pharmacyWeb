<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
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
        // Lấy ID của sản phẩm từ route
        $id = $this->route('product');

        return [
            'product_name' => [
                'sometimes',
                'string',
                Rule::unique('products', 'product_name')->ignore($id, 'id'),
            ],
            'buying_price' => 'sometimes|numeric|min:0',
            'short_description' => 'nullable|string|max:255',
            'product_description' => 'nullable|string',
            'active' => 'nullable|boolean',
            'disable_out_of_stock' => 'nullable|boolean',
            'unit_id' => 'sometimes|exists:units,id',

            'images' => 'sometimes|array|min:1',
            'images.*.is_main' => 'boolean',

            'categories' => 'required|array',
            'categories.*' => 'exists:categories,id',

            'brands' => 'required|array',
            'brands.*' => 'exists:brands,id',

            'tags' => 'sometimes|array',
            'tags.*' => 'exists:tags,id',
        ];
    }

    /**
     * Custom error messages for validation.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'product_name.string' => 'Tên sản phẩm phải là chuỗi.',
            'product_name.unique' => 'Tên sản phẩm đã tồn tại.',
            'buying_price.numeric' => 'Giá bán phải là số.',
            'buying_price.min' => 'Giá bán phải lớn hơn hoặc bằng 0.',
            'short_description.string' => 'Mô tả ngắn phải là chuỗi.',
            'short_description.max' => 'Mô tả ngắn tối đa 255 ký tự.',
            'product_description.string' => 'Mô tả chi tiết phải là chuỗi.',
            'unit_id.exists' => 'Đơn vị tính không tồn tại.',

            'categories.required' => 'Vui lòng chọn ít nhất một danh mục.',
            'categories.array' => 'Trường danh mục phải là một mảng.',
            'categories.*.exists' => 'Danh mục đã chọn không tồn tại',

            'brands.required' => 'Vui lòng chọn ít nhất một thương hiệu.',
            'brands.array' => 'Trường thương hiệu phải là một mảng.',
            'brands.*.exists' => 'Thương hiệu đã chọn không tồn tại',

            'tags.array' => 'Thẻ phải là một mảng.',
            'tags.*.exists' => 'Thẻ đã chọn không tồn tại.',
        ];
    }

    /**
     * Handle a failed validation attempt.
     *
     * @param \Illuminate\Contracts\Validation\Validator $validator
     * @return void
     */
    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        throw new \Illuminate\Http\Exceptions\HttpResponseException(
            response()->json([
                'status' => 'error',
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $validator->errors(),
            ], 422)
        );
    }
}
