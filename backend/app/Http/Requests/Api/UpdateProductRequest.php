<?php

namespace App\Http\Requests\Api;

class UpdateProductRequest extends StoreProductRequest
{
    public function authorize(): bool
    {
        $product = $this->route('product');

        return $this->user() !== null
            && $product !== null
            && ($this->user()->role === 'ADMIN' || $this->user()->id === $product->seller_id);
    }

    public function rules(): array
    {
        $rules = parent::rules();
        foreach (['title', 'description', 'price', 'category_id', 'province', 'condition'] as $requiredField) {
            $rules[$requiredField][0] = 'sometimes';
        }

        return $rules;
    }
}
