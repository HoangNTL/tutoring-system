<?php

namespace App\Services\LegacyImport;

use App\Contracts\LegacyDataGateway;
use App\Enums\UserRole;

class LegacyLecturerImportSource implements LegacyUserImportSource
{
    public function __construct(
        private LegacyDataGateway $legacyDataGateway
    ) {}

    public function role(): UserRole
    {
        return UserRole::LECTURER;
    }

    public function legacyColumn(): string
    {
        return 'lecturer_id';
    }

    public function records(): array
    {
        return array_map(static fn (array $lecturer): array => [
            'legacyId' => (int) $lecturer['legacy_id'],
            'username' => (string) $lecturer['username'],
            'passwordSeed' => $lecturer['date_of_birth'] ?? null,
        ], $this->legacyDataGateway->fetchAllLecturers());
    }
}
