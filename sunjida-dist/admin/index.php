<?php
/**
 * SalesDaddy SuperAdmin Panel
 */
require_once __DIR__ . '/../api/config.php';
session_start();

// ── Handle login ─────────────────────────────────────────────────────
if (!isset($_SESSION['sd_admin']) && $_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['email'])) {
    try {
        $db = getDB();
        $stmt = $db->prepare('SELECT id, email, encrypted_password FROM users WHERE email = ?');
        $stmt->execute([$_POST['email']]);
        $user = $stmt->fetch();
        if ($user && password_verify($_POST['password'], $user['encrypted_password'])) {
            $role = $db->prepare('SELECT 1 FROM user_roles WHERE user_id = ? AND role = "admin"');
            $role->execute([$user['id']]);
            if ($role->fetch()) {
                $_SESSION['sd_admin'] = true;
                $_SESSION['sd_admin_id'] = $user['id'];
                $_SESSION['sd_admin_email'] = $user['email'];
                header('Location: /admin/');
                exit;
            }
        }
        $loginError = 'Invalid credentials.';
    } catch (Throwable $e) {
        $loginError = 'Connection error.';
    }
}

$isLoggedIn = $_SESSION['sd_admin'] ?? false;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SalesDaddy Admin</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; }
        .login-box { max-width: 380px; margin: 120px auto; padding: 40px; background: #1e293b; border-radius: 12px; border: 1px solid #334155; }
        .login-box h1 { text-align: center; margin-bottom: 24px; color: #f97316; font-size: 22px; }
        .login-box input { width: 100%; padding: 12px; margin-bottom: 14px; background: #0f172a; border: 1px solid #475569; border-radius: 8px; color: #e2e8f0; font-size: 14px; }
        .login-box button { width: 100%; padding: 12px; background: #f97316; color: white; border: none; border-radius: 8px; font-size: 15px; cursor: pointer; font-weight: 600; }
        .login-box button:hover { background: #ea580c; }
        .error { color: #ef4444; text-align: center; margin-bottom: 12px; font-size: 13px; }
        .layout { display: flex; min-height: 100vh; }
        .sidebar { width: 250px; background: #1e293b; border-right: 1px solid #334155; padding: 20px 0; position: fixed; height: 100vh; overflow-y: auto; }
        .sidebar h2 { padding: 0 20px 16px; color: #f97316; font-size: 17px; border-bottom: 1px solid #334155; }
        .sidebar a { display: block; padding: 11px 20px; color: #94a3b8; text-decoration: none; font-size: 14px; transition: all 0.15s; }
        .sidebar a:hover, .sidebar a.active { background: #334155; color: #f97316; }
        .sidebar .signout { margin-top: 20px; border-top: 1px solid #334155; padding-top: 20px; }
        .main { margin-left: 250px; flex: 1; padding: 28px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .header h1 { font-size: 22px; font-weight: 600; }
        .card { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 20px; margin-bottom: 16px; }
        .card h3 { margin-bottom: 14px; color: #f8fafc; font-size: 15px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #334155; font-size: 13px; }
        th { color: #94a3b8; font-weight: 500; }
        input, select, textarea { padding: 8px 10px; background: #0f172a; border: 1px solid #475569; border-radius: 6px; color: #e2e8f0; font-size: 13px; }
        textarea { min-height: 70px; resize: vertical; width: 100%; font-family: inherit; }
        .btn { padding: 7px 14px; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.15s; }
        .btn-primary { background: #f97316; color: white; }
        .btn-primary:hover { background: #ea580c; }
        .btn-danger { background: #ef4444; color: white; }
        .btn-danger:hover { background: #dc2626; }
        .btn-success { background: #22c55e; color: white; }
        .btn-sm { padding: 4px 10px; font-size: 11px; }
        .badge { padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
        .badge-active { background: #166534; color: #86efac; }
        .badge-inactive { background: #7f1d1d; color: #fca5a5; }
        .grid { display: grid; gap: 16px; }
        .grid-2 { grid-template-columns: 1fr 1fr; }
        .grid-3 { grid-template-columns: 1fr 1fr 1fr; }
        .stat { text-align: center; padding: 20px; }
        .stat .number { font-size: 30px; font-weight: 700; color: #f97316; }
        .stat .label { font-size: 12px; color: #94a3b8; margin-top: 4px; }
        .form-row { display: flex; gap: 10px; margin-bottom: 10px; align-items: end; }
        .form-row > div { flex: 1; }
        .form-row label { display: block; margin-bottom: 3px; font-size: 12px; color: #94a3b8; }
        .form-row input, .form-row select { width: 100%; }
        .section { display: none; }
        .section.active { display: block; }
        .alert { padding: 10px 14px; border-radius: 6px; margin-bottom: 14px; font-size: 13px; }
        .alert-success { background: #14532d; border: 1px solid #22c55e; color: #86efac; }
        .alert-error { background: #7f1d1d; border: 1px solid #ef4444; color: #fca5a5; }
        @media (max-width: 768px) { .sidebar { display: none; } .main { margin-left: 0; } .grid-2, .grid-3 { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
<?php if (!$isLoggedIn): ?>
<div class="login-box">
    <h1>SalesDaddy Admin</h1>
    <?php if (!empty($loginError)): ?><p class="error"><?= htmlspecialchars($loginError) ?></p><?php endif; ?>
    <form method="POST">
        <input type="email" name="email" placeholder="admin@salesdaddy.com" required>
        <input type="password" name="password" placeholder="Password" required>
        <button type="submit">Sign In</button>
    </form>
</div>
<?php else: ?>
<div class="layout">
    <nav class="sidebar">
        <h2>SalesDaddy Admin</h2>
        <a href="#" class="active" onclick="showSection('dashboard',this)">Dashboard</a>
        <a href="#" onclick="showSection('api-keys',this)">API Keys</a>
        <a href="#" onclick="showSection('training',this)">Training Data</a>
        <a href="#" onclick="showSection('auto-responses',this)">Auto Responses</a>
        <a href="#" onclick="showSection('voice',this)">Voice Settings</a>
        <a href="#" onclick="showSection('usage',this)">Usage</a>
        <a href="/admin/logout.php" class="signout">Sign Out</a>
    </nav>

    <div class="main">
        <!-- Dashboard -->
        <div id="dashboard" class="section active">
            <div class="header"><h1>Dashboard</h1></div>
            <div class="grid grid-3">
                <div class="card stat"><div class="number" id="stat-keys">-</div><div class="label">Active API Keys</div></div>
                <div class="card stat"><div class="number" id="stat-training">-</div><div class="label">Training Entries</div></div>
                <div class="card stat"><div class="number" id="stat-responses">-</div><div class="label">Auto Responses</div></div>
            </div>
        </div>

        <!-- API Keys -->
        <div id="api-keys" class="section">
            <div class="header"><h1>API Keys</h1></div>
            <div class="card">
                <h3>Add API Key</h3>
                <form id="add-key-form">
                    <div class="form-row">
                        <div><label>Provider</label><select name="provider"><option value="lovable">Lovable</option><option value="openai">OpenAI</option><option value="anthropic">Anthropic</option><option value="google">Gemini</option><option value="elevenlabs">ElevenLabs</option><option value="deepseek">DeepSeek</option><option value="other">Other</option></select></div>
                        <div><label>Service</label><select name="service_type"><option value="both">Both</option><option value="text">Text</option><option value="voice">Voice</option></select></div>
                        <div><label>Priority</label><input type="number" name="priority" value="0" min="0" max="100"></div>
                    </div>
                    <div class="form-row">
                        <div style="flex:2"><label>API Key</label><input type="text" name="api_key" placeholder="sk-..." required></div>
                        <div><label>Model</label><input type="text" name="model" placeholder="google/gemini-2.5-pro"></div>
                        <div><label>Label</label><input type="text" name="label" placeholder="Production"></div>
                        <div><button type="submit" class="btn btn-primary">Add</button></div>
                    </div>
                </form>
            </div>
            <div class="card">
                <h3>Configured Keys</h3>
                <table><thead><tr><th>Provider</th><th>Label</th><th>Service</th><th>Key</th><th>Model</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead><tbody id="keys-table"></tbody></table>
            </div>
        </div>

        <!-- Training Data -->
        <div id="training" class="section">
            <div class="header"><h1>Training Data</h1>
                <a href="/api/training-export.php" class="btn btn-success" style="text-decoration:none">Download Template</a>
            </div>
            <div class="card">
                <h3>Add Entry</h3>
                <form id="add-training-form">
                    <div class="form-row">
                        <div><label>Category</label><select name="category"><option value="general">General</option><option value="product">Product</option><option value="faq">FAQ</option><option value="greeting">Greeting</option></select></div>
                        <div><label>Type</label><select name="data_type"><option value="text">Text</option><option value="faq">FAQ</option><option value="product_info">Product Info</option></select></div>
                        <div><label>Language</label><select name="language"><option value="bn">Bangla</option><option value="en">English</option></select></div>
                    </div>
                    <div class="form-row"><div><label>Title</label><input type="text" name="title" placeholder="e.g. Price inquiry response" required></div></div>
                    <div class="form-row"><div><label>Keywords</label><input type="text" name="keywords" placeholder="price, cost, দাম"></div></div>
                    <div class="form-row"><div><label>Content</label><textarea name="content" placeholder="Training text or response..."></textarea></div></div>
                    <div class="form-row"><div><button type="submit" class="btn btn-primary">Add</button></div></div>
                </form>
            </div>
            <div class="card">
                <h3>Upload File</h3>
                <form id="upload-training-form" enctype="multipart/form-data">
                    <div class="form-row">
                        <div><input type="file" name="training_file" accept=".csv,.txt,.json" required></div>
                        <div><button type="submit" class="btn btn-primary">Upload</button></div>
                    </div>
                </form>
            </div>
            <div class="card">
                <h3>Entries</h3>
                <table><thead><tr><th>Title</th><th>Category</th><th>Type</th><th>Lang</th><th>Status</th><th>Actions</th></tr></thead><tbody id="training-table"></tbody></table>
            </div>
        </div>

        <!-- Auto Responses -->
        <div id="auto-responses" class="section">
            <div class="header"><h1>Auto Responses</h1></div>
            <div class="card">
                <h3>Add Response</h3>
                <form id="add-response-form">
                    <div class="form-row">
                        <div><label>Keyword</label><input type="text" name="keyword" placeholder="price, দাম" required></div>
                        <div><label>Match</label><select name="match_type"><option value="contains">Contains</option><option value="exact">Exact</option><option value="regex">Regex</option></select></div>
                        <div><label>Type</label><select name="response_type"><option value="text">Text</option><option value="audio">Audio</option><option value="both">Both</option></select></div>
                    </div>
                    <div class="form-row"><div><label>Response</label><textarea name="response_text" placeholder="Auto-response text..."></textarea></div></div>
                    <div class="form-row">
                        <div><label>Audio URL</label><input type="text" name="response_audio_url" placeholder="https://...mp3"></div>
                        <div><label>Priority</label><input type="number" name="priority" value="0"></div>
                        <div><label>Lang</label><select name="language"><option value="bn">Bangla</option><option value="en">English</option></select></div>
                        <div><button type="submit" class="btn btn-primary">Add</button></div>
                    </div>
                </form>
            </div>
            <div class="card">
                <h3>Configured Responses</h3>
                <table><thead><tr><th>Keyword</th><th>Match</th><th>Response</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead><tbody id="responses-table"></tbody></table>
            </div>
        </div>

        <!-- Voice Settings -->
        <div id="voice" class="section">
            <div class="header"><h1>Voice Settings</h1></div>
            <div class="card">
                <h3>Voice Presets</h3>
                <form id="add-preset-form">
                    <div class="form-row">
                        <div><label>Name</label><input type="text" name="name" placeholder="Bengali Female" required></div>
                        <div><label>Provider</label><select name="provider"><option value="elevenlabs">ElevenLabs</option><option value="openai">OpenAI</option><option value="google">Google</option></select></div>
                        <div><label>Voice ID</label><input type="text" name="voice_id" placeholder="voice id"></div>
                        <div><button type="submit" class="btn btn-primary">Add</button></div>
                    </div>
                </form>
                <table style="margin-top:14px;"><thead><tr><th>Name</th><th>Provider</th><th>Voice ID</th><th>Default</th><th>Actions</th></tr></thead><tbody id="presets-table"></tbody></table>
            </div>
        </div>

        <!-- Usage -->
        <div id="usage" class="section">
            <div class="header"><h1>API Usage</h1></div>
            <div class="grid grid-2">
                <div class="card"><h3>This Month</h3><div id="usage-summary"></div></div>
                <div class="card"><h3>Recent Calls</h3><div id="usage-table-wrap"></div></div>
            </div>
        </div>
    </div>
</div>
<?php endif; ?>

<script>
const API = '/api/admin-api.php';

function showSection(id, el) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));
    if (el) el.classList.add('active');
    const loaders = { dashboard: loadDashboard, 'api-keys': loadKeys, training: loadTraining, 'auto-responses': loadResponses, voice: loadPresets, usage: loadUsage };
    if (loaders[id]) loaders[id]();
}

async function api(action, method = 'GET', data = null) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (data) opts.body = JSON.stringify(data);
    return (await fetch(`${API}?action=${action}`, opts)).json();
}

function esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

// ── Dashboard ──
async function loadDashboard() {
    const d = await api('dashboard');
    document.getElementById('stat-keys').textContent = d.keys || 0;
    document.getElementById('stat-training').textContent = d.training || 0;
    document.getElementById('stat-responses').textContent = d.responses || 0;
}

// ── API Keys ──
async function loadKeys() {
    const d = await api('keys');
    document.getElementById('keys-table').innerHTML = (d.keys || []).map(k => `
        <tr><td>${esc(k.provider)}</td><td>${esc(k.label||'-')}</td><td>${esc(k.service_type)}</td>
        <td><code style="font-size:11px">${esc(k.api_key_preview||'****')}</code></td><td>${esc(k.model||'-')}</td><td>${k.priority}</td>
        <td><span class="badge ${k.is_active?'badge-active':'badge-inactive'}">${k.is_active?'Active':'Off'}</span></td>
        <td><button class="btn btn-sm ${k.is_active?'btn-danger':'btn-success'}" onclick="toggleKey(${k.id})">${k.is_active?'Disable':'Enable'}</button>
        <button class="btn btn-sm btn-danger" onclick="deleteKey(${k.id})">Del</button></td></tr>`).join('');
}
document.getElementById('add-key-form').onsubmit = async e => { e.preventDefault(); await api('keys','POST',Object.fromEntries(new FormData(e.target))); e.target.reset(); loadKeys(); };
async function toggleKey(id) { await api('keys','DELETE',{id,action:'toggle'}); loadKeys(); }
async function deleteKey(id) { if(confirm('Delete?')){ await api('keys','DELETE',{id}); loadKeys(); } }

// ── Training ──
async function loadTraining() {
    const d = await api('training');
    document.getElementById('training-table').innerHTML = (d.entries||[]).map(t => `
        <tr><td>${esc(t.title)}</td><td>${esc(t.category)}</td><td>${esc(t.data_type)}</td><td>${esc(t.language)}</td>
        <td><span class="badge ${t.is_active?'badge-active':'badge-inactive'}">${t.is_active?'Active':'Off'}</span></td>
        <td><button class="btn btn-sm btn-danger" onclick="deleteTraining(${t.id})">Del</button></td></tr>`).join('');
}
document.getElementById('add-training-form').onsubmit = async e => { e.preventDefault(); const d=Object.fromEntries(new FormData(e.target)); d.is_active=1; await api('training','POST',d); e.target.reset(); loadTraining(); };
document.getElementById('upload-training-form').onsubmit = async e => { e.preventDefault(); const fd=new FormData(e.target); const r=await fetch(`${API}?action=training-upload`,{method:'POST',body:fd}); const j=await r.json(); alert(j.message||j.error); loadTraining(); };
async function deleteTraining(id) { if(confirm('Delete?')){ await api('training','DELETE',{id}); loadTraining(); } }

// ── Auto Responses ──
async function loadResponses() {
    const d = await api('responses');
    document.getElementById('responses-table').innerHTML = (d.responses||[]).map(r => `
        <tr><td>${esc(r.keyword)}</td><td>${esc(r.match_type)}</td><td>${esc((r.response_text||'').substring(0,60))}${(r.response_text||'').length>60?'...':''}</td>
        <td>${esc(r.response_type)}</td><td><span class="badge ${r.is_active?'badge-active':'badge-inactive'}">${r.is_active?'Active':'Off'}</span></td>
        <td><button class="btn btn-sm btn-danger" onclick="deleteResponse(${r.id})">Del</button></td></tr>`).join('');
}
document.getElementById('add-response-form').onsubmit = async e => { e.preventDefault(); const d=Object.fromEntries(new FormData(e.target)); d.is_active=1; await api('responses','POST',d); e.target.reset(); loadResponses(); };
async function deleteResponse(id) { if(confirm('Delete?')){ await api('responses','DELETE',{id}); loadResponses(); } }

// ── Voice Presets ──
async function loadPresets() {
    const d = await api('presets');
    document.getElementById('presets-table').innerHTML = (d.presets||[]).map(p => `
        <tr><td>${esc(p.name)}</td><td>${esc(p.provider)}</td><td>${esc(p.voice_id||'-')}</td><td>${p.is_default?'Yes':'-'}</td>
        <td><button class="btn btn-sm btn-danger" onclick="deletePreset(${p.id})">Del</button></td></tr>`).join('');
}
document.getElementById('add-preset-form').onsubmit = async e => { e.preventDefault(); await api('presets','POST',Object.fromEntries(new FormData(e.target))); e.target.reset(); loadPresets(); };
async function deletePreset(id) { if(confirm('Delete?')){ await api('presets','DELETE',{id}); loadPresets(); } }

// ── Usage ──
async function loadUsage() {
    const d = await api('usage');
    document.getElementById('usage-summary').innerHTML = `<p style="font-size:14px;">Calls: <strong>${d.total_calls||0}</strong> &nbsp; Tokens: <strong>${d.total_tokens||0}</strong></p>`;
    document.getElementById('usage-table-wrap').innerHTML = `<table><thead><tr><th>Time</th><th>Provider</th><th>Service</th><th>Tokens</th></tr></thead><tbody>` +
        (d.logs||[]).map(l => `<tr><td>${esc(l.created_at)}</td><td>${esc(l.provider)}</td><td>${esc(l.service_type)}</td><td>${l.tokens_used}</td></tr>`).join('') + '</tbody></table>';
}

<?php if ($isLoggedIn): ?>loadDashboard();<?php endif; ?>
</script>
</body>
</html>
