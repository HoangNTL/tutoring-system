<?php

namespace Tests\Feature\LegacyImport;

use App\Contracts\LegacyDataGateway;
use App\Enums\UserRole;
use App\Models\User;
use App\Services\LegacyImportService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LegacyImportServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_import_students_uses_student_import_source_mapping(): void
    {
        $this->app->instance(LegacyDataGateway::class, new class implements LegacyDataGateway
        {
            public function fetchLegacyPeriods(): array
            {
                return [];
            }

            public function fetchStudentCoursesByLegacyStudentId(int $studentId, int $periodId): array
            {
                return [];
            }

            public function fetchStudentCoursesByStudentCode(string $studentCode, int $periodId): array
            {
                return [];
            }

            public function fetchStudentInfoByLegacyStudentId(int $studentId): ?array
            {
                return null;
            }

            public function fetchStudentInfoByStudentCode(string $studentCode): ?array
            {
                return null;
            }

            public function fetchAllStudents(): array
            {
                return [[
                    'legacy_id' => 101,
                    'username' => 'sv001',
                    'date_of_birth' => '01/02/2000',
                ]];
            }

            public function fetchAllLecturers(): array
            {
                return [];
            }

            public function fetchAllDepartments(): array
            {
                return [];
            }
        });

        app(LegacyImportService::class)->importStudents();

        $this->assertDatabaseHas('users', [
            'username' => 'sv001',
            'role' => UserRole::STUDENT->value,
            'student_id' => 101,
        ]);

        $user = User::where('username', 'sv001')->firstOrFail();
        $this->assertTrue(password_verify('01022000', $user->password_hash));
    }

    public function test_import_departments_uses_department_import_source_mapping(): void
    {
        $this->app->instance(LegacyDataGateway::class, new class implements LegacyDataGateway
        {
            public function fetchLegacyPeriods(): array
            {
                return [];
            }

            public function fetchStudentCoursesByLegacyStudentId(int $studentId, int $periodId): array
            {
                return [];
            }

            public function fetchStudentCoursesByStudentCode(string $studentCode, int $periodId): array
            {
                return [];
            }

            public function fetchStudentInfoByLegacyStudentId(int $studentId): ?array
            {
                return null;
            }

            public function fetchStudentInfoByStudentCode(string $studentCode): ?array
            {
                return null;
            }

            public function fetchAllStudents(): array
            {
                return [];
            }

            public function fetchAllLecturers(): array
            {
                return [];
            }

            public function fetchAllDepartments(): array
            {
                return [[
                    'legacy_id' => 25,
                    'username' => 'bm25',
                ]];
            }
        });

        app(LegacyImportService::class)->importDepartments();

        $this->assertDatabaseHas('users', [
            'username' => 'bm25',
            'role' => UserRole::DEPARTMENT->value,
            'department_id' => 25,
        ]);

        $user = User::where('username', 'bm25')->firstOrFail();
        $this->assertTrue(password_verify('1', $user->password_hash));
    }
}
