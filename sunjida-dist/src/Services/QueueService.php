<?php
/**
 * Queue Service
 * Manages job queue for async task processing
 */

declare(strict_types=1);

namespace Sunjida\Services;

use Sunjida\Models\Queue;

class QueueService
{
    /**
     * Enqueue a job
     */
    public function enqueue(string $jobType, array $payload, ?string $runAt = null): Queue
    {
        return Queue::enqueue($jobType, $payload, $runAt);
    }

    /**
     * Process next job in queue
     */
    public function processNext(): ?Queue
    {
        $job = Queue::dequeue();

        if (!$job) {
            return null;
        }

        try {
            $this->executeJob($job);
            $job->complete();
        } catch (\Exception $e) {
            $job->fail($e->getMessage());
        }

        return $job;
    }

    /**
     * Execute a job by type
     */
    private function executeJob(Queue $job): void
    {
        match ($job->getJobType()) {
            'product_sync' => $this->handleProductSync($job->getPayload()),
            'embedding_generate' => $this->handleEmbeddingGenerate($job->getPayload()),
            'inventory_update' => $this->handleInventoryUpdate($job->getPayload()),
            default => throw new \RuntimeException("Unknown job type: {$job->getJobType()}"),
        };
    }

    private function handleProductSync(array $payload): void
    {
        $service = new InventorySyncService();
        $service->syncProducts($payload['shop_id'], $payload['products'] ?? []);
    }

    private function handleEmbeddingGenerate(array $payload): void
    {
        $service = new EmbeddingService();
        // TODO: Implement embedding generation job
    }

    private function handleInventoryUpdate(array $payload): void
    {
        $service = new InventorySyncService();
        $service->updateInventory($payload['product_id'], $payload['quantity']);
    }
}
