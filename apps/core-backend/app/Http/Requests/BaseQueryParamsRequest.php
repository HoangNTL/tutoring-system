<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BaseQueryParamsRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'page'      => 'integer|min:1',
            'limit'     => 'integer|min:1|max:100',
            'sortBy'    => 'string|nullable',
            'sortOrder' => 'in:asc,desc|nullable',
            'search'    => 'string|nullable|max:255',
        ];
    }

    protected function prepareForValidation()
    {
        // Set default values for pagination and sorting
        $this->merge([
            'page'      => $this->has('page') ? (int) $this->page : 1,
            'limit'     => $this->has('limit') ? (int) $this->limit : 10,
            'sortOrder' => $this->sortOrder ?? 'asc',
            'sortBy'    => $this->sortBy ?? 'id',
        ]);
    }
}
