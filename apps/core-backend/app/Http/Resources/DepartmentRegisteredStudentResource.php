<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DepartmentRegisteredStudentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => data_get($this->resource, 'id'),
            'studentCode' => data_get($this->resource, 'studentCode'),
            'fullName' => data_get($this->resource, 'fullName'),
            'registeredAt' => data_get($this->resource, 'registeredAt'),
        ];
    }
}
