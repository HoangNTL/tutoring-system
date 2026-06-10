<?php

namespace App\Http\Requests\User;

use App\Enums\UserRole;
use App\Http\Requests\BaseQueryRequest;

class ListUsersRequest extends BaseQueryRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'search' => ['string', 'nullable', 'max:255'],
            'role' => [
                'string',
                'nullable',
                'in:' . implode(
                    ',',
                    array_map(
                        static fn (UserRole $role): string => $role->name,
                        UserRole::cases()
                    )
                ),
            ],
        ]);
    }

    /**
     * @return array<string, string>
     */
    protected function sortableFields(): array
    {
        return [
            'id' => 'id',
            'username' => 'username',
            'role' => 'role',
            'createdAt' => 'created_at',
        ];
    }

    protected function defaultSortBy(): string
    {
        return 'createdAt';
    }

    protected function defaultSortOrder(): string
    {
        return 'desc';
    }
}
