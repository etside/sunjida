<?php
/**
 * Vector Search Service
 * Performs semantic search over product embeddings
 */

declare(strict_types=1);

namespace Sunjida\Services;

use Sunjida\Config\Database;

class VectorSearchService
{
    private EmbeddingService $embeddingService;

    public function __construct()
    {
        $this->embeddingService = new EmbeddingService();
    }

    /**
     * Search products by semantic similarity
     */
    public function search(int $shopId, string $query, int $limit = 10): array
    {
        $queryEmbedding = $this->embeddingService->getEmbedding($query);

        if (empty($queryEmbedding)) {
            return [];
        }

        $db = Database::getConnection();
        $stmt = $db->prepare('
            SELECT id, name, description, price, sku, image_url,
                   1 - (embedding <=> :query_embedding::vector) as similarity
            FROM products
            WHERE shop_id = :shop_id
            AND embedding IS NOT NULL
            ORDER BY embedding <=> :query_embedding::vector
            LIMIT :limit
        ');
        $stmt->execute([
            'query_embedding' => json_encode($queryEmbedding),
            'shop_id' => $shopId,
            'limit' => $limit,
        ]);

        return $stmt->fetchAll();
    }
}
