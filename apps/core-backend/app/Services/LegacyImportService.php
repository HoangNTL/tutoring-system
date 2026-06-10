<?php

namespace App\Services;

use App\Contracts\Legacy\LegacyApiClient;
use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class LegacyImportService
{
    public function __construct(
        private LegacyApiClient $legacyApiService
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
        $students = $this->legacyApiService->fetchAllStudents();
        Log::info("Fetched " . count($students) . " students from legacy API.");

        foreach ($students as $student) {
            $user = User::firstOrNew([
                'username' => $student['username']
            ]);

            $this->synchronizeImportedUser(
                $user,
                UserRole::STUDENT,
                'student_id',
                $student['legacy_id'],
                $this->formatDevPassword($student['date_of_birth'] ?? null)
            );
        }
    }

    public function importLecturers(): void
    {
        $lecturers = $this->legacyApiService->fetchAllLecturers();

        foreach ($lecturers as $lecturer) {
            $user = User::firstOrNew([
                'username' => $lecturer['username']
            ]);

            $this->synchronizeImportedUser(
                $user,
                UserRole::LECTURER,
                'lecturer_id',
                $lecturer['legacy_id'],
                $this->formatDevPassword($lecturer['date_of_birth'] ?? null)
            );
        }
    }

    public function importDepartments(): void
    {
        $departments = $this->legacyApiService->fetchAllDepartments();

        foreach ($departments as $department) {
            $user = User::firstOrNew([
                'username' => $department['username']
            ]);

            $this->synchronizeImportedUser(
                $user,
                UserRole::DEPARTMENT,
                'department_id',
                $department['legacy_id'],
                $this->formatDevPassword(null)
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
