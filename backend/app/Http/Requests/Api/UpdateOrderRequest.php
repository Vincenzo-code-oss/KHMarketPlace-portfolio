<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED'])],
        ];
    }
}
