<?php

namespace App\Services\LegacyImport;

use App\Contracts\LegacyDataGateway;
use App\Enums\UserRole;

class LegacyDepartmentImportSource implements LegacyUserImportSource
{
    public function __construct(
        private LegacyDataGateway $legacyDataGateway
    ) {}

    public function role(): UserRole
    {
        return UserRole::DEPARTMENT;
    }

    public function legacyColumn(): string
    {
        return 'department_id';
    }

    public function records(): array
    {
        return array_map(static fn (array $department): array => [
            'legacyId' => (int) $department['legacy_id'],
            'username' => (string) $department['username'],
            'passwordSeed' => null,
        ], $this->legacyDataGateway->fetchAllDepartments());
    }
}
