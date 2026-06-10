<?php

namespace App\Services\External\Adapters;

class LegacyLecturerAdapter
{
    /**
     * @param  array<int, array<string, mixed>>  $payload
     * @return array<int, array{id:int,code:string,fullName:string,departmentName:string}>
     */
    public function adaptManyForDepartment(array $payload): array
    {
        $lecturers = [];

        foreach ($payload as $lecturer) {
            if (empty($lecturer['id']) || empty($lecturer['code'])) {
                continue;
            }

            $lecturers[] = [
                'id' => (int) $lecturer['id'],
                'code' => (string) $lecturer['code'],
                'fullName' => trim((string) ($lecturer['fullName'] ?? $lecturer['code'] ?? '')),
                'departmentName' => (string) ($lecturer['departmentName'] ?? ''),
            ];
        }

        return $lecturers;
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array{legacy_id:int,username:string,code:string,name:string,date_of_birth:mixed}|null
     */
    public function adaptForImport(array $payload): ?array
    {
        if (
            empty($payload['id']) ||
            empty($payload['lecturerCode'])
        ) {
            return null;
        }

        return [
            'legacy_id' => (int) $payload['id'],
            'username' => (string) $payload['lecturerCode'],
            'code' => (string) $payload['lecturerCode'],
            'name' => trim((string) ($payload['lecturerName'] ?? $payload['lecturerCode'] ?? '')),
            'date_of_birth' => $payload['dateOfBirth'] ?? null,
        ];
    }
}
