<?php

namespace Tests\Feature\External;

use App\Services\External\LegacyApiService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Tests\TestCase;

class LegacyApiServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_legacy_api_failures_are_logged_without_dumping_the_response_body(): void
    {
        Log::spy();

        Http::fake([
            '*' => Http::response(['message' => 'upstream failure'], 500),
        ]);

        $service = app(LegacyApiService::class);

        try {
            $service->fetchAllStudents();
            $this->fail('Expected RuntimeException was not thrown.');
        } catch (RuntimeException $exception) {
            $this->assertSame('Failed to fetch data from legacy service', $exception->getMessage());
        }

        Http::assertSent(function (Request $request): bool {
            return str_contains($request->url(), '/students');
        });

        Log::shouldHaveReceived('error')->withArgs(function (string $message, array $context): bool {
            return $message === 'Legacy API request failed'
                && array_key_exists('status', $context)
                && !array_key_exists('body', $context);
        });
    }

    public function test_fetch_legacy_periods_maps_to_public_contract(): void
    {
        Http::fake([
            '*' => Http::response([
                'success' => true,
                'data' => [
                    ['id' => 5, 'name' => 'Term 5'],
                    ['id' => 4, 'name' => 'Term 4'],
                ],
            ], 200),
        ]);

        $service = app(LegacyApiService::class);

        $result = $service->fetchLegacyPeriods();

        $this->assertSame([
            ['id' => 5, 'name' => 'Term 5'],
            ['id' => 4, 'name' => 'Term 4'],
        ], $result);

        Http::assertSent(function (Request $request): bool {
            return str_contains($request->url(), '/legacy/periods');
        });
    }

    public function test_fetch_student_courses_by_legacy_student_id_maps_to_public_contract(): void
    {
        Http::fake([
            '*' => Http::response([
                'success' => true,
                'data' => [
                    [
                        'courseCode' => 'INT123',
                        'courseName' => 'Cấu trúc dữ liệu',
                        'credits' => 3,
                    ],
                ],
            ], 200),
        ]);

        $service = app(LegacyApiService::class);

        $result = $service->fetchStudentCoursesByLegacyStudentId(88, 296);

        $this->assertSame([
            [
                'courseCode' => 'INT123',
                'courseName' => 'Cấu trúc dữ liệu',
                'credits' => 3,
            ],
        ], $result);

        Http::assertSent(function (Request $request): bool {
            return str_contains($request->url(), '/legacy/students/by-id/88/periods/296/courses');
        });
    }

    public function test_fetch_student_courses_by_student_code_maps_to_public_contract(): void
    {
        Http::fake([
            '*' => Http::response([
                'success' => true,
                'data' => [
                    [
                        'courseCode' => 'INT123',
                        'courseName' => 'Cấu trúc dữ liệu',
                        'credits' => 3,
                    ],
                ],
            ], 200),
        ]);

        $service = app(LegacyApiService::class);

        $result = $service->fetchStudentCoursesByStudentCode('sv001', 296);

        $this->assertSame([
            [
                'courseCode' => 'INT123',
                'courseName' => 'Cấu trúc dữ liệu',
                'credits' => 3,
            ],
        ], $result);

        Http::assertSent(function (Request $request): bool {
            return str_contains($request->url(), '/legacy/students/by-code/sv001/periods/296/courses');
        });
    }

    public function test_fetch_student_info_by_legacy_student_id_maps_to_public_contract(): void
    {
        Http::fake([
            '*' => Http::response([
                'success' => true,
                'data' => [
                    'studentCode' => '5001866',
                    'lastName' => 'Nguyễn Văn',
                    'firstName' => 'A',
                    'fullName' => 'Nguyễn Văn A',
                ],
            ], 200),
        ]);

        $service = app(LegacyApiService::class);

        $result = $service->fetchStudentInfoByLegacyStudentId(88);

        $this->assertSame([
            'studentCode' => '5001866',
            'lastName' => 'Nguyễn Văn',
            'firstName' => 'A',
            'fullName' => 'Nguyễn Văn A',
        ], $result);

        Http::assertSent(function (Request $request): bool {
            return str_contains($request->url(), '/legacy/students/by-id/88');
        });
    }

    public function test_fetch_student_info_by_student_code_maps_to_public_contract(): void
    {
        Http::fake([
            '*' => Http::response([
                'success' => true,
                'data' => [
                    'studentCode' => '5001866',
                    'lastName' => 'Nguyễn Văn',
                    'firstName' => 'A',
                    'fullName' => 'Nguyễn Văn A',
                ],
            ], 200),
        ]);

        $service = app(LegacyApiService::class);

        $result = $service->fetchStudentInfoByStudentCode('5001866');

        $this->assertSame([
            'studentCode' => '5001866',
            'lastName' => 'Nguyễn Văn',
            'firstName' => 'A',
            'fullName' => 'Nguyễn Văn A',
        ], $result);

        Http::assertSent(function (Request $request): bool {
            return str_contains($request->url(), '/legacy/students/by-code/5001866');
        });
    }

    public function test_fetch_student_info_returns_null_on_not_found(): void
    {
        Http::fake([
            '*' => Http::response([
                'success' => false,
                'message' => 'Student not found',
            ], 404),
        ]);

        $service = app(LegacyApiService::class);

        $this->assertNull($service->fetchStudentInfoByLegacyStudentId(9999));
        $this->assertNull($service->fetchStudentInfoByStudentCode('missing'));
    }
}
