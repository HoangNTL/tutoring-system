<?php

namespace App\Services\Users;

use App\Enums\UserRole;
use App\Models\User;
use App\Traits\PaginationHelper;
use Illuminate\Database\Eloquent\Builder;

class UserService
{
    use PaginationHelper;

    public function getAll(array $filters): array
    {
        $sortBy = $this->resolveSortBy($filters['sort_column'] ?? null);
        $sortOrder = $this->resolveSortOrder($filters['sort_order'] ?? null);
        $page = max((int) ($filters['page'] ?? 1), 1);
        $limit = max((int) ($filters['limit'] ?? 10), 1);
        $search = trim((string) ($filters['search'] ?? ''));
        $role = $this->resolveRoleFilter($filters['role'] ?? null);

        $query = User::query()
            ->orderBy($sortBy, $sortOrder);

        if ($search !== '') {
            $query->where('username', 'like', '%' . $search . '%');
        }

        if ($role !== null) {
            $this->applyRoleFilter($query, $role);
        }

        $paginator = $query->paginate(
            $limit,
            ['*'],
            'page',
            $page
        );

        return $this->formatPaginator($paginator);
    }

    private function resolveSortBy(?string $sortBy): string
    {
        return in_array($sortBy, ['id', 'username', 'role', 'created_at'], true)
            ? $sortBy
            : 'created_at';
    }

    private function resolveSortOrder(?string $sortOrder): string
    {
        $normalizedSortOrder = strtolower((string) $sortOrder);

        return in_array($normalizedSortOrder, ['asc', 'desc'], true)
            ? $normalizedSortOrder
            : 'desc';
    }

    private function resolveRoleFilter(?string $role): ?string
    {
        $role = strtoupper(trim((string) $role));

        if ($role === '') {
            return null;
        }

        return $role;
    }

    private function applyRoleFilter(Builder $query, string $role): void
    {
        match ($role) {
            UserRole::ADMIN->name => $query->where('role', UserRole::ADMIN->value),
            UserRole::DEPARTMENT->name => $query->where('role', UserRole::DEPARTMENT->value),
            UserRole::LECTURER->name => $query->where('role', UserRole::LECTURER->value),
            UserRole::STUDENT->name => $query->where('role', UserRole::STUDENT->value),
            default => null,
        };
    }

    public function updatePassword(int $userId, string $password): void
    {
        $user = User::findOrFail($userId);
        $user->update([
            'password_hash' => $password,
        ]);
    }
}
