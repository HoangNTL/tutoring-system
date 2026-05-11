<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\LegacyImportService;

class ImportLegacyUsersCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:legacy-users';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import users from legacy system';

    /**
     * Execute the console command.
     */
    public function handle(
        LegacyImportService $legacyImportService
 ): int {

        $this->info('Starting import...');

        try {

            $this->info('Importing students...');
            $legacyImportService->importStudents();

            $this->info('Importing lecturers...');
            $legacyImportService->importLecturers();

            $this->info('Importing departments...');
            $legacyImportService->importDepartments();

            $this->info('Import completed successfully.');

            return self::SUCCESS;

        } catch (\Throwable $e) {

            $this->error($e->getMessage());

            return self::FAILURE;
        }
    }
}
