<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null
            && ($this->user()->hasActivePremium() || $this->user()->role === 'ADMIN');
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:3', 'max:160'],
            'description' => ['required', 'string', 'min:10', 'max:10000'],
            'price' => ['required', 'numeric', 'gt:0', 'max:9999999999'],
            'currency' => ['sometimes', Rule::in(['USD', 'KHR'])],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'province' => ['required', 'string', 'min:2', 'max:100'],
            'district' => ['nullable', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:40'],
            'condition' => ['required', Rule::in(['New', 'Like New', 'Good', 'Used', 'For Parts'])],
            'images' => ['sometimes', 'array', 'max:3'],
            'images.*' => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return ['images.*.max' => 'Each product image must be no larger than 2 MB.'];
    }
}
