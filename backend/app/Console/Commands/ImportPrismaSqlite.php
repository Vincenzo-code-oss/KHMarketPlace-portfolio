<?php

namespace App\Console\Commands;

use App\Services\LegacyPrismaImporter;
use Illuminate\Console\Command;
use PDO;
use RuntimeException;

class ImportPrismaSqlite extends Command
{
    protected $signature = 'marketplace:import-prisma-sqlite {path? : Path to the existing Prisma SQLite database}';

    protected $description = 'Import existing KHMarket Prisma SQLite records into the configured Laravel database';

    public function handle(LegacyPrismaImporter $importer): int
    {
        $path = $this->argument('path') ?: base_path('../dev.db');
        $path = realpath($path);
        if (! $path || ! is_file($path)) {
            $this->components->error('The source SQLite database file does not exist.');

            return self::FAILURE;
        }

        try {
            $hash = hash_file('sha256', $path);
            if ($hash === false) {
                throw new RuntimeException('Unable to calculate the source database fingerprint.');
            }

            $source = new PDO('sqlite:'.$path, null, null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::SQLITE_ATTR_OPEN_FLAGS => PDO::SQLITE_OPEN_READONLY,
            ]);
            $counts = $importer->import($source, $hash);
        } catch (\Throwable $exception) {
            $this->components->error($exception->getMessage());

            return self::FAILURE;
        }

        $this->components->info('Legacy marketplace data imported successfully.');
        foreach ($counts as $table => $count) {
            $this->line($table.': '.$count);
        }

        return self::SUCCESS;
    }
}
