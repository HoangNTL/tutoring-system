<?php

namespace App\Services\External\Adapters;

class LegacyImportedUserAdapter
{
    /**
     * @param  array<string, mixed>  $payload
     * @return array{legacy_id:int,username:string,date_of_birth:mixed}|null
     */
    public function adaptStudent(array $payload): ?array
    {
        if (
            empty($payload['id']) ||
            empty($payload['studentCode'])
        ) {
            return null;
        }

        return [
            'legacy_id' => (int) $payload['id'],
            'username' => (string) $payload['studentCode'],
            'date_of_birth' => $payload['dateOfBirth'] ?? null,
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array{legacy_id:int,username:string}|null
     */
    public function adaptDepartment(array $payload): ?array
    {
        if (empty($payload['id'])) {
            return null;
        }

        return [
            'legacy_id' => (int) $payload['id'],
            'username' => 'bm' . $payload['id'],
        ];
    }
}
