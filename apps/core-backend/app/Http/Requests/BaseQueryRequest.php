<?php

namespace App\Http\Requests;

class BaseQueryRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'page' => ['integer', 'min:1'],
            'limit' => ['integer', 'min:1', 'max:100'],
            'sort_by' => ['string', 'nullable'],
            'sort_order' => ['in:asc,desc', 'nullable'],
            'search' => ['string', 'nullable', 'max:255'],
        ];
    }

    protected function afterPrepareForValidation(): void
    {
        $this->merge([
            'page' => $this->has('page') ? (int) $this->input('page') : 1,
            'limit' => $this->has('limit') ? (int) $this->input('limit') : 10,
            'sort_order' => $this->input('sort_order', 'asc'),
            'sort_by' => $this->input('sort_by', 'id'),
        ]);
    }
}
