<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
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
            'product_name' => 'required|string|max:255|unique:products,product_name',
            'buying_price' => 'required|nullable|numeric|min:0',
            'short_description' => 'nullable',
            'product_description' => 'nullable',
            'active' => 'boolean',
            'disable_out_of_stock' => 'boolean',
            'unit_id' => 'required|exists:units,id',

            'images' => 'required',

            'categories' => 'required|array',
            'categories.*' => 'exists:categories,id',

            'brands' => 'required|array',
            'brands.*' => 'exists:brands,id',

            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
        ];
    }
    public function messages(): array
    {
        return [
            'product_name.required' => 'Tên sản phẩm là bắt buộc.',
            'product_name.string' => 'Tên sản phẩm phải là chuỗi.',
            'product_name.max' => 'Tên sản phẩm không được vượt quá 255 ký tự.',
            'product_name.unique' => 'Tên sản phẩm đã tồn tại.',

            'buying_price.numeric' => 'Giá phải là số.',
            'buying_price.min' => 'Giá nhập không được nhỏ hơn 0.',
            'buying_price.required' => 'Giá là bắt buộc.',

            'short_description.string' => 'Mô tả ngắn phải là chuỗi.',

            'active.boolean' => 'Trạng thái hoạt động phải là true hoặc false.',
            'disable_out_of_stock.boolean' => 'Trạng thái hết hàng phải là true hoặc false.',

            'unit_id.exists' => 'Đơn vị tính không hợp lệ.',
            'unit_id.required' => '1 sản phẩm phải thuộc 1 đơn vị.',    

            'images.required' => 'Vui lòng tải lên ít nhất một hình ảnh.',

            'categories.required' => 'Vui lòng chọn ít nhất một danh mục.',
            'categories.array' => 'Trường danh mục phải là một mảng.',
            'categories.*.exists' => 'Danh mục đã chọn không tồn tại',

            'brands.required' => 'Vui lòng chọn ít nhất một thương hiệu.',
            'brands.array' => 'Trường thương hiệu phải là một mảng.',
            'brands.*.exists' => 'Thương hiệu đã chọn không tồn tại',

            'tags.array' => 'Trường thẻ phải là một mảng.',
            'tags.*.exists' => 'thẻ đã chọn không tồn tại',

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
