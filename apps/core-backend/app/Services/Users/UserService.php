<?php

namespace App\Services\Users;

use App\Enums\UserRole;
use App\Models\User;
use App\Services\Support\AbstractPaginatedQueryService;
use Illuminate\Database\Eloquent\Builder;

class UserService extends AbstractPaginatedQueryService
{
    protected function newQuery(): Builder
    {
        return User::query();
    }

    protected function allowedSortColumns(): array
    {
        return ['id', 'username', 'role', 'created_at'];
    }

    protected function defaultSortBy(): string
    {
        return 'created_at';
    }

    protected function defaultSortOrder(): string
    {
        return 'desc';
    }

    protected function applySearch(Builder $query, string $search): void
    {
        $query->where('username', 'like', '%' . $search . '%');
    }

    protected function applyFilters(Builder $query, array $filters): void
    {
        $role = $this->resolveRoleFilter($filters['role'] ?? null);

        if ($role === null) {
            return;
        }

        match ($role) {
            UserRole::ADMIN->name => $query->where('role', UserRole::ADMIN->value),
            UserRole::DEPARTMENT->name => $query->where('role', UserRole::DEPARTMENT->value),
            UserRole::LECTURER->name => $query->where('role', UserRole::LECTURER->value),
            UserRole::STUDENT->name => $query->where('role', UserRole::STUDENT->value),
            default => null,
        };
    }

    private function resolveRoleFilter(?string $role): ?string
    {
        $role = strtoupper(trim((string) $role));

        return $role === '' ? null : $role;
    }
}
