<?php
/**
 * Cron Job: Sync Inventory
 * Runs every 5 minutes to sync product inventory from Meta Commerce
 */

declare(strict_types=1);

// Load environment and autoloader
require_once dirname(__DIR__) . '/vendor/autoload.php';

use Sunjida\Config\Env;
use Sunjida\Config\Database;
use Sunjida\Models\Shop;
use Sunjida\Services\InventorySyncService;
use Sunjida\Utils\Logger;

// Initialize
Env::load(dirname(__DIR__) . '/.env');
$db = Database::getConnection();
$logger = new Logger();
$syncService = new InventorySyncService();

$logger->info('Starting inventory sync cron job');

try {
    // Get all shops with Meta connected
    $stmt = $db->prepare('
        SELECT id, name, meta_access_token
        FROM shops
        WHERE meta_access_token IS NOT NULL
        AND meta_token_expires_at > NOW()
    ');
    $stmt->execute();
    $shops = $stmt->fetchAll();

    $logger->info("Found " . count($shops) . " shops with active Meta connections");

    foreach ($shops as $shop) {
        try {
            // TODO: Fetch products from Meta Commerce API
            // For now, log that we would sync
            $logger->info("Syncing inventory for shop: {$shop['name']}", ['shop_id' => $shop['id']]);

            // Placeholder for actual Meta API call
            // $products = $metaService->getProducts($shop['meta_access_token']);
            // $results = $syncService->syncProducts((int)$shop['id'], $products);
            // $logger->info("Sync results", $results);

        } catch (\Exception $e) {
            $logger->error("Failed to sync shop {$shop['id']}", [
                'error' => $e->getMessage(),
            ]);
        }
    }

    $logger->info('Inventory sync cron job completed');

} catch (\Exception $e) {
    $logger->critical('Inventory sync cron job failed', [
        'error' => $e->getMessage(),
    ]);
    exit(1);
}
