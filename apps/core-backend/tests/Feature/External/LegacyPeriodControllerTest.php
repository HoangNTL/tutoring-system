<?php

namespace Tests\Feature\External;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class LegacyPeriodControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_legacy_periods_route_requires_authentication(): void
    {
        $this->getJson('/api/v1/legacy/periods')->assertUnauthorized();
    }

    public function test_authenticated_users_can_fetch_legacy_periods(): void
    {
        Http::fake([
            '*' => Http::response([
                'success' => true,
                'data' => [
                    ['id' => 3, 'name' => 'Term 3'],
                    ['id' => 2, 'name' => 'Term 2'],
                ],
            ], 200),
        ]);

        $user = User::create([
            'username' => 'admin_legacy_periods',
            'password_hash' => 'password123',
            'role' => UserRole::ADMIN,
        ]);

        $this
            ->actingAs($user, 'web')
            ->getJson('/api/v1/legacy/periods')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Legacy periods retrieved successfully')
            ->assertJsonPath('data.0.id', 3)
            ->assertJsonPath('data.0.name', 'Term 3');
    }
}
