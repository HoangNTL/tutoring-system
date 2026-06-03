<?php

namespace Tests\Feature\StudentTutorialPeriods;

use App\Enums\TutorialPeriodStatus;
use App\Enums\UserRole;
use App\Models\TutorialPeriod;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class StudentTutorialPeriodCourseListingTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_users_are_blocked(): void
    {
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::OPEN, 296);

        $this
            ->getJson("/api/v1/student/tutorial-periods/{$tutorialPeriod->id}/courses")
            ->assertUnauthorized();
    }

    public function test_non_student_users_are_blocked(): void
    {
        Http::fake();

        $admin = User::factory()->admin()->create();
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::OPEN, 296);

        $this
            ->actingAs($admin, 'web')
            ->getJson("/api/v1/student/tutorial-periods/{$tutorialPeriod->id}/courses")
            ->assertForbidden();

        Http::assertNothingSent();
    }

    public function test_student_can_fetch_courses_for_open_period(): void
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

        $student = User::factory()->create([
            'role' => UserRole::STUDENT,
            'student_id' => 88,
            'username' => 'sv0001',
        ]);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::OPEN, 296);

        $this
            ->actingAs($student, 'web')
            ->getJson("/api/v1/student/tutorial-periods/{$tutorialPeriod->id}/courses")
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Available courses retrieved successfully')
            ->assertJsonPath('data.0.courseCode', 'INT123')
            ->assertJsonPath('data.0.courseName', 'Cấu trúc dữ liệu')
            ->assertJsonPath('data.0.credits', 3);
    }

    public function test_non_open_periods_are_blocked_before_querying_legacy(): void
    {
        Http::fake();

        $student = User::factory()->create([
            'role' => UserRole::STUDENT,
            'student_id' => 88,
            'username' => 'sv0001',
        ]);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::CLOSED, 296);

        $this
            ->actingAs($student, 'web')
            ->getJson("/api/v1/student/tutorial-periods/{$tutorialPeriod->id}/courses")
            ->assertNotFound();

        Http::assertNothingSent();
    }

    public function test_uses_student_id_when_available(): void
    {
        Http::fake([
            '*' => Http::response([
                'success' => true,
                'data' => [],
            ], 200),
        ]);

        $student = User::factory()->create([
            'role' => UserRole::STUDENT,
            'student_id' => 123,
            'username' => 'sv123',
        ]);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::OPEN, 296);

        $this
            ->actingAs($student, 'web')
            ->getJson("/api/v1/student/tutorial-periods/{$tutorialPeriod->id}/courses")
            ->assertOk();

        Http::assertSent(function (Request $request): bool {
            return str_contains($request->url(), '/legacy/students/by-id/123/periods/296/courses');
        });

        Http::assertNotSent(function (Request $request): bool {
            return str_contains($request->url(), '/legacy/students/by-code/');
        });
    }

    public function test_falls_back_to_username_when_student_id_is_null(): void
    {
        Http::fake([
            '*' => Http::response([
                'success' => true,
                'data' => [],
            ], 200),
        ]);

        $student = User::factory()->create([
            'role' => UserRole::STUDENT,
            'student_id' => null,
            'username' => 'svfallback',
        ]);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::OPEN, 296);

        $this
            ->actingAs($student, 'web')
            ->getJson("/api/v1/student/tutorial-periods/{$tutorialPeriod->id}/courses")
            ->assertOk();

        Http::assertSent(function (Request $request): bool {
            return str_contains($request->url(), '/legacy/students/by-code/svfallback/periods/296/courses');
        });

        Http::assertNotSent(function (Request $request): bool {
            return str_contains($request->url(), '/legacy/students/by-id/');
        });
    }

    public function test_response_contains_only_public_course_fields(): void
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

        $student = User::factory()->create([
            'role' => UserRole::STUDENT,
            'student_id' => 88,
            'username' => 'sv0001',
        ]);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::OPEN, 296);

        $response = $this
            ->actingAs($student, 'web')
            ->getJson("/api/v1/student/tutorial-periods/{$tutorialPeriod->id}/courses");

        $response->assertOk();

        foreach ($response->json('data') as $item) {
            $this->assertSame(['courseCode', 'courseName', 'credits'], array_keys($item));
            $this->assertArrayNotHasKey('studentId', $item);
            $this->assertArrayNotHasKey('studentCode', $item);
            $this->assertArrayNotHasKey('periodId', $item);
        }
    }

    private function createTutorialPeriod(
        TutorialPeriodStatus $status,
        ?int $academicPeriodId
    ): TutorialPeriod {
        return TutorialPeriod::create([
            'academic_period_id' => $academicPeriodId,
            'title' => 'Open Period',
            'description' => 'Open Period description',
            'registration_start_at' => '2026-05-18 08:00:00',
            'registration_end_at' => '2026-05-21 17:00:00',
            'study_start_at' => '2026-05-22 08:00:00',
            'study_end_at' => '2026-05-31 17:00:00',
            'status' => $status,
            'created_by' => User::factory()->admin()->create()->id,
        ]);
    }
}
