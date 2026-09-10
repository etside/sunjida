<?php
/**
 * Inventory Sync Service
 * Synchronizes inventory data from external sources
 */

declare(strict_types=1);

namespace Sunjida\Services;

use Sunjida\Models\Product;
use Sunjida\Models\Inventory;

class InventorySyncService
{
    private EmbeddingService $embeddingService;

    public function __construct()
    {
        $this->embeddingService = new EmbeddingService();
    }

    /**
     * Sync products from external source
     */
    public function syncProducts(int $shopId, array $products): array
    {
        $results = [
            'created' => 0,
            'updated' => 0,
            'errors' => [],
        ];

        foreach ($products as $productData) {
            try {
                $existing = $this->findExistingProduct($shopId, $productData['sku'] ?? null);

                if ($existing) {
                    $existing->update($productData);
                    $results['updated']++;
                } else {
                    $productData['shop_id'] = $shopId;
                    $product = Product::create($productData);
                    $this->embeddingService->generateEmbedding($product);
                    $results['created']++;
                }
            } catch (\Exception $e) {
                $results['errors'][] = [
                    'sku' => $productData['sku'] ?? 'unknown',
                    'error' => $e->getMessage(),
                ];
            }
        }

        return $results;
    }

    /**
     * Update inventory quantity
     */
    public function updateInventory(int $productId, int $quantity): Inventory
    {
        $product = Product::findById($productId);
        if (!$product) {
            throw new \RuntimeException("Product not found: {$productId}");
        }

        return Inventory::upsert($productId, $product->getShopId(), $quantity);
    }

    /**
     * Find existing product by SKU
     */
    private function findExistingProduct(int $shopId, ?string $sku): ?Product
    {
        if ($sku === null) {
            return null;
        }

        // TODO: Implement SKU lookup
        return null;
    }
}
