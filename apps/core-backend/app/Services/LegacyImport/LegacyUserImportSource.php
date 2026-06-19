<?php

namespace App\Services\LegacyImport;

use App\Enums\UserRole;

interface LegacyUserImportSource
{
    public function role(): UserRole;

    public function legacyColumn(): string;

    /**
     * @return array<int, array{legacyId:int,username:string,passwordSeed:?string}>
     */
    public function records(): array;
}
