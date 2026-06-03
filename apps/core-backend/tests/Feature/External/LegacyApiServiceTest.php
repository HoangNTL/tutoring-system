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
}
