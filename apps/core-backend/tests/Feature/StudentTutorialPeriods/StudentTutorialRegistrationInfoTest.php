<?php

namespace Tests\Feature\StudentTutorialPeriods;

use App\Enums\TutorialClassStatus;
use App\Enums\TutorialPeriodStatus;
use App\Enums\TutorialRegistrationStatus;
use App\Enums\UserRole;
use App\Models\TutorialClass;
use App\Models\TutorialClassSchedule;
use App\Models\TutorialPeriod;
use App\Models\TutorialRegistration;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class StudentTutorialRegistrationInfoTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_users_are_blocked(): void
    {
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::OPEN, 296);

        $this
            ->getJson("/api/v1/student/tutorial-periods/{$tutorialPeriod->id}/registration-info")
            ->assertUnauthorized();
    }

    public function test_non_student_users_are_blocked(): void
    {
        Http::fake();

        $admin = User::factory()->admin()->create();
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::OPEN, 296);

        $this
            ->actingAs($admin, 'web')
            ->getJson("/api/v1/student/tutorial-periods/{$tutorialPeriod->id}/registration-info")
            ->assertForbidden();

        Http::assertNothingSent();
    }

    public function test_open_period_returns_registration_info(): void
    {
        Http::fake(function (Request $request) {
            if (str_contains($request->url(), '/legacy/periods')) {
                return Http::response([
                    'success' => true,
                    'data' => [
                        ['id' => 296, 'name' => 'HK2 2024-2025'],
                    ],
                ], 200);
            }

            return Http::response([
                'success' => true,
                'data' => [
                    [
                        'courseCode' => 'INT123',
                        'courseName' => 'Cấu trúc dữ liệu',
                        'credits' => 3,
                    ],
                ],
            ], 200);
        });

        $student = User::factory()->create([
            'role' => UserRole::STUDENT,
            'student_id' => 88,
            'username' => 'sv0001',
        ]);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::OPEN, 296);

        $this
            ->actingAs($student, 'web')
            ->getJson("/api/v1/student/tutorial-periods/{$tutorialPeriod->id}/registration-info")
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Tutorial registration information retrieved successfully')
            ->assertJsonPath('data.tutorialPeriod.id', $tutorialPeriod->id)
            ->assertJsonPath('data.tutorialPeriod.title', 'Open Period')
            ->assertJsonPath('data.tutorialPeriod.academicPeriod.id', 296)
            ->assertJsonPath('data.tutorialPeriod.status', TutorialPeriodStatus::OPEN->name)
            ->assertJsonPath('data.permissions.canViewRegistrationInfo', true)
            ->assertJsonPath('data.permissions.canRegister', true)
            ->assertJsonPath('data.permissions.canCancelRegistration', true)
            ->assertJsonPath('data.permissions.canViewSchedule', false)
            ->assertJsonPath('data.availableCourses.0.courseCode', 'INT123')
            ->assertJsonPath('data.registeredCourses', []);
    }

    public function test_assigning_period_returns_registered_courses_but_disables_registration_actions(): void
    {
        Http::fake(function (Request $request) {
            if (str_contains($request->url(), '/legacy/periods')) {
                return Http::response([
                    'success' => true,
                    'data' => [
                        ['id' => 296, 'name' => 'HK2 2024-2025'],
                    ],
                ], 200);
            }

            return Http::response([
                'success' => true,
                'data' => [
                    [
                        'courseCode' => 'INT123',
                        'courseName' => 'Cấu trúc dữ liệu',
                        'credits' => 3,
                    ],
                ],
            ], 200);
        });

        $student = User::factory()->create([
            'role' => UserRole::STUDENT,
            'student_id' => 88,
            'username' => 'sv0001',
        ]);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::ASSIGNING, 296);

        TutorialRegistration::create([
            'tutorial_period_id' => $tutorialPeriod->id,
            'user_id' => $student->id,
            'course_code' => 'INT123',
            'course_name' => 'Cấu trúc dữ liệu',
            'credits' => 3,
            'status' => TutorialRegistrationStatus::REGISTERED,
            'registered_at' => now(),
        ]);

        $this
            ->actingAs($student, 'web')
            ->getJson("/api/v1/student/tutorial-periods/{$tutorialPeriod->id}/registration-info")
            ->assertOk()
            ->assertJsonPath('data.tutorialPeriod.status', TutorialPeriodStatus::ASSIGNING->name)
            ->assertJsonPath('data.permissions.canRegister', false)
            ->assertJsonPath('data.permissions.canCancelRegistration', false)
            ->assertJsonPath('data.permissions.canViewSchedule', false)
            ->assertJsonPath('data.registeredCourses.0.courseCode', 'INT123')
            ->assertJsonPath('data.availableCourses', []);

        Http::assertNotSent(function (Request $request): bool {
            return str_contains($request->url(), '/legacy/students/by-id/88/periods/296/courses');
        });
    }

    public function test_ongoing_period_can_expose_schedule_visibility_when_schedule_exists(): void
    {
        Http::fake(function (Request $request) {
            if (str_contains($request->url(), '/legacy/periods')) {
                return Http::response([
                    'success' => true,
                    'data' => [
                        ['id' => 296, 'name' => 'HK2 2024-2025'],
                    ],
                ], 200);
            }

            return Http::response([
                'success' => true,
                'data' => [],
            ], 200);
        });

        $student = User::factory()->create([
            'role' => UserRole::STUDENT,
            'student_id' => 88,
            'username' => 'sv0001',
        ]);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::ONGOING, 296);

        TutorialRegistration::create([
            'tutorial_period_id' => $tutorialPeriod->id,
            'user_id' => $student->id,
            'course_code' => 'INT123',
            'course_name' => 'Cấu trúc dữ liệu',
            'credits' => 3,
            'status' => TutorialRegistrationStatus::REGISTERED,
            'registered_at' => now(),
        ]);

        $tutorialClass = TutorialClass::create([
            'tutorial_period_id' => $tutorialPeriod->id,
            'course_code' => 'INT123',
            'course_name' => 'Cấu trúc dữ liệu',
            'credits' => 3,
            'total_sessions' => 10,
            'periods_per_session' => 2,
            'total_periods' => 20,
            'status' => TutorialClassStatus::SCHEDULED,
            'created_by' => User::factory()->admin()->create()->id,
        ]);

        TutorialClassSchedule::create([
            'tutorial_class_id' => $tutorialClass->id,
            'room_id' => 1,
            'room_code' => 'A101',
            'room_name' => 'Room A101',
            'day_of_week' => 2,
            'start_period' => 1,
            'end_period' => 2,
        ]);

        $this
            ->actingAs($student, 'web')
            ->getJson("/api/v1/student/tutorial-periods/{$tutorialPeriod->id}/registration-info")
            ->assertOk()
            ->assertJsonPath('data.tutorialPeriod.status', TutorialPeriodStatus::ONGOING->name)
            ->assertJsonPath('data.permissions.canRegister', false)
            ->assertJsonPath('data.permissions.canCancelRegistration', false)
            ->assertJsonPath('data.permissions.canViewSchedule', true)
            ->assertJsonPath('data.registeredCourses.0.courseCode', 'INT123');
    }

    public function test_closed_period_returns_historical_registered_courses(): void
    {
        Http::fake(function (Request $request) {
            if (str_contains($request->url(), '/legacy/periods')) {
                return Http::response([
                    'success' => true,
                    'data' => [
                        ['id' => 296, 'name' => 'HK2 2024-2025'],
                    ],
                ], 200);
            }

            return Http::response([
                'success' => true,
                'data' => [],
            ], 200);
        });

        $student = User::factory()->create([
            'role' => UserRole::STUDENT,
            'student_id' => 88,
            'username' => 'sv0001',
        ]);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::CLOSED, 296);

        TutorialRegistration::create([
            'tutorial_period_id' => $tutorialPeriod->id,
            'user_id' => $student->id,
            'course_code' => 'INT123',
            'course_name' => 'Cấu trúc dữ liệu',
            'credits' => 3,
            'status' => TutorialRegistrationStatus::REGISTERED,
            'registered_at' => now(),
        ]);

        $this
            ->actingAs($student, 'web')
            ->getJson("/api/v1/student/tutorial-periods/{$tutorialPeriod->id}/registration-info")
            ->assertOk()
            ->assertJsonPath('data.tutorialPeriod.status', TutorialPeriodStatus::CLOSED->name)
            ->assertJsonPath('data.permissions.canRegister', false)
            ->assertJsonPath('data.permissions.canCancelRegistration', false)
            ->assertJsonPath('data.registeredCourses.0.courseCode', 'INT123')
            ->assertJsonPath('data.availableCourses', []);
    }

    public function test_draft_and_cancelled_periods_are_not_viewable(): void
    {
        Http::fake();

        $student = User::factory()->create([
            'role' => UserRole::STUDENT,
            'student_id' => 88,
            'username' => 'sv0001',
        ]);
        $draftPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::DRAFT, 296);
        $cancelledPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::CANCELLED, 296);

        $this
            ->actingAs($student, 'web')
            ->getJson("/api/v1/student/tutorial-periods/{$draftPeriod->id}/registration-info")
            ->assertNotFound();

        $this
            ->actingAs($student, 'web')
            ->getJson("/api/v1/student/tutorial-periods/{$cancelledPeriod->id}/registration-info")
            ->assertNotFound();
    }

    public function test_student_id_is_preferred_when_available(): void
    {
        Http::fake(function (Request $request) {
            if (str_contains($request->url(), '/legacy/periods')) {
                return Http::response([
                    'success' => true,
                    'data' => [
                        ['id' => 296, 'name' => 'HK2 2024-2025'],
                    ],
                ], 200);
            }

            return Http::response([
                'success' => true,
                'data' => [],
            ], 200);
        });

        $student = User::factory()->create([
            'role' => UserRole::STUDENT,
            'student_id' => 123,
            'username' => 'sv123',
        ]);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::OPEN, 296);

        $this
            ->actingAs($student, 'web')
            ->getJson("/api/v1/student/tutorial-periods/{$tutorialPeriod->id}/registration-info")
            ->assertOk();

        Http::assertSent(function (Request $request): bool {
            return str_contains($request->url(), '/legacy/students/by-id/123/periods/296/courses');
        });

        Http::assertNotSent(function (Request $request): bool {
            return str_contains($request->url(), '/legacy/students/by-code/');
        });
    }

    public function test_username_is_used_when_student_id_is_null(): void
    {
        Http::fake(function (Request $request) {
            if (str_contains($request->url(), '/legacy/periods')) {
                return Http::response([
                    'success' => true,
                    'data' => [
                        ['id' => 296, 'name' => 'HK2 2024-2025'],
                    ],
                ], 200);
            }

            return Http::response([
                'success' => true,
                'data' => [],
            ], 200);
        });

        $student = User::factory()->create([
            'role' => UserRole::STUDENT,
            'student_id' => null,
            'username' => 'svfallback',
        ]);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::OPEN, 296);

        $this
            ->actingAs($student, 'web')
            ->getJson("/api/v1/student/tutorial-periods/{$tutorialPeriod->id}/registration-info")
            ->assertOk();

        Http::assertSent(function (Request $request): bool {
            return str_contains($request->url(), '/legacy/students/by-code/svfallback/periods/296/courses');
        });
    }

    public function test_response_shape_is_student_safe(): void
    {
        Http::fake(function (Request $request) {
            if (str_contains($request->url(), '/legacy/periods')) {
                return Http::response([
                    'success' => true,
                    'data' => [
                        ['id' => 296, 'name' => 'HK2 2024-2025'],
                    ],
                ], 200);
            }

            return Http::response([
                'success' => true,
                'data' => [
                    [
                        'courseCode' => 'INT123',
                        'courseName' => 'Cấu trúc dữ liệu',
                        'credits' => 3,
                    ],
                ],
            ], 200);
        });

        $student = User::factory()->create([
            'role' => UserRole::STUDENT,
            'student_id' => 88,
            'username' => 'sv0001',
        ]);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::OPEN, 296);

        $response = $this
            ->actingAs($student, 'web')
            ->getJson("/api/v1/student/tutorial-periods/{$tutorialPeriod->id}/registration-info");

        $response->assertOk();

        $tutorialPeriodPayload = $response->json('data.tutorialPeriod');
        $permissionsPayload = $response->json('data.permissions');
        $this->assertArrayHasKey('id', $tutorialPeriodPayload);
        $this->assertArrayHasKey('title', $tutorialPeriodPayload);
        $this->assertArrayHasKey('academicPeriod', $tutorialPeriodPayload);
        $this->assertArrayHasKey('registrationEndAt', $tutorialPeriodPayload);
        $this->assertArrayHasKey('status', $tutorialPeriodPayload);
        $this->assertArrayNotHasKey('studentId', $tutorialPeriodPayload);
        $this->assertArrayNotHasKey('studentCode', $tutorialPeriodPayload);
        $this->assertArrayNotHasKey('academicPeriodId', $tutorialPeriodPayload);
        $this->assertArrayNotHasKey('createdBy', $tutorialPeriodPayload);
        $this->assertArrayNotHasKey('permissions', $tutorialPeriodPayload);
        $this->assertSame(
            ['canViewRegistrationInfo', 'canRegister', 'canCancelRegistration', 'canViewSchedule'],
            array_keys($permissionsPayload)
        );

        foreach ($response->json('data.availableCourses') as $item) {
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
