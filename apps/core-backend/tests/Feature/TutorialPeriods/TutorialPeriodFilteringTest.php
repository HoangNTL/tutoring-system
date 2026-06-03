<?php

namespace Tests\Feature\TutorialPeriods;

use App\Enums\TutorialPeriodStatus;
use App\Enums\UserRole;
use App\Models\TutorialPeriod;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TutorialPeriodFilteringTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Http::fake([
            '*' => Http::response([
                'success' => true,
                'data' => [
                    ['id' => 20261, 'name' => 'Legacy Period 20261'],
                    ['id' => 20262, 'name' => 'Legacy Period 20262'],
                ],
            ], 200),
        ]);
    }

    public function test_status_filter_uses_stored_status_column(): void
    {
        $admin = $this->createAdmin();

        $draft = $this->createTutorialPeriod($admin->id, TutorialPeriodStatus::DRAFT, 'Draft Period');
        $open = $this->createTutorialPeriod($admin->id, TutorialPeriodStatus::OPEN, 'Open Period');
        $cancelled = $this->createTutorialPeriod($admin->id, TutorialPeriodStatus::CANCELLED, 'Cancelled Period');

        $response = $this
            ->actingAs($admin, 'web')
            ->getJson('/api/v1/tutorial-periods?status=OPEN');

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $open->id);

        $returnedIds = collect($response->json('data'))
            ->pluck('id')
            ->all();

        $this->assertSame([$open->id], $returnedIds);
        $this->assertNotContains($draft->id, $returnedIds);
        $this->assertNotContains($cancelled->id, $returnedIds);
    }

    public function test_resource_exposes_single_status_and_academic_period_without_phase(): void
    {
        $admin = $this->createAdmin();

        $draft = $this->createTutorialPeriod($admin->id, TutorialPeriodStatus::DRAFT, 'Draft Period');
        $open = $this->createTutorialPeriod($admin->id, TutorialPeriodStatus::OPEN, 'Open Period');

        $response = $this
            ->actingAs($admin, 'web')
            ->getJson('/api/v1/tutorial-periods');

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonFragment([
                'id' => $draft->id,
                'status' => TutorialPeriodStatus::DRAFT->name,
                'academicPeriod' => [
                    'id' => 20261,
                    'name' => 'Legacy Period 20261',
                ],
            ])
            ->assertJsonFragment([
                'id' => $open->id,
                'status' => TutorialPeriodStatus::OPEN->name,
                'academicPeriod' => [
                    'id' => 20261,
                    'name' => 'Legacy Period 20261',
                ],
            ]);

        foreach ($response->json('data') as $item) {
            $this->assertArrayNotHasKey('phase', $item);
        }
    }

    private function createAdmin(): User
    {
        return User::create([
            'username' => 'admin_filter',
            'password_hash' => 'password123',
            'role' => UserRole::ADMIN,
        ]);
    }

    private function createTutorialPeriod(
        int $createdBy,
        TutorialPeriodStatus $status,
        string $title,
        string $registrationStartAt = '2026-06-10 08:00:00',
        string $registrationEndAt = '2026-06-12 17:00:00',
        string $studyStartAt = '2026-06-15 08:00:00',
        string $studyEndAt = '2026-06-20 17:00:00'
    ): TutorialPeriod {
        return TutorialPeriod::create([
            'academic_period_id' => 20261,
            'title' => $title,
            'description' => $title . ' description',
            'registration_start_at' => $registrationStartAt,
            'registration_end_at' => $registrationEndAt,
            'study_start_at' => $studyStartAt,
            'study_end_at' => $studyEndAt,
            'status' => $status,
            'created_by' => $createdBy,
        ]);
    }
}
