<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class BaseQueryRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'page' => ['integer', 'min:1'],
            'limit' => ['integer', 'min:1', 'max:100'],
            'sort_by' => ['string', 'nullable', Rule::in(array_keys($this->sortableFields()))],
            'sort_order' => ['string', 'nullable', Rule::in(['asc', 'desc'])],
            'sort_column' => ['string'],
            'search' => ['string', 'nullable', 'max:255'],
        ];
    }

    public function attributes(): array
    {
        return [
            'sort_by' => 'sortBy',
            'sort_order' => 'sortOrder',
        ];
    }

    protected function afterPrepareForValidation(): void
    {
        $defaultSortBy = $this->defaultSortBy();
        $sortBy = (string) $this->input('sort_by', $defaultSortBy);

        $this->merge([
            'page' => $this->has('page') ? (int) $this->input('page') : 1,
            'limit' => $this->has('limit') ? (int) $this->input('limit') : 10,
            'sort_order' => strtolower((string) $this->input('sort_order', $this->defaultSortOrder())),
            'sort_by' => $sortBy,
            'sort_column' => $this->resolveSortColumn($sortBy),
        ]);
    }

    /**
     * @return array<string, string>
     */
    protected function sortableFields(): array
    {
        return [
            'id' => 'id',
        ];
    }

    protected function defaultSortBy(): string
    {
        return 'id';
    }

    protected function defaultSortOrder(): string
    {
        return 'asc';
    }

    private function resolveSortColumn(string $sortBy): string
    {
        $sortableFields = $this->sortableFields();
        $defaultSortBy = $this->defaultSortBy();

        return $sortableFields[$sortBy]
            ?? $sortableFields[$defaultSortBy]
            ?? 'id';
    }
}
