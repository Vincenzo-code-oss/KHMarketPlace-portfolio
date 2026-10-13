<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class SendMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'receiver_id' => ['required', 'integer', 'exists:users,id', 'different:sender_id'],
            'content' => ['required', 'string', 'max:5000'],
            'product_id' => ['nullable', 'integer', 'exists:products,id'],
        ];
    }
}
