<?php

namespace App\Services;

use App\Services\LegacyImport\LegacyUserImportSourceFactory;
use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class LegacyImportService
{
    public function __construct(
        private LegacyUserImportSourceFactory $sourceFactory
    ) {}

    private function formatDevPassword(?string $dateOfBirth): string
    {
        // DEV ONLY: using simple predictable password.
        // TODO: replace with secure password handling in production.
        if (empty($dateOfBirth)) {
            return '1';
        }

        return str_replace('/', '', $dateOfBirth);
    }

    public function importStudents(): void
    {
        $this->importRole(UserRole::STUDENT);
    }

    public function importLecturers(): void
    {
        $this->importRole(UserRole::LECTURER);
    }

    public function importDepartments(): void
    {
        $this->importRole(UserRole::DEPARTMENT);
    }

    public function importRole(UserRole $role): void
    {
        $source = $this->sourceFactory->make($role);
        $records = $source->records();

        Log::info(sprintf(
            'Fetched %d %s from legacy API.',
            count($records),
            strtolower($role->name)
        ));

        foreach ($records as $record) {
            $user = User::firstOrNew([
                'username' => $record['username'],
            ]);

            $this->synchronizeImportedUser(
                $user,
                $source->role(),
                $source->legacyColumn(),
                $record['legacyId'],
                $this->formatDevPassword($record['passwordSeed'])
            );
        }
    }

    private function synchronizeImportedUser(
        User $user,
        UserRole $role,
        string $legacyColumn,
        int $legacyId,
        string $password
    ): void {
        // DEV ONLY: using simple predictable password.
        // TODO: replace with secure password generation and reset flow in production.
        $user->password_hash = $password;
        $user->role = $role;
        $user->{$legacyColumn} = $legacyId;
        $user->save();
    }
}
