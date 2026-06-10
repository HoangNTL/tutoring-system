<?php

namespace App\Services\External\Adapters;

class LegacyStudentCourseAdapter
{
    /**
     * @param  array<int, array<string, mixed>>  $payload
     * @return array<int, array{courseCode:string,courseName:string,credits:int}>
     */
    public function adaptMany(array $payload): array
    {
        $courses = [];

        foreach ($payload as $course) {
            if (
                empty($course['courseCode']) ||
                empty($course['courseName'])
            ) {
                continue;
            }

            $courses[] = [
                'courseCode' => (string) $course['courseCode'],
                'courseName' => (string) $course['courseName'],
                'credits' => (int) ($course['credits'] ?? 0),
            ];
        }

        return $courses;
    }
}
