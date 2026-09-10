<?php
/**
 * Cron Job: Cleanup Logs
 * Runs daily to remove old log files and cache
 */

declare(strict_types=1);

// Load environment and autoloader
require_once dirname(__DIR__) . '/vendor/autoload.php';

use Sunjida\Config\Env;
use Sunjida\Utils\Logger;

// Initialize
Env::load(dirname(__DIR__) . '/.env');
$logger = new Logger();

$logger->info('Starting cleanup cron job');

$baseDir = dirname(__DIR__);
$daysToKeep = 30;

try {
    // Cleanup log files
    $logDir = $baseDir . '/logs';
    if (is_dir($logDir)) {
        $files = glob($logDir . '/*.log');
        $removed = 0;

        foreach ($files as $file) {
            if (filemtime($file) < time() - ($daysToKeep * 86400)) {
                unlink($file);
                $removed++;
            }
        }

        $logger->info("Cleaned up {$removed} log files older than {$daysToKeep} days");
    }

    // Cleanup rate limit cache
    $cacheDir = $baseDir . '/cache/ratelimit';
    if (is_dir($cacheDir)) {
        $files = glob($cacheDir . '/*.json');
        $removed = 0;

        foreach ($files as $file) {
            if (filemtime($file) < time() - 86400) { // Remove cache older than 1 day
                unlink($file);
                $removed++;
            }
        }

        $logger->info("Cleaned up {$removed} rate limit cache files");
    }

    // Cleanup temp files
    $tempDir = $baseDir . '/tmp';
    if (is_dir($tempDir)) {
        $files = glob($tempDir . '/*');
        $removed = 0;

        foreach ($files as $file) {
            if (is_file($file) && filemtime($file) < time() - 86400) {
                unlink($file);
                $removed++;
            }
        }

        $logger->info("Cleaned up {$removed} temp files");
    }

    $logger->info('Cleanup cron job completed');

} catch (\Exception $e) {
    $logger->critical('Cleanup cron job failed', [
        'error' => $e->getMessage(),
    ]);
    exit(1);
}
