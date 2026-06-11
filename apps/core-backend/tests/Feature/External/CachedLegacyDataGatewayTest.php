<?php

namespace Tests\Feature\External;

use App\Contracts\LegacyDataGateway;
use App\Services\External\CachedLegacyDataGateway;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class CachedLegacyDataGatewayTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();
    }

    public function test_legacy_data_gateway_is_resolved_through_cache_decorator(): void
    {
        $gateway = app(LegacyDataGateway::class);

        $this->assertInstanceOf(CachedLegacyDataGateway::class, $gateway);
    }

    public function test_fetch_legacy_periods_is_cached_across_calls(): void
    {
        Http::fake([
            '*' => Http::response([
                'success' => true,
                'data' => [
                    ['id' => 20261, 'name' => 'Legacy Period 20261'],
                ],
            ], 200),
        ]);

        $gateway = app(LegacyDataGateway::class);

        $first = $gateway->fetchLegacyPeriods();
        $second = $gateway->fetchLegacyPeriods();

        $this->assertSame($first, $second);

        Http::assertSentCount(1);
        Http::assertSent(fn (Request $request): bool => str_contains($request->url(), '/legacy/periods'));
    }

    public function test_fetch_student_info_by_id_is_cached_across_calls(): void
    {
        Http::fake([
            '*' => Http::response([
                'success' => true,
                'data' => [
                    'studentCode' => '5001866',
                    'lastName' => 'Nguyen Van',
                    'firstName' => 'A',
                    'fullName' => 'Nguyen Van A',
                ],
            ], 200),
        ]);

        $gateway = app(LegacyDataGateway::class);

        $first = $gateway->fetchStudentInfoByLegacyStudentId(88);
        $second = $gateway->fetchStudentInfoByLegacyStudentId(88);

        $this->assertSame($first, $second);

        Http::assertSentCount(1);
        Http::assertSent(fn (Request $request): bool => str_contains($request->url(), '/legacy/students/by-id/88'));
    }
}
