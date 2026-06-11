<?php

namespace App\Services\External;

use App\Contracts\LegacyDataGateway;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class LegacyApiService implements LegacyDataGateway
{
    private const LIMIT = 100;
    private const TIMEOUT_SECONDS = 5;
    private const RETRY_TIMES = 3;
    private const RETRY_DELAY_MS = 200;

    public function fetchLegacyPeriods(): array
    {
        $payload = $this->request('/legacy/periods');

        $periods = [];

        foreach ($payload as $period) {
            if (empty($period['id'])) {
                continue;
            }

            $periods[] = [
                'id' => (int) $period['id'],
                'name' => (string) ($period['name'] ?? ''),
            ];
        }

        return $periods;
    }

    public function fetchStudentCoursesByLegacyStudentId(int $studentId, int $periodId): array
    {
        $payload = $this->request("/legacy/students/by-id/{$studentId}/periods/{$periodId}/courses");

        return $this->mapStudentCourses($payload);
    }

    public function fetchStudentCoursesByStudentCode(string $studentCode, int $periodId): array
    {
        $encodedStudentCode = rawurlencode($studentCode);
        $payload = $this->request("/legacy/students/by-code/{$encodedStudentCode}/periods/{$periodId}/courses");

        return $this->mapStudentCourses($payload);
    }

    public function fetchStudentInfoByLegacyStudentId(int $studentId): ?array
    {
        $payload = $this->requestOptional("/legacy/students/by-id/{$studentId}");

        return $this->mapStudentInfo($payload);
    }

    public function fetchStudentInfoByStudentCode(string $studentCode): ?array
    {
        $encodedStudentCode = rawurlencode($studentCode);
        $payload = $this->requestOptional("/legacy/students/by-code/{$encodedStudentCode}");

        return $this->mapStudentInfo($payload);
    }

    public function fetchAllStudents(): array
    {
        return $this->fetchAll('/students', function (array $student): ?array {
            if (
                empty($student['id']) ||
                empty($student['studentCode'])
            ) {
                return null;
            }

            return [
                'legacy_id' => (int) $student['id'],
                'username' => (string) $student['studentCode'],
                'date_of_birth' => $student['dateOfBirth'] ?? null,
            ];
        });
    }

    public function fetchAllLecturers(): array
    {
        return $this->fetchAll('/lecturers', function (array $lecturer): ?array {
            if (
                empty($lecturer['id']) ||
                empty($lecturer['lecturerCode'])
            ) {
                return null;
            }

            return [
                'legacy_id' => (int) $lecturer['id'],
                'username' => (string) $lecturer['lecturerCode'],
                'date_of_birth' => $lecturer['dateOfBirth'] ?? null,
            ];
        });
    }

    public function fetchAllDepartments(): array
    {
        return $this->fetchAll('/departments', function (array $department): ?array {
            if (empty($department['id'])) {
                return null;
            }

            return [
                'legacy_id' => (int) $department['id'],
                'username' => 'bm' . $department['id'],
            ];
        });
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
            $payload = $this->requestPage($endpoint, $page, self::LIMIT);

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

    /**
     * @return array<int, array<string, mixed>>
     */
    private function request(string $endpoint): array
    {
        try {
            $response = Http::legacy()
                ->timeout(self::TIMEOUT_SECONDS)
                ->retry(self::RETRY_TIMES, self::RETRY_DELAY_MS)
                ->get($endpoint)
                ->throw();

            $payload = $response->json();

            return is_array($payload['data'] ?? null) ? $payload['data'] : [];
        } catch (RequestException $exception) {
            if ($exception->response?->status() === 404) {
                return null;
            }

            Log::error('Legacy API request failed', [
                'endpoint' => $endpoint,
                'status' => $exception->response?->status(),
                'error' => $exception->getMessage(),
            ]);

            throw new RuntimeException('Failed to fetch data from legacy service', 0, $exception);
        } catch (\Throwable $exception) {
            Log::error('Legacy API transport failure', [
                'endpoint' => $endpoint,
                'error' => $exception->getMessage(),
            ]);

            throw new RuntimeException('Legacy service is unavailable', 0, $exception);
        }
    }

    /**
     * @param  array<int, array<string, mixed>>  $payload
     * @return array<int, array{courseCode:string,courseName:string,credits:int}>
     */
    private function mapStudentCourses(array $payload): array
    {
        $courses = [];

        foreach ($payload as $course) {
            if (
                empty($course['courseCode']) ||
                empty($course['courseName'])
            ) {
                continue;
            }

            $courses[] = [
                'courseCode' => (string) $course['courseCode'],
                'courseName' => (string) $course['courseName'],
                'credits' => (int) ($course['credits'] ?? 0),
            ];
        }

        return $courses;
    }

    /**
     * @param  array<string, mixed>|null  $payload
     * @return array{studentCode:string,lastName:string,firstName:string,fullName:string}|null
     */
    private function mapStudentInfo(?array $payload): ?array
    {
        if (!is_array($payload) || empty($payload['studentCode'])) {
            return null;
        }

        return [
            'studentCode' => (string) $payload['studentCode'],
            'lastName' => (string) ($payload['lastName'] ?? ''),
            'firstName' => (string) ($payload['firstName'] ?? ''),
            'fullName' => (string) ($payload['fullName'] ?? ''),
        ];
    }

    /**
     * @return array{data: array<int, array<string, mixed>>, meta: array{lastPage: int}}
     */
    private function requestPage(string $endpoint, int $page, int $limit): array
    {
        try {
            $response = Http::legacy()
                ->timeout(self::TIMEOUT_SECONDS)
                ->retry(self::RETRY_TIMES, self::RETRY_DELAY_MS)
                ->get($endpoint, [
                    'page' => $page,
                    'limit' => $limit,
                ])
                ->throw();

            $payload = $response->json();

            return [
                'data' => is_array($payload['data'] ?? null) ? $payload['data'] : [],
                'meta' => [
                    'lastPage' => max((int) ($payload['meta']['lastPage'] ?? 1), 1),
                ],
            ];
        } catch (RequestException $exception) {
            Log::error('Legacy API request failed', [
                'endpoint' => $endpoint,
                'page' => $page,
                'limit' => $limit,
                'status' => $exception->response?->status(),
                'error' => $exception->getMessage(),
            ]);

            throw new RuntimeException('Failed to fetch data from legacy service', 0, $exception);
        } catch (\Throwable $exception) {
            Log::error('Legacy API transport failure', [
                'endpoint' => $endpoint,
                'page' => $page,
                'limit' => $limit,
                'error' => $exception->getMessage(),
            ]);

            throw new RuntimeException('Legacy service is unavailable', 0, $exception);
        }
    }

    /**
     * @return array<string, mixed>|null
     */
    private function requestOptional(string $endpoint): ?array
    {
        try {
            $response = Http::legacy()
                ->timeout(self::TIMEOUT_SECONDS)
                ->retry(self::RETRY_TIMES, self::RETRY_DELAY_MS, throw: false)
                ->get($endpoint);

            if ($response->status() === 404) {
                return null;
            }

            if ($response->failed()) {
                throw new RequestException($response);
            }

            $payload = $response->json();

            return is_array($payload['data'] ?? null) ? $payload['data'] : null;
        } catch (RequestException $exception) {
            Log::error('Legacy API request failed', [
                'endpoint' => $endpoint,
                'status' => $exception->response?->status(),
                'error' => $exception->getMessage(),
            ]);

            throw new RuntimeException('Failed to fetch data from legacy service', 0, $exception);
        } catch (\Throwable $exception) {
            Log::error('Legacy API transport failure', [
                'endpoint' => $endpoint,
                'error' => $exception->getMessage(),
            ]);

            throw new RuntimeException('Legacy service is unavailable', 0, $exception);
        }
    }
}
