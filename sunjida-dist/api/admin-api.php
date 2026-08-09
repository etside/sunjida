<?php
/**
 * SalesDaddy Admin API — CRUD for keys, training, responses, presets
 */

require_once __DIR__ . '/config.php';
corsHeaders();
requireAuth();

$db = getDB();
$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true) ?? [];

switch ($action) {

    // ── Dashboard ───────────────────────────────────────────────────
    case 'dashboard':
        $keys = $db->query('SELECT COUNT(*) as c FROM api_keys WHERE is_active=1')->fetch()['c'];
        $training = $db->query('SELECT COUNT(*) as c FROM training_data WHERE is_active=1')->fetch()['c'];
        $responses = $db->query('SELECT COUNT(*) as c FROM auto_responses WHERE is_active=1')->fetch()['c'];
        jsonResponse(['keys' => $keys, 'training' => $training, 'responses' => $responses]);
        break;

    // ── API Keys ────────────────────────────────────────────────────
    case 'keys':
        if ($method === 'GET') {
            $rows = $db->query('SELECT id, provider, label, service_type, model, priority, is_active, monthly_limit, monthly_used, rate_limit_rpm, api_key FROM api_keys ORDER BY priority DESC, id ASC')->fetchAll();
            // Mask API keys for display
            foreach ($rows as &$r) {
                $key = $r['api_key'];
                $r['api_key_preview'] = strlen($key) > 8 ? substr($key, 0, 4) . '****' . substr($key, -4) : '****';
                unset($r['api_key']);
            }
            jsonResponse(['keys' => $rows]);
        }
        if ($method === 'POST') {
            $stmt = $db->prepare('INSERT INTO api_keys (provider, service_type, api_key, model, label, priority, monthly_limit, rate_limit_rpm, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
            $stmt->execute([
                $input['provider'] ?? 'other',
                $input['service_type'] ?? 'both',
                encryptKey($input['api_key'] ?? ''),
                $input['model'] ?? null,
                $input['label'] ?? null,
                $input['priority'] ?? 0,
                $input['monthly_limit'] ?? 0,
                $input['rate_limit_rpm'] ?? 60,
                $input['is_active'] ?? 1,
            ]);
            jsonResponse(['success' => true, 'id' => $db->lastInsertId()]);
        }
        if ($method === 'DELETE') {
            $id = $input['id'] ?? 0;
            if (($input['action'] ?? '') === 'toggle') {
                $db->prepare('UPDATE api_keys SET is_active = NOT is_active WHERE id = ?')->execute([$id]);
            } else {
                $db->prepare('DELETE FROM api_keys WHERE id = ?')->execute([$id]);
            }
            jsonResponse(['success' => true]);
        }
        break;

    // ── Training Data ───────────────────────────────────────────────
    case 'training':
        if ($method === 'GET') {
            $rows = $db->query('SELECT id, title, category, data_type, language, is_active, LEFT(content, 100) as preview FROM training_data ORDER BY id DESC LIMIT 100')->fetchAll();
            jsonResponse(['entries' => $rows]);
        }
        if ($method === 'POST') {
            $stmt = $db->prepare('INSERT INTO training_data (business_id, category, title, content, data_type, keywords, language, is_active, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
            $stmt->execute([
                $input['business_id'] ?? null,
                $input['category'] ?? 'general',
                $input['title'] ?? '',
                $input['content'] ?? '',
                $input['data_type'] ?? 'text',
                $input['keywords'] ?? null,
                $input['language'] ?? 'bn',
                $input['is_active'] ?? 1,
                $_SESSION['sd_admin_id'] ?? null,
            ]);
            jsonResponse(['success' => true, 'id' => $db->lastInsertId()]);
        }
        if ($method === 'DELETE') {
            $id = $input['id'] ?? 0;
            $db->prepare('DELETE FROM training_data WHERE id = ?')->execute([$id]);
            jsonResponse(['success' => true]);
        }
        break;

    // ── Training Upload (CSV) ───────────────────────────────────────
    case 'training-upload':
        if (!empty($_FILES['training_file'])) {
            $file = $_FILES['training_file']['tmp_name'];
            $ext = strtolower(pathinfo($_FILES['training_file']['name'], PATHINFO_EXTENSION));
            $count = 0;

            if ($ext === 'csv') {
                $handle = fopen($file, 'r');
                $header = fgetcsv($handle); // skip header
                while (($row = fgetcsv($handle)) !== false) {
                    $db->prepare('INSERT INTO training_data (category, data_type, title, keywords, content, language, is_active, created_by) VALUES (?, ?, ?, ?, ?, ?, 1, ?)')
                       ->execute([$row[0] ?? 'general', $row[1] ?? 'text', $row[2] ?? '', $row[3] ?? '', $row[4] ?? '', $row[5] ?? 'bn', $_SESSION['sd_admin_id'] ?? null]);
                    $count++;
                }
                fclose($handle);
            } elseif ($ext === 'txt') {
                $lines = file($file, FILE_IGNORE_NEW_LINES);
                foreach ($lines as $line) {
                    $line = trim($line);
                    if (!$line) continue;
                    $db->prepare('INSERT INTO training_data (category, data_type, title, content, language, is_active, created_by) VALUES (?, ?, ?, ?, ?, 1, ?)')
                       ->execute(['general', 'text', 'Uploaded line', $line, 'bn', $_SESSION['sd_admin_id'] ?? null]);
                    $count++;
                }
            } elseif ($ext === 'json') {
                $json = json_decode(file_get_contents($file), true);
                if (is_array($json)) {
                    foreach ($json as $item) {
                        $db->prepare('INSERT INTO training_data (category, data_type, title, content, keywords, language, is_active, created_by) VALUES (?, ?, ?, ?, ?, ?, 1, ?)')
                           ->execute([$item['category'] ?? 'general', $item['type'] ?? 'text', $item['title'] ?? '', $item['content'] ?? '', $item['keywords'] ?? '', $item['language'] ?? 'bn', $_SESSION['sd_admin_id'] ?? null]);
                        $count++;
                    }
                }
            }
            jsonResponse(['success' => true, 'imported' => $count, 'message' => "Imported {$count} training entries"]);
        }
        jsonResponse(['error' => 'No file uploaded'], 400);
        break;

    // ── Auto Responses ──────────────────────────────────────────────
    case 'responses':
        if ($method === 'GET') {
            $rows = $db->query('SELECT id, keyword, match_type, response_text, response_type, response_audio_url, is_active, priority FROM auto_responses ORDER BY priority DESC, id DESC')->fetchAll();
            jsonResponse(['responses' => $rows]);
        }
        if ($method === 'POST') {
            $stmt = $db->prepare('INSERT INTO auto_responses (business_id, keyword, response_text, response_audio_url, response_type, match_type, priority, is_active, language) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
            $stmt->execute([
                $input['business_id'] ?? null,
                $input['keyword'] ?? '',
                $input['response_text'] ?? '',
                $input['response_audio_url'] ?? null,
                $input['response_type'] ?? 'text',
                $input['match_type'] ?? 'contains',
                $input['priority'] ?? 0,
                $input['is_active'] ?? 1,
                $input['language'] ?? 'bn',
            ]);
            jsonResponse(['success' => true, 'id' => $db->lastInsertId()]);
        }
        if ($method === 'DELETE') {
            $id = $input['id'] ?? 0;
            $db->prepare('DELETE FROM auto_responses WHERE id = ?')->execute([$id]);
            jsonResponse(['success' => true]);
        }
        break;

    // ── Voice Presets ───────────────────────────────────────────────
    case 'presets':
        if ($method === 'GET') {
            $rows = $db->query('SELECT id, name, provider, voice_id, model_id, stability, similarity_boost, speed, language, is_default FROM voice_presets ORDER BY is_default DESC, id ASC')->fetchAll();
            jsonResponse(['presets' => $rows]);
        }
        if ($method === 'POST') {
            $stmt = $db->prepare('INSERT INTO voice_presets (business_id, name, provider, voice_id, model_id, stability, similarity_boost, speed, language, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
            $stmt->execute([
                $input['business_id'] ?? null,
                $input['name'] ?? '',
                $input['provider'] ?? 'elevenlabs',
                $input['voice_id'] ?? null,
                $input['model_id'] ?? null,
                $input['stability'] ?? 0.5,
                $input['similarity_boost'] ?? 0.75,
                $input['speed'] ?? 1.0,
                $input['language'] ?? 'bn',
                $input['is_default'] ?? 0,
            ]);
            jsonResponse(['success' => true, 'id' => $db->lastInsertId()]);
        }
        if ($method === 'DELETE') {
            $id = $input['id'] ?? 0;
            $db->prepare('DELETE FROM voice_presets WHERE id = ?')->execute([$id]);
            jsonResponse(['success' => true]);
        }
        break;

    // ── Usage Logs ──────────────────────────────────────────────────
    case 'usage':
        $logs = $db->query('SELECT created_at, provider, service_type, model, tokens_used, cost_usd FROM api_usage_log ORDER BY id DESC LIMIT 50')->fetchAll();
        $totals = $db->query('SELECT COUNT(*) as total_calls, COALESCE(SUM(tokens_used),0) as total_tokens FROM api_usage_log WHERE MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())')->fetch();
        jsonResponse(['logs' => $logs, 'total_calls' => $totals['total_calls'], 'total_tokens' => $totals['total_tokens']]);
        break;

    default:
        jsonResponse(['error' => 'Unknown action'], 400);
}
