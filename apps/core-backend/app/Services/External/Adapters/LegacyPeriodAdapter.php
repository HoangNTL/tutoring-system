<?php

namespace App\Services\External\Adapters;

class LegacyPeriodAdapter
{
    /**
     * @param  array<int, array<string, mixed>>  $payload
     * @return array<int, array{id:int,name:string}>
     */
    public function adaptMany(array $payload): array
    {
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
}
