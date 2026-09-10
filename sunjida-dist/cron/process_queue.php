<?php
/**
 * Cron Job: Process Queue
 * Runs every minute to process pending jobs
 */

declare(strict_types=1);

// Load environment and autoloader
require_once dirname(__DIR__) . '/vendor/autoload.php';

use Sunjida\Config\Env;
use Sunjida\Config\Database;
use Sunjida\Services\QueueService;
use Sunjida\Utils\Logger;

// Initialize
Env::load(dirname(__DIR__) . '/.env');
$db = Database::getConnection();
$logger = new Logger();
$queueService = new QueueService();

$logger->info('Starting queue processor cron job');

$processed = 0;
$errors = 0;
$maxJobs = 100; // Safety limit per run

try {
    while ($processed < $maxJobs) {
        $job = $queueService->processNext();

        if (!$job) {
            break; // No more jobs
        }

        if ($job->getStatus() === 'failed') {
            $errors++;
            $logger->warning("Job failed", [
                'job_id' => $job->getId(),
                'type' => $job->getJobType(),
                'error' => $job->getLastError(),
            ]);
        } else {
            $processed++;
            $logger->debug("Job completed", [
                'job_id' => $job->getId(),
                'type' => $job->getJobType(),
            ]);
        }
    }

    $logger->info("Queue processor completed", [
        'processed' => $processed,
        'errors' => $errors,
    ]);

} catch (\Exception $e) {
    $logger->critical('Queue processor cron job failed', [
        'error' => $e->getMessage(),
        'processed' => $processed,
    ]);
    exit(1);
}
