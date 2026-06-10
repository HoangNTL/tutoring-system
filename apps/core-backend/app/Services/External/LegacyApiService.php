<?php

namespace App\Services\External;

use App\Contracts\Legacy\LegacyApiClient;
use App\Services\External\Adapters\LegacyImportedUserAdapter;
use App\Services\External\Adapters\LegacyLecturerAdapter;
use App\Services\External\Adapters\LegacyPeriodAdapter;
use App\Services\External\Adapters\LegacyRoomAdapter;
use App\Services\External\Adapters\LegacyStudentCourseAdapter;
use App\Services\External\Adapters\LegacyStudentInfoAdapter;

class LegacyApiService implements LegacyApiClient
{
    private const LIMIT = 100;

    public function __construct(
        private LegacyHttpClient $httpClient,
        private LegacyPeriodAdapter $periodAdapter,
        private LegacyStudentCourseAdapter $studentCourseAdapter,
        private LegacyStudentInfoAdapter $studentInfoAdapter,
        private LegacyLecturerAdapter $lecturerAdapter,
        private LegacyRoomAdapter $roomAdapter,
        private LegacyImportedUserAdapter $importedUserAdapter,
    ) {}

    public function fetchLegacyPeriods(): array
    {
        return $this->periodAdapter->adaptMany(
            $this->httpClient->getCollection('/legacy/periods')
        );
    }

    public function fetchStudentCoursesByLegacyStudentId(int $studentId, int $periodId): array
    {
        return $this->studentCourseAdapter->adaptMany(
            $this->httpClient->getCollection("/legacy/students/by-id/{$studentId}/periods/{$periodId}/courses")
        );
    }

    public function fetchStudentCoursesByStudentCode(string $studentCode, int $periodId): array
    {
        $encodedStudentCode = rawurlencode($studentCode);

        return $this->studentCourseAdapter->adaptMany(
            $this->httpClient->getCollection("/legacy/students/by-code/{$encodedStudentCode}/periods/{$periodId}/courses")
        );
    }

    public function fetchStudentInfoByLegacyStudentId(int $studentId): ?array
    {
        return $this->studentInfoAdapter->adapt(
            $this->httpClient->getOptionalResource("/legacy/students/by-id/{$studentId}")
        );
    }

    public function fetchStudentInfoByStudentCode(string $studentCode): ?array
    {
        $encodedStudentCode = rawurlencode($studentCode);

        return $this->studentInfoAdapter->adapt(
            $this->httpClient->getOptionalResource("/legacy/students/by-code/{$encodedStudentCode}")
        );
    }

    public function fetchAllStudents(): array
    {
        return $this->fetchAll('/students', fn (array $student): ?array => $this->importedUserAdapter->adaptStudent($student));
    }

    public function fetchAllLecturers(): array
    {
        return $this->fetchAll('/lecturers', fn (array $lecturer): ?array => $this->lecturerAdapter->adaptForImport($lecturer));
    }

    public function fetchLecturersByDepartment(int $departmentId): array
    {
        return $this->lecturerAdapter->adaptManyForDepartment(
            $this->httpClient->getCollection("/legacy/departments/{$departmentId}/lecturers")
        );
    }

    public function fetchRooms(): array
    {
        return $this->roomAdapter->adaptMany(
            $this->httpClient->getCollection('/legacy/rooms')
        );
    }

    public function fetchAllDepartments(): array
    {
        return $this->fetchAll('/legacy/departments', fn (array $department): ?array => $this->importedUserAdapter->adaptDepartment($department));
    }

    /**
     * @param  callable(array<string, mixed>): ?array<string, mixed>  $mapper
     * @return array<int, array<string, mixed>>
     */
    private function fetchAll(string $endpoint, callable $mapper): array
    {
        $page = 1;
        $allItems = [];

        do {
            $payload = $this->httpClient->getPage($endpoint, $page, self::LIMIT);

            foreach ($payload['data'] as $item) {
                $mapped = $mapper($item);

                if ($mapped !== null) {
                    $allItems[] = $mapped;
                }
            }

            $page++;
        } while ($page <= $payload['meta']['lastPage']);

        return $allItems;
    }
}
