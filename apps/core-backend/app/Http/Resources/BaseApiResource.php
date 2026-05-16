<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

abstract class BaseApiResource extends JsonResource
{
    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected function camelize(array $data): array
    {
        $result = [];

        foreach ($data as $key => $value) {
            $result[Str::camel((string) $key)] = $this->camelizeValue($value);
        }

        return $result;
    }

    protected function camelizeValue(mixed $value): mixed
    {
        if (!is_array($value)) {
            return $value;
        }

        if ($this->isList($value)) {
            return array_map(fn(mixed $item) => $this->camelizeValue($item), $value);
        }

        return $this->camelize($value);
    }

    /**
     * @param  array<mixed>  $value
     */
    private function isList(array $value): bool
    {
        return array_is_list($value);
    }
}
