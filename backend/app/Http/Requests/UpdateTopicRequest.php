<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateTopicRequest extends FormRequest
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
            'topic_name' => [
                'required',
                'string',
                Rule::unique('topics', 'topic_name')->ignore($this->route('topic')),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'topic_name.required' => 'Tên chủ đề là bắt buộc.',
            'topic_name.string' => 'Tên chủ đề phải là chuỗi.',
            'topic_name.max' => 'Tên chủ đề không được vượt quá 255 ký tự.',
            'topic_name.unique' => 'Tên chủ đề đã tồn tại.',
        ];
    }
    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'status' => 'error',
                'message' => 'Validation failed.',
                'errors' => $validator->errors()
            ], 422)
        );
    }
}
