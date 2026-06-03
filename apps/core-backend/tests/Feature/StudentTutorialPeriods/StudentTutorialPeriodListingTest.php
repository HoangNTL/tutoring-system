<?php

namespace Tests\Feature\StudentTutorialPeriods;

use App\Enums\TutorialPeriodStatus;
use App\Enums\UserRole;
use App\Models\TutorialPeriod;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class StudentTutorialPeriodListingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Http::fake([
            '*' => Http::response([
                'success' => true,
                'data' => [
                    ['id' => 296, 'name' => 'HK1 2024-2025'],
                    ['id' => 297, 'name' => 'HK2 2024-2025'],
                ],
            ], 200),
        ]);
    }

    public function test_unauthenticated_user_is_blocked(): void
    {
        $this->getJson('/api/v1/student/tutorial-periods')->assertUnauthorized();
    }

    public function test_non_student_user_is_blocked(): void
    {
        $admin = User::factory()->admin()->create();

        $this
            ->actingAs($admin, 'web')
            ->getJson('/api/v1/student/tutorial-periods')
            ->assertForbidden();
    }

    public function test_student_can_access_open_tutorial_periods(): void
    {
        $student = User::factory()->create([
            'role' => UserRole::STUDENT,
        ]);

        $openPeriod = $this->createTutorialPeriod(
            TutorialPeriodStatus::OPEN,
            'Đợt phụ đạo HK1',
            296,
            '2026-05-18 08:00:00'
        );

        $response = $this
            ->actingAs($student, 'web')
            ->getJson('/api/v1/student/tutorial-periods');

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonFragment([
                'id' => $openPeriod->id,
                'title' => 'Đợt phụ đạo HK1',
                'status' => TutorialPeriodStatus::OPEN->name,
                'academicPeriod' => [
                    'id' => 296,
                    'name' => 'HK1 2024-2025',
                ],
            ]);
    }

    public function test_student_only_sees_open_periods(): void
    {
        $student = User::factory()->create([
            'role' => UserRole::STUDENT,
        ]);

        $openPeriod = $this->createTutorialPeriod(
            TutorialPeriodStatus::OPEN,
            'Open Period',
            296,
            '2026-05-20 08:00:00'
        );
        $draftPeriod = $this->createTutorialPeriod(
            TutorialPeriodStatus::DRAFT,
            'Draft Period',
            297,
            '2026-05-21 08:00:00'
        );
        $closedPeriod = $this->createTutorialPeriod(
            TutorialPeriodStatus::CLOSED,
            'Closed Period',
            296,
            '2026-05-22 08:00:00'
        );

        $response = $this
            ->actingAs($student, 'web')
            ->getJson('/api/v1/student/tutorial-periods');

        $response
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $openPeriod->id);

        $returnedIds = collect($response->json('data'))
            ->pluck('id')
            ->all();

        $this->assertSame([$openPeriod->id], $returnedIds);
        $this->assertNotContains($draftPeriod->id, $returnedIds);
        $this->assertNotContains($closedPeriod->id, $returnedIds);
    }

    public function test_response_does_not_include_admin_only_fields(): void
    {
        $student = User::factory()->create([
            'role' => UserRole::STUDENT,
        ]);

        $this->createTutorialPeriod(
            TutorialPeriodStatus::OPEN,
            'Open Period',
            296,
            '2026-05-20 08:00:00'
        );

        $response = $this
            ->actingAs($student, 'web')
            ->getJson('/api/v1/student/tutorial-periods');

        $response->assertOk();

        foreach ($response->json('data') as $item) {
            $this->assertArrayNotHasKey('createdBy', $item);
            $this->assertArrayNotHasKey('permissions', $item);
            $this->assertArrayNotHasKey('createdAt', $item);
            $this->assertArrayNotHasKey('updatedAt', $item);
        }
    }

    private function createTutorialPeriod(
        TutorialPeriodStatus $status,
        string $title,
        int $academicPeriodId,
        string $registrationStartAt
    ): TutorialPeriod {
        return TutorialPeriod::create([
            'academic_period_id' => $academicPeriodId,
            'title' => $title,
            'description' => $title . ' description',
            'registration_start_at' => $registrationStartAt,
            'registration_end_at' => '2026-05-21 17:00:00',
            'study_start_at' => '2026-05-22 08:00:00',
            'study_end_at' => '2026-05-31 17:00:00',
            'status' => $status,
            'created_by' => User::factory()->admin()->create()->id,
        ]);
    }
}
