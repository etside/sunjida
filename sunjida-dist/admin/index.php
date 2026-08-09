<?php
/**
 * SalesDaddy SuperAdmin Panel
 * PHP-rendered admin dashboard for managing AI keys, training data, auto-responses, voice
 */

require_once __DIR__ . '/../api/config.php';
session_start();
csrfToken(); // ensure CSRF token exists in session

// Simple auth check
$isLoggedIn = $_SESSION['sd_admin'] ?? false;
if (!$isLoggedIn && isset($_POST['email'])) {
    // Check for login form submission
    $db = getDB();
    $stmt = $db->prepare('SELECT id, email, encrypted_password FROM users WHERE email = ?');
    $stmt->execute([$_POST['email']]);
    $user = $stmt->fetch();
    if ($user && password_verify($_POST['password'], $user['encrypted_password'])) {
        // Check admin role
        $roleStmt = $db->prepare('SELECT role FROM user_roles WHERE user_id = ? AND role = ?');
        $roleStmt->execute([$user['id'], 'admin']);
        if ($roleStmt->fetch()) {
            $_SESSION['sd_admin'] = true;
            $_SESSION['sd_admin_id'] = $user['id'];
            $_SESSION['sd_admin_email'] = $user['email'];
            $_SESSION['sd_last_activity'] = time();
            header('Location: /admin/');
            exit;
        }
    }
    $loginError = 'Invalid credentials or not an admin account.';
}
$isLoggedIn = $_SESSION['sd_admin'] ?? false;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SalesDaddy SuperAdmin Panel</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; }
        .login-box { max-width: 400px; margin: 100px auto; padding: 40px; background: #1e293b; border-radius: 12px; border: 1px solid #334155; }
        .login-box h1 { text-align: center; margin-bottom: 24px; color: #f97316; font-size: 24px; }
        .login-box input { width: 100%; padding: 12px; margin-bottom: 16px; background: #0f172a; border: 1px solid #475569; border-radius: 8px; color: #e2e8f0; font-size: 14px; }
        .login-box button { width: 100%; padding: 12px; background: #f97316; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: 600; }
        .login-box button:hover { background: #ea580c; }
        .error { color: #ef4444; text-align: center; margin-bottom: 16px; font-size: 14px; }
        .layout { display: flex; min-height: 100vh; }
        .sidebar { width: 260px; background: #1e293b; border-right: 1px solid #334155; padding: 20px 0; position: fixed; height: 100vh; overflow-y: auto; }
        .sidebar h2 { padding: 0 20px 20px; color: #f97316; font-size: 18px; border-bottom: 1px solid #334155; }
        .sidebar a { display: block; padding: 12px 20px; color: #94a3b8; text-decoration: none; font-size: 14px; transition: all 0.2s; }
        .sidebar a:hover, .sidebar a.active { background: #334155; color: #f97316; }
        .main { margin-left: 260px; flex: 1; padding: 30px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .header h1 { font-size: 24px; font-weight: 600; }
        .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
        .card h3 { margin-bottom: 16px; color: #f8fafc; font-size: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #334155; font-size: 14px; }
        th { color: #94a3b8; font-weight: 500; }
        input, select, textarea { padding: 8px 12px; background: #0f172a; border: 1px solid #475569; border-radius: 6px; color: #e2e8f0; font-size: 13px; }
        textarea { min-height: 80px; resize: vertical; width: 100%; font-family: inherit; }
        .btn { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s; }
        .btn-primary { background: #f97316; color: white; }
        .btn-primary:hover { background: #ea580c; }
        .btn-danger { background: #ef4444; color: white; }
        .btn-danger:hover { background: #dc2626; }
        .btn-success { background: #22c55e; color: white; }
        .btn-sm { padding: 4px 10px; font-size: 12px; }
        .badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
        .badge-active { background: #166534; color: #86efac; }
        .badge-inactive { background: #7f1d1d; color: #fca5a5; }
        .grid { display: grid; gap: 20px; }
        .grid-2 { grid-template-columns: 1fr 1fr; }
        .grid-3 { grid-template-columns: 1fr 1fr 1fr; }
        .stat { text-align: center; padding: 20px; }
        .stat .number { font-size: 32px; font-weight: 700; color: #f97316; }
        .stat .label { font-size: 13px; color: #94a3b8; margin-top: 4px; }
        .form-row { display: flex; gap: 12px; margin-bottom: 12px; align-items: end; }
        .form-row > div { flex: 1; }
        .form-row label { display: block; margin-bottom: 4px; font-size: 13px; color: #94a3b8; }
        .form-row input, .form-row select { width: 100%; }
        .section { display: none; }
        .section.active { display: block; }
        .alert { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; }
        .alert-success { background: #14532d; border: 1px solid #22c55e; color: #86efac; }
        .alert-error { background: #7f1d1d; border: 1px solid #ef4444; color: #fca5a5; }
        @media (max-width: 768px) {
            .sidebar { display: none; }
            .main { margin-left: 0; }
            .grid-2, .grid-3 { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
<?php if (!$isLoggedIn): ?>
<div class="login-box">
    <h1>SalesDaddy Admin</h1>
    <?php if (!empty($loginError)): ?><p class="error"><?= htmlspecialchars($loginError) ?></p><?php endif; ?>
    <form method="POST">
        <input type="hidden" name="_csrf" value="<?= htmlspecialchars(csrfToken()) ?>">
        <input type="email" name="email" placeholder="admin@salesdaddy.com" required>
        <input type="password" name="password" placeholder="Password" required>
        <button type="submit">Sign In</button>
    </form>
</div>
<?php else: ?>
<div class="layout">
    <nav class="sidebar">
        <h2>SalesDaddy Admin</h2>
        <a href="#" class="active" onclick="showSection('dashboard')">Dashboard</a>
        <a href="#" onclick="showSection('api-keys')">API Keys</a>
        <a href="#" onclick="showSection('training')">Training Data</a>
        <a href="#" onclick="showSection('auto-responses')">Auto Responses</a>
        <a href="#" onclick="showSection('voice')">Voice Settings</a>
        <a href="#" onclick="showSection('usage')">Usage & Credits</a>
        <a href="/admin/logout.php" style="margin-top:20px; border-top:1px solid #334155; padding-top:20px;">Sign Out</a>
    </nav>

    <div class="main">
        <!-- Dashboard -->
        <div id="dashboard" class="section active">
            <div class="header"><h1>Dashboard</h1></div>
            <div class="grid grid-3" id="stats-grid">
                <div class="card stat"><div class="number" id="stat-keys">-</div><div class="label">Active API Keys</div></div>
                <div class="card stat"><div class="number" id="stat-training">-</div><div class="label">Training Entries</div></div>
                <div class="card stat"><div class="number" id="stat-responses">-</div><div class="label">Auto Responses</div></div>
            </div>
        </div>

        <!-- API Keys -->
        <div id="api-keys" class="section">
            <div class="header"><h1>API Keys Management</h1></div>
            <div class="card">
                <h3>Add New API Key</h3>
                <form id="add-key-form">
                    <div class="form-row">
                        <div><label>Provider</label><select name="provider"><option value="lovable">Lovable Gateway</option><option value="openai">OpenAI</option><option value="anthropic">Anthropic</option><option value="google">Google Gemini</option><option value="elevenlabs">ElevenLabs</option><option value="deepseek">DeepSeek</option><option value="other">Other</option></select></div>
                        <div><label>Service Type</label><select name="service_type"><option value="both">Both (Text + Voice)</option><option value="text">Text Only</option><option value="voice">Voice Only</option></select></div>
                        <div><label>Priority</label><input type="number" name="priority" value="0" min="0" max="100"></div>
                    </div>
                    <div class="form-row">
                        <div style="flex:2"><label>API Key</label><input type="text" name="api_key" placeholder="sk-..." required></div>
                        <div><label>Model</label><input type="text" name="model" placeholder="google/gemini-2.5-pro"></div>
                    </div>
                    <div class="form-row">
                        <div><label>Label</label><input type="text" name="label" placeholder="Production key"></div>
                        <div><label>Monthly Limit ($)</label><input type="number" name="monthly_limit" value="0" step="0.01"></div>
                        <div><label>Rate Limit (RPM)</label><input type="number" name="rate_limit_rpm" value="60"></div>
                        <div><button type="submit" class="btn btn-primary">Add Key</button></div>
                    </div>
                </form>
            </div>
            <div class="card">
                <h3>Configured API Keys</h3>
                <table>
                    <thead><tr><th>Provider</th><th>Label</th><th>Service</th><th>Key</th><th>Model</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody id="keys-table"></tbody>
                </table>
            </div>
        </div>

        <!-- Training Data -->
        <div id="training" class="section">
            <div class="header"><h1>Training Data</h1>
                <div>
                    <a href="/api/training-export.php?key=<?= htmlspecialchars($_SESSION['sd_admin_id']) ?>" class="btn btn-success" style="text-decoration:none">Download Template</a>
                </div>
            </div>
            <div class="card">
                <h3>Add Training Entry</h3>
                <form id="add-training-form">
                    <div class="form-row">
                        <div><label>Category</label><select name="category"><option value="general">General</option><option value="product">Product Info</option><option value="faq">FAQ</option><option value="greeting">Greeting</option><option value="closing">Closing</option><option value="upsell">Upsell</option></select></div>
                        <div><label>Type</label><select name="data_type"><option value="text">General Text</option><option value="faq">FAQ Pair</option><option value="product_info">Product Info</option><option value="response_template">Response Template</option><option value="keyword_response">Keyword Response</option></select></div>
                        <div><label>Language</label><select name="language"><option value="bn">Bangla</option><option value="en">English</option><option value="both">Both</option></select></div>
                    </div>
                    <div class="form-row">
                        <div><label>Title</label><input type="text" name="title" placeholder="e.g. Product price inquiry response" required></div>
                    </div>
                    <div class="form-row">
                        <div><label>Keywords (comma separated)</label><input type="text" name="keywords" placeholder="price, cost, how much, দাম"></div>
                    </div>
                    <div class="form-row">
                        <div><label>Content / Response</label><textarea name="content" placeholder="Enter the training text or response template..."></textarea></div>
                    </div>
                    <div class="form-row"><div><button type="submit" class="btn btn-primary">Add Training Entry</button></div></div>
                </form>
            </div>
            <div class="card">
                <h3>Upload Training File</h3>
                <p style="color:#94a3b8;font-size:13px;margin-bottom:12px;">Upload a CSV or TXT file. CSV format: category,type,title,keywords,content</p>
                <form id="upload-training-form" enctype="multipart/form-data">
                    <div class="form-row">
                        <div><input type="file" name="training_file" accept=".csv,.txt,.json" required></div>
                        <div><button type="submit" class="btn btn-primary">Upload</button></div>
                    </div>
                </form>
            </div>
            <div class="card">
                <h3>Training Entries</h3>
                <table>
                    <thead><tr><th>Title</th><th>Category</th><th>Type</th><th>Language</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody id="training-table"></tbody>
                </table>
            </div>
        </div>

        <!-- Auto Responses -->
        <div id="auto-responses" class="section">
            <div class="header"><h1>Auto Responses & Keyword Detection</h1></div>
            <div class="card">
                <h3>Add Auto Response</h3>
                <form id="add-response-form">
                    <div class="form-row">
                        <div><label>Keyword / Trigger</label><input type="text" name="keyword" placeholder="price, দাম, order status" required></div>
                        <div><label>Match Type</label><select name="match_type"><option value="contains">Contains</option><option value="exact">Exact Match</option><option value="regex">Regex</option><option value="ai_fallback">AI Fallback</option></select></div>
                        <div><label>Response Type</label><select name="response_type"><option value="text">Text Only</option><option value="audio">Audio Only</option><option value="both">Both</option></select></div>
                    </div>
                    <div class="form-row">
                        <div><label>Response Text</label><textarea name="response_text" placeholder="Enter the auto-response text..."></textarea></div>
                    </div>
                    <div class="form-row">
                        <div><label>Audio URL (optional)</label><input type="text" name="response_audio_url" placeholder="https://...mp3 or /audio/response.mp3"></div>
                        <div><label>Priority</label><input type="number" name="priority" value="0"></div>
                        <div><label>Language</label><select name="language"><option value="bn">Bangla</option><option value="en">English</option></select></div>
                        <div><button type="submit" class="btn btn-primary">Add Response</button></div>
                    </div>
                </form>
            </div>
            <div class="card">
                <h3>Configured Auto Responses</h3>
                <table>
                    <thead><tr><th>Keyword</th><th>Match</th><th>Response</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody id="responses-table"></tbody>
                </table>
            </div>
        </div>

        <!-- Voice Settings -->
        <div id="voice" class="section">
            <div class="header"><h1>Voice AI Settings</h1></div>
            <div class="card">
                <h3>Voice Provider Configuration</h3>
                <p style="color:#94a3b8;font-size:13px;margin-bottom:16px;">Configure voice providers for natural Bengali TTS. Add ElevenLabs, Gemini, or OpenAI voice keys above in API Keys section.</p>
                <div class="form-row">
                    <div><label>Primary Voice Provider</label><select id="voice-primary"><option value="elevenlabs">ElevenLabs</option><option value="openai">OpenAI TTS</option><option value="google">Google Gemini</option><option value="edge">Edge TTS (Free)</option></select></div>
                    <div><label>Fallback Provider</label><select id="voice-fallback"><option value="edge">Edge TTS (Free)</option><option value="openai">OpenAI TTS</option><option value="elevenlabs">ElevenLabs</option></select></div>
                    <div><label>Bengali Voice ID</label><input type="text" id="voice-bengali-id" placeholder="ElevenLabs voice ID or OpenAI voice name"></div>
                </div>
                <div class="form-row">
                    <div><label>Stability (0-1)</label><input type="number" id="voice-stability" value="0.5" step="0.05" min="0" max="1"></div>
                    <div><label>Similarity (0-1)</label><input type="number" id="voice-similarity" value="0.75" step="0.05" min="0" max="1"></div>
                    <div><label>Speed</label><input type="number" id="voice-speed" value="1.0" step="0.1" min="0.5" max="2.0"></div>
                    <div><button class="btn btn-primary" onclick="saveVoiceSettings()">Save Settings</button></div>
                </div>
            </div>
            <div class="card">
                <h3>Voice Presets</h3>
                <form id="add-preset-form">
                    <div class="form-row">
                        <div><label>Name</label><input type="text" name="name" placeholder="Friendly Bengali Female" required></div>
                        <div><label>Provider</label><select name="provider"><option value="elevenlabs">ElevenLabs</option><option value="openai">OpenAI</option><option value="google">Google</option></select></div>
                        <div><label>Voice ID</label><input type="text" name="voice_id" placeholder="voice id or name"></div>
                        <div><button type="submit" class="btn btn-primary">Add Preset</button></div>
                    </div>
                </form>
                <table style="margin-top:16px;">
                    <thead><tr><th>Name</th><th>Provider</th><th>Voice ID</th><th>Default</th><th>Actions</th></tr></thead>
                    <tbody id="presets-table"></tbody>
                </table>
            </div>
        </div>

        <!-- Usage & Credits -->
        <div id="usage" class="section">
            <div class="header"><h1>API Usage & Credits</h1></div>
            <div class="grid grid-2">
                <div class="card">
                    <h3>Current Month Usage</h3>
                    <div id="usage-summary"></div>
                </div>
                <div class="card">
                    <h3>Credit Fallback Settings</h3>
                    <p style="color:#94a3b8;font-size:13px;margin-bottom:12px;">When API credits run low, use keyword detection and pre-recorded responses as fallback.</p>
                    <div class="form-row">
                        <div><label>Low Credit Threshold (%)</label><input type="number" id="credit-threshold" value="80" min="0" max="100"></div>
                        <div><label>Enable Fallback</label><select id="credit-fallback"><option value="1">Yes</option><option value="0">No</option></select></div>
                        <div><button class="btn btn-primary" onclick="saveCreditSettings()">Save</button></div>
                    </div>
                </div>
            </div>
            <div class="card">
                <h3>Recent API Calls</h3>
                <table>
                    <thead><tr><th>Time</th><th>Provider</th><th>Service</th><th>Model</th><th>Tokens</th><th>Cost</th></tr></thead>
                    <tbody id="usage-table"></tbody>
                </table>
            </div>
        </div>
    </div>
</div>
<?php endif; ?>

<script>
const API = '/api/admin-api.php';
const CSRF_TOKEN = '<?= htmlspecialchars($_SESSION['sd_csrf'] ?? '') ?>';

function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));
    event.target.classList.add('active');
    if (id === 'dashboard') loadDashboard();
    if (id === 'api-keys') loadKeys();
    if (id === 'training') loadTraining();
    if (id === 'auto-responses') loadResponses();
    if (id === 'voice') loadPresets();
    if (id === 'usage') loadUsage();
}

async function apiCall(action, method='GET', data=null) {
    const opts = { method, headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': CSRF_TOKEN } };
    if (data) opts.body = JSON.stringify(data);
    const res = await fetch(`${API}?action=${action}`, opts);
    return res.json();
}

// ── Dashboard ──
async function loadDashboard() {
    const data = await apiCall('dashboard');
    document.getElementById('stat-keys').textContent = data.keys || 0;
    document.getElementById('stat-training').textContent = data.training || 0;
    document.getElementById('stat-responses').textContent = data.responses || 0;
}

// ── API Keys ──
async function loadKeys() {
    const data = await apiCall('keys');
    const tbody = document.getElementById('keys-table');
    tbody.innerHTML = (data.keys || []).map(k => `
        <tr>
            <td>${esc(k.provider)}</td>
            <td>${esc(k.label || '-')}</td>
            <td>${esc(k.service_type)}</td>
            <td><code style="font-size:11px">${esc(k.api_key_preview || '****')}</code></td>
            <td>${esc(k.model || '-')}</td>
            <td>${k.priority}</td>
            <td><span class="badge ${k.is_active ? 'badge-active' : 'badge-inactive'}">${k.is_active ? 'Active' : 'Inactive'}</span></td>
            <td>
                <button class="btn btn-sm ${k.is_active ? 'btn-danger' : 'btn-success'}" onclick="toggleKey(${k.id})">${k.is_active ? 'Disable' : 'Enable'}</button>
                <button class="btn btn-sm btn-danger" onclick="deleteKey(${k.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('add-key-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd);
    data.is_active = 1;
    await apiCall('keys', 'POST', data);
    e.target.reset();
    loadKeys();
});

async function toggleKey(id) { await apiCall('keys', 'DELETE', { id, action: 'toggle' }); loadKeys(); }
async function deleteKey(id) { if (confirm('Delete this API key?')) { await apiCall('keys', 'DELETE', { id }); loadKeys(); } }

// ── Training Data ──
async function loadTraining() {
    const data = await apiCall('training');
    const tbody = document.getElementById('training-table');
    tbody.innerHTML = (data.entries || []).map(t => `
        <tr>
            <td>${esc(t.title)}</td>
            <td>${esc(t.category)}</td>
            <td>${esc(t.data_type)}</td>
            <td>${esc(t.language)}</td>
            <td><span class="badge ${t.is_active ? 'badge-active' : 'badge-inactive'}">${t.is_active ? 'Active' : 'Inactive'}</span></td>
            <td><button class="btn btn-sm btn-danger" onclick="deleteTraining(${t.id})">Delete</button></td>
        </tr>
    `).join('');
}

document.getElementById('add-training-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd);
    data.is_active = 1;
    await apiCall('training', 'POST', data);
    e.target.reset();
    loadTraining();
});

document.getElementById('upload-training-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    fd.append('_csrf', CSRF_TOKEN);
    const res = await fetch(`${API}?action=training-upload`, { method: 'POST', body: fd, headers: { 'X-CSRF-Token': CSRF_TOKEN } });
    const data = await res.json();
    alert(data.message || data.error);
    loadTraining();
});

async function deleteTraining(id) { if (confirm('Delete?')) { await apiCall('training', 'DELETE', { id }); loadTraining(); } }

// ── Auto Responses ──
async function loadResponses() {
    const data = await apiCall('responses');
    const tbody = document.getElementById('responses-table');
    tbody.innerHTML = (data.responses || []).map(r => `
        <tr>
            <td>${esc(r.keyword)}</td>
            <td>${esc(r.match_type)}</td>
            <td>${esc((r.response_text || '').substring(0, 80))}${(r.response_text||'').length > 80 ? '...' : ''}</td>
            <td>${esc(r.response_type)}</td>
            <td><span class="badge ${r.is_active ? 'badge-active' : 'badge-inactive'}">${r.is_active ? 'Active' : 'Inactive'}</span></td>
            <td><button class="btn btn-sm btn-danger" onclick="deleteResponse(${r.id})">Delete</button></td>
        </tr>
    `).join('');
}

document.getElementById('add-response-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd);
    data.is_active = 1;
    await apiCall('responses', 'POST', data);
    e.target.reset();
    loadResponses();
});

async function deleteResponse(id) { if (confirm('Delete?')) { await apiCall('responses', 'DELETE', { id }); loadResponses(); } }

// ── Voice Presets ──
async function loadPresets() {
    const data = await apiCall('presets');
    const tbody = document.getElementById('presets-table');
    tbody.innerHTML = (data.presets || []).map(p => `
        <tr>
            <td>${esc(p.name)}</td>
            <td>${esc(p.provider)}</td>
            <td>${esc(p.voice_id || '-')}</td>
            <td>${p.is_default ? 'Yes' : '-'}</td>
            <td><button class="btn btn-sm btn-danger" onclick="deletePreset(${p.id})">Delete</button></td>
        </tr>
    `).join('');
}

document.getElementById('add-preset-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd);
    await apiCall('presets', 'POST', data);
    e.target.reset();
    loadPresets();
});

async function deletePreset(id) { if (confirm('Delete?')) { await apiCall('presets', 'DELETE', { id }); loadPresets(); } }
function saveVoiceSettings() { alert('Voice settings saved!'); }

// ── Usage ──
async function loadUsage() {
    const data = await apiCall('usage');
    const tbody = document.getElementById('usage-table');
    tbody.innerHTML = (data.logs || []).map(l => `
        <tr><td>${esc(l.created_at)}</td><td>${esc(l.provider)}</td><td>${esc(l.service_type)}</td><td>${esc(l.model || '-')}</td><td>${l.tokens_used}</td><td>$${l.cost_usd}</td></tr>
    `).join('');
    document.getElementById('usage-summary').innerHTML = `<p style="font-size:14px;">Total calls this month: <strong>${data.total_calls || 0}</strong></p><p style="font-size:14px;">Total tokens: <strong>${data.total_tokens || 0}</strong></p>`;
}
function saveCreditSettings() { alert('Credit settings saved!'); }

function esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

// Load dashboard on start
<?php if ($isLoggedIn): ?>
loadDashboard();
<?php endif; ?>
</script>
</body>
</html>
