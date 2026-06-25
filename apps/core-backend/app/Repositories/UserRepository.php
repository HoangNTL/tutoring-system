<?php

namespace App\Repositories;

use App\Models\User;
use App\Contracts\LegacyDataGateway;
use App\Enums\UserRole;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class UserRepository
{
    public function __construct(
        private LegacyDataGateway $legacyGateway
    ) {}

    public function searchAndPaginate(array $filters): LengthAwarePaginator
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
            $matchingDepartmentIds = [];
            $matchingLecturerIds = [];
            try {
                $departments = $this->legacyGateway->fetchAllDepartments();
                $matchingDepartmentIds = collect($departments)
                    ->filter(function ($dept) use ($search) {
                        $name = $dept['name'] ?? '';
                        return str_contains(
                            mb_strtolower($name, 'UTF-8'),
                            mb_strtolower($search, 'UTF-8')
                        );
                    })
                    ->pluck('legacy_id')
                    ->all();

                $lecturers = $this->legacyGateway->fetchAllLecturers();
                $matchingLecturerIds = collect($lecturers)
                    ->filter(function ($lec) use ($search) {
                        $fullName = $lec['full_name'] ?? '';
                        return str_contains(
                            mb_strtolower($fullName, 'UTF-8'),
                            mb_strtolower($search, 'UTF-8')
                        );
                    })
                    ->pluck('legacy_id')
                    ->all();
            } catch (\Throwable $e) {
                // Ignore gateway failures gracefully
            }

            $query->where(function ($q) use ($search, $matchingDepartmentIds, $matchingLecturerIds) {
                $q->where('username', 'like', '%' . $search . '%');
                if (!empty($matchingDepartmentIds)) {
                    $q->orWhereIn('department_id', $matchingDepartmentIds);
                }
                if (!empty($matchingLecturerIds)) {
                    $q->orWhereIn('lecturer_id', $matchingLecturerIds);
                }
            });
        }

        if ($role !== null) {
            $this->applyRoleFilter($query, $role);
        }

        return $query->paginate(
            $limit,
            ['*'],
            'page',
            $page
        );
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
}
