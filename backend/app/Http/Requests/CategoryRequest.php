<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class CategoryRequest extends FormRequest
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
            'category_name' => 'required|max:255|unique:categories',
            'parent_id' => 'nullable|exists:categories,id',
            'icon' => 'nullable|max:2048',
            'description' => '',
            'active' => '',
            'sort_order'=>'',
        ];
    }

    public function messages()
    {
        return [
            'category_name.required' => 'Tên danh mục là bắt buộc.',
            'category_name.max'=>'tên danh mục không được quá 255 kí tự',
            'category_name.unique' => 'tên danh mục đã tồn tại',
            'parent_id.exists' => 'Danh mục cha không tồn tại.',
        ];
    }
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'status' => 'error',
            'message' => 'Validation errors',
            'errors' => $validator->errors()
        ], 422));
    }
}
