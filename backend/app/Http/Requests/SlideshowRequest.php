<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SlideshowRequest extends FormRequest
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
            'image' => 'required|max:2048',
            'link' => 'nullable|string|max:50',
            'active' => 'boolean',
            'clicks' => 'integer|min:0',
        ];
    }
    public function messages(): array
    {
        return [
            'image.required' => 'Vui lòng chọn hình ảnh.',
            'image.max' => 'Kích thước ảnh tối đa là 2MB.',
            'link.max' => 'Liên kết không được vượt quá 50 ký tự.',
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
