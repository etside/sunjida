/**
 * SalesDaddy Service Worker — PHP Fallback Interceptor
 *
 * When Supabase is unreachable, intercepts function calls and
 * redirects them to the PHP backend.
 * - /functions/v1/agent-chat → /api/chat.php
 * - /functions/v1/voice-agent → /api/tts.php
 * - /auth/v1/token → /api/auth.php
 * - /auth/v1/user → /api/auth.php?action=session
 * - /auth/v1/logout → /api/auth.php?action=signout
 */
const PHP_AUTH = '/api/auth.php';
const PHP_CHAT = '/api/chat.php';
const PHP_TTS = '/api/tts.php';
const SUPABASE_HOST = 'yplgzmxzrslofnuagfaz.supabase.co';
const FUNCTIONS_PATH = '/functions/v1/';
const AUTH_PATH = '/auth/v1/';

let supabaseReachable = true;
let lastCheck = 0;
const CHECK_INTERVAL = 30_000; // re-check every 30s

async function checkSupabase() {
  const now = Date.now();
  if (now - lastCheck < CHECK_INTERVAL) return supabaseReachable;
  lastCheck = now;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3000);
    const res = await fetch(`https://${SUPABASE_HOST}/rest/v1/?select=1`, {
      method: 'HEAD',
      signal: ctrl.signal,
      headers: { apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwbGd6bXh6cnNsb2ZudWFnZmF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTgxNTgsImV4cCI6MjA4NDc3NDE1OH0.i9RxJRB2VE87Qqvvgu27OVPqpFUfdat1DLYI6j_TxIs' },
    });
    clearTimeout(timer);
    supabaseReachable = res.ok || res.status < 500;
  } catch {
    supabaseReachable = false;
  }
  return supabaseReachable;
}

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Only intercept Supabase requests
  const isSupabaseFunctions = url.hostname === SUPABASE_HOST && url.pathname.startsWith(FUNCTIONS_PATH);
  const isSupabaseAuth = url.hostname === SUPABASE_HOST && url.pathname.startsWith(AUTH_PATH);

  if (!isSupabaseFunctions && !isSupabaseAuth) return;

  e.respondWith(
    (async () => {
      // Check if Supabase is reachable
      if (await checkSupabase()) {
        try {
          return await fetch(e.request);
        } catch {
          // Supabase just went down — fall through to PHP
        }
      }

      // Supabase is down — redirect to PHP backend
      console.log('[SW] Supabase unreachable, redirecting to PHP fallback');

      // ── Auth requests ──────────────────────────────────────────────
      if (isSupabaseAuth) {
        const path = url.pathname;

        // POST /auth/v1/token?grant_type=password  →  sign in
        if (e.request.method === 'POST' && path.endsWith('/token')) {
          const cloned = e.request.clone();
          const body = await cloned.text();
          return fetch(`${PHP_AUTH}?grant_type=password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
          });
        }

        // GET /auth/v1/user  →  get session
        if (e.request.method === 'GET' && path.endsWith('/user')) {
          return fetch(`${PHP_AUTH}?action=session`);
        }

        // POST /auth/v1/logout  →  sign out
        if (e.request.method === 'POST' && path.endsWith('/logout')) {
          return fetch(`${PHP_AUTH}?action=signout`, { method: 'POST' });
        }

        // Default auth fallback
        return fetch(PHP_AUTH);
      }

      // ── Function requests ──────────────────────────────────────────
      const path = url.pathname;

      if (path.includes('voice-agent')) {
        // TTS request
        const cloned = e.request.clone();
        const body = await cloned.text();
        return fetch(PHP_TTS, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
        });
      }

      // Chat (agent-chat or any other function)
      if (e.request.method === 'GET') {
        const businessId = url.searchParams.get('businessId') || '';
        return fetch(`${PHP_CHAT}?businessId=${encodeURIComponent(businessId)}`);
      }

      const cloned = e.request.clone();
      const body = await cloned.text();
      return fetch(PHP_CHAT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
    })()
  );
});
