<?php

namespace App\Http\Requests;

use Illuminate\Container\Attributes\Log;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBrandRequest extends FormRequest
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
        $id = $this->route('brand');
        return [
            'brand_name' => [
                'string',
                Rule::unique('brands', 'brand_name')->ignore($this->route('brand')),
            ],
            'icon' => 'nullable|max:2048',
            'description'=> 'nullable',
            'active' => ''
        ];
    } 
    public function messages()
    {
        return [
            'brand_name.unique'=>'tên thương hiệu đã tồn tại',
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
