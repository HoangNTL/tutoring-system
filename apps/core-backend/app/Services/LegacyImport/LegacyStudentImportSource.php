<?php

namespace App\Services\LegacyImport;

use App\Contracts\LegacyDataGateway;
use App\Enums\UserRole;

class LegacyStudentImportSource implements LegacyUserImportSource
{
    public function __construct(
        private LegacyDataGateway $legacyDataGateway
    ) {}

    public function role(): UserRole
    {
        return UserRole::STUDENT;
    }

    public function legacyColumn(): string
    {
        return 'student_id';
    }

    public function records(): array
    {
        return array_map(static fn (array $student): array => [
            'legacyId' => (int) $student['legacy_id'],
            'username' => (string) $student['username'],
            'passwordSeed' => $student['date_of_birth'] ?? null,
        ], $this->legacyDataGateway->fetchAllStudents());
    }
}
