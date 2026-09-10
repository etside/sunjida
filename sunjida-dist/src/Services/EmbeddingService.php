<?php
namespace Services;

use Models\Product;

class EmbeddingService
{
    private LovableService $lovable;

    public function __construct()
    {
        $this->lovable = new LovableService();
    }

    public function embedText(string $text): array
    {
        return $this->lovable->embed($text);
    }

    public function embedProduct(array $product): array
    {
        $text = "{$product['title']}. {$product['description']}. Price: {$product['price']}. SKU: {$product['sku'] ?? 'N/A'}";
        return $this->embedText($text);
    }

    public function embedProducts(int $shopId, int $batchSize = 10): int
    {
        $products = Product::getProductsNeedingEmbedding($shopId, $batchSize);
        $count = 0;
        foreach ($products as $product) {
            try {
                $embedding = $this->embedProduct($product);
                if (!empty($embedding)) {
                    Product::updateEmbedding($product['id'], json_encode($embedding));
                    $count++;
                }
            } catch (\Exception $e) {
                error_log("Embedding failed for product {$product['id']}: " . $e->getMessage());
            }
        }
        return $count;
    }

    public function cosineSimilarity(array $a, array $b): float
    {
        if (count($a) !== count($b) || empty($a)) return 0;
        $dotProduct = $normA = $normB = 0;
        for ($i = 0; $i < count($a); $i++) {
            $dotProduct += $a[$i] * $b[$i];
            $normA += $a[$i] ** 2;
            $normB += $b[$i] ** 2;
        }
        $normA = sqrt($normA);
        $normB = sqrt($normB);
        return ($normA && $normB) ? $dotProduct / ($normA * $normB) : 0;
    }
}
