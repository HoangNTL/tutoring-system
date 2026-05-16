<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

abstract class BaseFormRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->replace($this->convertKeysToSnakeCase($this->all()));
        $this->afterPrepareForValidation();
    }

    protected function afterPrepareForValidation(): void
    {
    }

    /**
     * @param  array<mixed>  $input
     * @return array<mixed>
     */
    private function convertKeysToSnakeCase(array $input): array
    {
        $normalized = [];

        foreach ($input as $key => $value) {
            $normalizedKey = is_string($key) ? Str::snake($key) : $key;
            $normalized[$normalizedKey] = is_array($value)
                ? $this->convertKeysToSnakeCase($value)
                : $value;
        }

        return $normalized;
    }
}
