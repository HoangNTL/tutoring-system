<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $departmentName = null;
        if ($this->role === \App\Enums\UserRole::DEPARTMENT && $this->department_id !== null) {
            try {
                $gateway = app(\App\Contracts\LegacyDataGateway::class);
                $departments = $gateway->fetchAllDepartments();
                $department = collect($departments)->firstWhere('legacy_id', $this->department_id);
                $departmentName = $department['name'] ?? null;
            } catch (\Throwable $e) {
                // Fallback to null
            }
        }

        $lecturerName = null;
        if ($this->role === \App\Enums\UserRole::LECTURER && $this->lecturer_id !== null) {
            try {
                $gateway = app(\App\Contracts\LegacyDataGateway::class);
                $lecturers = $gateway->fetchAllLecturers();
                $lecturer = collect($lecturers)->firstWhere('legacy_id', $this->lecturer_id);
                $lecturerName = $lecturer['full_name'] ?? null;
            } catch (\Throwable $e) {
                // Fallback to null
            }
        }

        $studentName = null;
        if ($this->role === \App\Enums\UserRole::STUDENT && $this->student_id !== null) {
            try {
                $gateway = app(\App\Contracts\LegacyDataGateway::class);
                $student = $gateway->fetchStudentInfoByLegacyStudentId($this->student_id);
                $studentName = $student['fullName'] ?? null;
            } catch (\Throwable $e) {
                // Fallback to null
            }
        }

        return [
            'id' => $this->id,
            'username' => $this->username,
            'role' => $this->role?->name,
            'studentId' => $this->student_id,
            'lecturerId' => $this->lecturer_id,
            'departmentId' => $this->department_id,
            'departmentName' => $departmentName,
            'lecturerName' => $lecturerName,
            'studentName' => $studentName,
            'createdAt' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
