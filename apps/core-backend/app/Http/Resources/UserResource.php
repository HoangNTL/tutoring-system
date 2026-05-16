<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class UserResource extends BaseApiResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return $this->camelize([
            'id' => $this->id,
            'username' => $this->username,
            'role' => $this->role?->name,
        ]);
    }
}
