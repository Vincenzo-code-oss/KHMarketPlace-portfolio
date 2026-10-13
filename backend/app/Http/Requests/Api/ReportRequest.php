<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'target_type' => ['required', Rule::in(['product', 'user', 'review'])],
            'target_id' => ['required', 'integer', 'min:1'],
            'reason' => ['required', 'string', 'max:100'],
            'details' => ['nullable', 'string', 'max:3000'],
        ];
    }
}
