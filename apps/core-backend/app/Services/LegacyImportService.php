<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class LegacyImportService
{
    private const LIMIT = 100;

    private function formatDoBPassword(?string $doB): string
    {
        if (empty($doB)) {
            return '1';
        }

        return str_replace('/', '', $doB);
    }

    private function fetchPaginatedData(string $endpoint): array
    {
        $page = 1;

        $allData = [];

        do {

            $response = Http::legacy()->get($endpoint, [
                'page' => $page,
                'limit' => self::LIMIT,
            ]);

            Log::info("Fetching data from legacy API: $endpoint, page: $page");

            if ($response->failed()) {
                break;
            }

            $result = $response->json();

            $data = $result['data'] ?? [];

            $allData = array_merge($allData, $data);

            $totalPages = $result['meta']['lastPage'] ?? 1;

            $page++;

        } while ($page <= $totalPages);

        return $allData;
    }

    public function importStudents(): void
    {
        $students = $this->fetchPaginatedData('/students');
        Log::info("Fetched " . count($students) . " students from legacy API.");

        foreach ($students as $student) {

            if (
                empty($student['id']) ||
                empty($student['studentCode'])
            ) {
                continue;
            }

            $user = User::firstOrNew([
                'username' => $student['studentCode']
            ]);

            $user->password_hash = $this->formatDoBPassword(
                $student['dateOfBirth'] ?? null
            );

            $user->role = UserRole::STUDENT;
            $user->student_id = $student['id'];

            $user->save();
        }
    }

    public function importLecturers(): void
    {
        $lecturers = $this->fetchPaginatedData('/lecturers');

        foreach ($lecturers as $lecturer) {

            if (
                empty($lecturer['id']) ||
                empty($lecturer['lecturerCode'])
            ) {
                continue;
            }

            $user = User::firstOrNew([
                'username' => $lecturer['lecturerCode']
            ]);

            $user->password_hash = $this->formatDoBPassword(
                $lecturer['dateOfBirth'] ?? null
            );

            $user->role = UserRole::LECTURER;
            $user->lecturer_id = $lecturer['id'];

            $user->save();
        }
    }

    public function importDepartments(): void
    {
        $departments = $this->fetchPaginatedData('/departments');

        foreach ($departments as $department) {

            if (empty($department['id'])) {
                continue;
            }

            $username = 'bm' . $department['id'];

            $user = User::firstOrNew([
                'username' => $username
            ]);

            $user->password_hash = '1';
            $user->role = UserRole::DEPARTMENT;
            $user->department_id = $department['id'];

            $user->save();
        }
    }

    // public function importAll(): void
    // {
    //     $this->importStudents();

    //     $this->importLecturers();

    //     $this->importDepartments();
    // }
}
