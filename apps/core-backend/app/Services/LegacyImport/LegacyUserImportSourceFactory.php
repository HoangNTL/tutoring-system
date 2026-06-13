<?php

namespace App\Services\LegacyImport;

use App\Contracts\LegacyDataGateway;
use App\Enums\UserRole;
use InvalidArgumentException;

class LegacyUserImportSourceFactory
{
    public function __construct(
        private LegacyDataGateway $legacyDataGateway
    ) {}

    public function make(UserRole $role): LegacyUserImportSource
    {
        return match ($role) {
            UserRole::STUDENT => new LegacyStudentImportSource($this->legacyDataGateway),
            UserRole::LECTURER => new LegacyLecturerImportSource($this->legacyDataGateway),
            UserRole::DEPARTMENT => new LegacyDepartmentImportSource($this->legacyDataGateway),
            default => throw new InvalidArgumentException("Legacy import source is not defined for role [{$role->name}]."),
        };
    }
}
