<?php

namespace App\Services\External\Adapters;

class LegacyRoomAdapter
{
    /**
     * @param  array<int, array<string, mixed>>  $payload
     * @return array<int, array{id:int,code:string,name:string,capacity:int}>
     */
    public function adaptMany(array $payload): array
    {
        $rooms = [];

        foreach ($payload as $room) {
            if (empty($room['id']) || empty($room['code']) || empty($room['name'])) {
                continue;
            }

            $rooms[] = [
                'id' => (int) $room['id'],
                'code' => (string) $room['code'],
                'name' => (string) $room['name'],
                'capacity' => (int) ($room['capacity'] ?? 0),
            ];
        }

        return $rooms;
    }
}
