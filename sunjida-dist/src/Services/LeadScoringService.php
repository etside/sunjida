<?php
/**
 * Lead Scoring Service
 * Calculates lead scores based on conversation signals
 */

declare(strict_types=1);

namespace Sunjida\Services;

use Sunjida\Config\Database;
use Sunjida\Models\Conversation;

class LeadScoringService
{
    /**
     * Calculate lead score for a conversation
     */
    public function calculateScore(Conversation $conversation): float
    {
        $messages = $conversation->getMessages();
        $score = 0.0;

        // Signal weights
        $signals = [
            'price_inquiry' => 0.3,
            'bulk_order' => 0.25,
            'contact_exchange' => 0.2,
            'urgency_words' => 0.15,
            'return_customer' => 0.1,
        ];

        foreach ($messages as $message) {
            $content = strtolower($message['content']);

            // Check for price inquiries
            if (preg_match('/price|cost|taka|bdt|\$/', $content)) {
                $score += $signals['price_inquiry'];
            }

            // Check for bulk order signals
            if (preg_match('/bulk|wholesale|quantity|pieces|sets/', $content)) {
                $score += $signals['bulk_order'];
            }

            // Check for contact exchange
            if (preg_match('/phone|number|address|delivery|ship/', $content)) {
                $score += $signals['contact_exchange'];
            }

            // Check for urgency
            if (preg_match('/urgent|asap|quickly|today|now|immediate/', $content)) {
                $score += $signals['urgency_words'];
            }
        }

        // Cap at 1.0
        $score = min($score, 1.0);

        // Update conversation score
        $db = Database::getConnection();
        $stmt = $db->prepare('UPDATE conversations SET lead_score = :score WHERE id = :id');
        $stmt->execute(['score' => $score, 'id' => $conversation->getId()]);

        return $score;
    }

    /**
     * Get lead scores for a shop
     */
    public function getShopLeads(int $shopId, int $limit = 50): array
    {
        $db = Database::getConnection();
        $stmt = $db->prepare('
            SELECT c.*, u.name as customer_name, u.email as customer_email
            FROM conversations c
            LEFT JOIN users u ON c.external_id = u.email
            WHERE c.shop_id = :shop_id
            AND c.lead_score IS NOT NULL
            ORDER BY c.lead_score DESC
            LIMIT :limit
        ');
        $stmt->execute(['shop_id' => $shopId, 'limit' => $limit]);

        return $stmt->fetchAll();
    }
}
