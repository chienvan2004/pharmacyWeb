<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdatePostRequest extends FormRequest
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
        $postId = $this->route('post');

        return [
            'title' => 'required|string|max:255' . $postId,
            'topic_id' => 'required|exists:topics,id',
            'content' => 'required|string',
            'image' => 'nullable|image|max:2048',
            'type' => 'required|in:post,page',
            'active' => 'boolean',
        ];
    }
    public function messages(): array
    {
        return [
            'title.required' => 'Tiêu đề là bắt buộc.',
            'title.string' => 'Tiêu đề phải là chuỗi.',
            'title.max' => 'Tiêu đề không được vượt quá 255 ký tự.',
            'topic_id.required' => 'Chủ đề là bắt buộc.',
            'topic_id.exists' => 'Chủ đề không tồn tại.',
            'content.required' => 'Nội dung là bắt buộc.',
            'content.string' => 'Nội dung phải là chuỗi.',
            'image.image' => 'Tệp phải là hình ảnh.',
            'image.max' => 'Hình ảnh không được vượt quá 2MB.',
            'type.required' => 'Loại bài viết là bắt buộc.',
            'type.in' => 'Loại bài viết phải là post hoặc page.',
            'active.boolean' => 'Trạng thái phải là boolean.',
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
