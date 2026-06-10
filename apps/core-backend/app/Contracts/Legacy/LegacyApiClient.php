<?php

namespace App\Contracts\Legacy;

interface LegacyApiClient
{
    /**
     * @return array<int, array{id:int,name:string}>
     */
    public function fetchLegacyPeriods(): array;

    /**
     * @return array<int, array{courseCode:string,courseName:string,credits:int}>
     */
    public function fetchStudentCoursesByLegacyStudentId(int $studentId, int $periodId): array;

    /**
     * @return array<int, array{courseCode:string,courseName:string,credits:int}>
     */
    public function fetchStudentCoursesByStudentCode(string $studentCode, int $periodId): array;

    /**
     * @return array{studentCode:string,lastName:string,firstName:string,fullName:string}|null
     */
    public function fetchStudentInfoByLegacyStudentId(int $studentId): ?array;

    /**
     * @return array{studentCode:string,lastName:string,firstName:string,fullName:string}|null
     */
    public function fetchStudentInfoByStudentCode(string $studentCode): ?array;

    /**
     * @return array<int, array{legacy_id:int,username:string,date_of_birth:mixed}>
     */
    public function fetchAllStudents(): array;

    /**
     * @return array<int, array{legacy_id:int,username:string,code:string,name:string,date_of_birth:mixed}>
     */
    public function fetchAllLecturers(): array;

    /**
     * @return array<int, array{id:int,code:string,fullName:string,departmentName:string}>
     */
    public function fetchLecturersByDepartment(int $departmentId): array;

    /**
     * @return array<int, array{id:int,code:string,name:string,capacity:int}>
     */
    public function fetchRooms(): array;

    /**
     * @return array<int, array{legacy_id:int,username:string}>
     */
    public function fetchAllDepartments(): array;
}
