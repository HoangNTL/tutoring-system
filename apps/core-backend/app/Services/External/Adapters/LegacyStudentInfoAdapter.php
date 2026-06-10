<?php

namespace App\Services\External\Adapters;

class LegacyStudentInfoAdapter
{
    /**
     * @param  array<string, mixed>|null  $payload
     * @return array{studentCode:string,lastName:string,firstName:string,fullName:string}|null
     */
    public function adapt(?array $payload): ?array
    {
        if (!is_array($payload) || empty($payload['studentCode'])) {
            return null;
        }

        return [
            'studentCode' => (string) $payload['studentCode'],
            'lastName' => (string) ($payload['lastName'] ?? ''),
            'firstName' => (string) ($payload['firstName'] ?? ''),
            'fullName' => (string) ($payload['fullName'] ?? ''),
        ];
    }
}
