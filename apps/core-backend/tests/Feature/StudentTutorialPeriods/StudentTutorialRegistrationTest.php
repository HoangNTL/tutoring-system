<?php

namespace Tests\Feature\StudentTutorialPeriods;

use App\Enums\TutorialRegistrationStatus;
use App\Enums\TutorialPeriodStatus;
use App\Enums\UserRole;
use App\Models\TutorialPeriod;
use App\Models\TutorialRegistration;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class StudentTutorialRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_register_an_available_course(): void
    {
        Http::fake(fn (Request $request) => $this->fakeLegacyCourseResponses($request));

        $student = $this->createStudent(['student_id' => 88]);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::OPEN, 296);

        $this
            ->actingAs($student, 'web')
            ->postJson("/api/v1/student/tutorial-periods/{$tutorialPeriod->id}/registrations", [
                'courseCode' => 'INT123',
            ])
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.courseCode', 'INT123')
            ->assertJsonPath('data.status', TutorialRegistrationStatus::REGISTERED->value);

        $this->assertDatabaseHas('tutorial_registrations', [
            'tutorial_period_id' => $tutorialPeriod->id,
            'user_id' => $student->id,
            'course_code' => 'INT123',
            'status' => TutorialRegistrationStatus::REGISTERED->value,
        ]);
    }

    public function test_student_cannot_register_a_course_not_in_available_courses(): void
    {
        Http::fake(fn (Request $request) => $this->fakeLegacyCourseResponses($request));

        $student = $this->createStudent(['student_id' => 88]);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::OPEN, 296);

        $this
            ->actingAs($student, 'web')
            ->postJson("/api/v1/student/tutorial-periods/{$tutorialPeriod->id}/registrations", [
                'courseCode' => 'NOPE999',
            ])
            ->assertStatus(422);
    }

    public function test_student_cannot_register_duplicate_course(): void
    {
        Http::fake(fn (Request $request) => $this->fakeLegacyCourseResponses($request));

        $student = $this->createStudent(['student_id' => 88]);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::OPEN, 296);

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
            ->postJson("/api/v1/student/tutorial-periods/{$tutorialPeriod->id}/registrations", [
                'courseCode' => 'INT123',
            ])
            ->assertStatus(409);
    }

    public function test_student_can_re_register_a_previously_cancelled_course(): void
    {
        Http::fake(fn (Request $request) => $this->fakeLegacyCourseResponses($request));

        $student = $this->createStudent(['student_id' => 88]);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::OPEN, 296);

        TutorialRegistration::create([
            'tutorial_period_id' => $tutorialPeriod->id,
            'user_id' => $student->id,
            'course_code' => 'INT123',
            'course_name' => 'Cấu trúc dữ liệu',
            'credits' => 3,
            'status' => TutorialRegistrationStatus::CANCELLED,
            'registered_at' => now()->subDay(),
            'cancelled_at' => now()->subHour(),
        ]);

        $this
            ->actingAs($student, 'web')
            ->postJson("/api/v1/student/tutorial-periods/{$tutorialPeriod->id}/registrations", [
                'courseCode' => 'INT123',
            ])
            ->assertCreated();

        $this->assertDatabaseHas('tutorial_registrations', [
            'tutorial_period_id' => $tutorialPeriod->id,
            'user_id' => $student->id,
            'course_code' => 'INT123',
            'status' => TutorialRegistrationStatus::REGISTERED->value,
        ]);
    }

    public function test_student_can_cancel_registered_course(): void
    {
        Http::fake();

        $student = $this->createStudent(['student_id' => 88]);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::OPEN, 296);

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
            ->deleteJson("/api/v1/student/tutorial-periods/{$tutorialPeriod->id}/registrations/INT123")
            ->assertOk()
            ->assertJsonPath('data.status', TutorialRegistrationStatus::CANCELLED->value);

        $this->assertDatabaseHas('tutorial_registrations', [
            'tutorial_period_id' => $tutorialPeriod->id,
            'user_id' => $student->id,
            'course_code' => 'INT123',
            'status' => TutorialRegistrationStatus::CANCELLED->value,
        ]);
    }

    public function test_student_cannot_cancel_non_existing_registration(): void
    {
        Http::fake();

        $student = $this->createStudent(['student_id' => 88]);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::OPEN, 296);

        $this
            ->actingAs($student, 'web')
            ->deleteJson("/api/v1/student/tutorial-periods/{$tutorialPeriod->id}/registrations/INT123")
            ->assertNotFound();
    }

    public function test_non_student_cannot_register_or_cancel(): void
    {
        Http::fake();

        $admin = User::factory()->admin()->create();
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::OPEN, 296);

        $this
            ->actingAs($admin, 'web')
            ->postJson("/api/v1/student/tutorial-periods/{$tutorialPeriod->id}/registrations", [
                'courseCode' => 'INT123',
            ])
            ->assertForbidden();

        $this
            ->actingAs($admin, 'web')
            ->deleteJson("/api/v1/student/tutorial-periods/{$tutorialPeriod->id}/registrations/INT123")
            ->assertForbidden();
    }

    public function test_unauthenticated_user_cannot_register_or_cancel(): void
    {
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::OPEN, 296);

        $this
            ->postJson("/api/v1/student/tutorial-periods/{$tutorialPeriod->id}/registrations", [
                'courseCode' => 'INT123',
            ])
            ->assertUnauthorized();

        $this
            ->deleteJson("/api/v1/student/tutorial-periods/{$tutorialPeriod->id}/registrations/INT123")
            ->assertUnauthorized();
    }

    public function test_registration_is_blocked_when_tutorial_period_is_not_open(): void
    {
        Http::fake();

        $student = $this->createStudent(['student_id' => 88]);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::CLOSED, 296);

        $this
            ->actingAs($student, 'web')
            ->postJson("/api/v1/student/tutorial-periods/{$tutorialPeriod->id}/registrations", [
                'courseCode' => 'INT123',
            ])
            ->assertConflict();
    }

    public function test_student_cannot_register_in_assigning_or_ongoing_periods(): void
    {
        Http::fake();

        $student = $this->createStudent(['student_id' => 88]);
        $assigningPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::ASSIGNING, 296);
        $ongoingPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::ONGOING, 296);

        $this
            ->actingAs($student, 'web')
            ->postJson("/api/v1/student/tutorial-periods/{$assigningPeriod->id}/registrations", [
                'courseCode' => 'INT123',
            ])
            ->assertConflict();

        $this
            ->actingAs($student, 'web')
            ->postJson("/api/v1/student/tutorial-periods/{$ongoingPeriod->id}/registrations", [
                'courseCode' => 'INT123',
            ])
            ->assertConflict();
    }

    public function test_student_cannot_cancel_registration_in_assigning_or_ongoing_periods(): void
    {
        Http::fake();

        $student = $this->createStudent(['student_id' => 88]);
        $assigningPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::ASSIGNING, 296);
        $ongoingPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::ONGOING, 296);

        TutorialRegistration::create([
            'tutorial_period_id' => $assigningPeriod->id,
            'user_id' => $student->id,
            'course_code' => 'INT123',
            'course_name' => 'Cấu trúc dữ liệu',
            'credits' => 3,
            'status' => TutorialRegistrationStatus::REGISTERED,
            'registered_at' => now(),
        ]);

        TutorialRegistration::create([
            'tutorial_period_id' => $ongoingPeriod->id,
            'user_id' => $student->id,
            'course_code' => 'INT456',
            'course_name' => 'Giải tích',
            'credits' => 2,
            'status' => TutorialRegistrationStatus::REGISTERED,
            'registered_at' => now(),
        ]);

        $this
            ->actingAs($student, 'web')
            ->deleteJson("/api/v1/student/tutorial-periods/{$assigningPeriod->id}/registrations/INT123")
            ->assertConflict();

        $this
            ->actingAs($student, 'web')
            ->deleteJson("/api/v1/student/tutorial-periods/{$ongoingPeriod->id}/registrations/INT456")
            ->assertConflict();
    }

    public function test_registration_info_endpoint_returns_registered_courses_from_database(): void
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
                    [
                        'courseCode' => 'INT456',
                        'courseName' => 'Giải tích',
                        'credits' => 2,
                    ],
                ],
            ], 200);
        });

        $student = $this->createStudent(['student_id' => 88]);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::OPEN, 296);

        TutorialRegistration::create([
            'tutorial_period_id' => $tutorialPeriod->id,
            'user_id' => $student->id,
            'course_code' => 'INT123',
            'course_name' => 'Cấu trúc dữ liệu',
            'credits' => 3,
            'status' => TutorialRegistrationStatus::REGISTERED,
            'registered_at' => now(),
        ]);

        TutorialRegistration::create([
            'tutorial_period_id' => $tutorialPeriod->id,
            'user_id' => $student->id,
            'course_code' => 'INT999',
            'course_name' => 'Old Cancelled',
            'credits' => 1,
            'status' => TutorialRegistrationStatus::CANCELLED,
            'registered_at' => now()->subDay(),
            'cancelled_at' => now(),
        ]);

        $this
            ->actingAs($student, 'web')
            ->getJson("/api/v1/student/tutorial-periods/{$tutorialPeriod->id}/registration-info")
            ->assertOk()
            ->assertJsonCount(1, 'data.registeredCourses')
            ->assertJsonPath('data.registeredCourses.0.courseCode', 'INT123')
            ->assertJsonPath('data.registeredCourses.0.registeredAt', now()->format('Y-m-d H:i:s'));
    }

    private function createStudent(array $attributes = []): User
    {
        return User::factory()->create(array_merge([
            'role' => UserRole::STUDENT,
            'username' => 'student001',
            'student_id' => null,
        ], $attributes));
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

    private function fakeLegacyCourseResponses(Request $request)
    {
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
                [
                    'courseCode' => 'INT456',
                    'courseName' => 'Giải tích',
                    'credits' => 2,
                ],
            ],
        ], 200);
    }
}
