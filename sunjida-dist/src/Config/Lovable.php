<?php
namespace Config;

class Lovable
{
    public static function getApiKey(): string { return Env::required('LOVABLE_API_KEY'); }
    public static function getBaseUrl(): string { return Env::get('LOVABLE_BASE_URL', 'https://ai.gateway.lovable.dev/v1'); }
    public static function getDefaultModel(): string { return Env::get('LOVABLE_DEFAULT_MODEL', 'google/gemini-2.5-flash'); }
    public static function getEmbeddingModel(): string { return Env::get('LOVABLE_EMBEDDING_MODEL', 'openai/text-embedding-3-small'); }
    public static function getTtsModel(): string { return Env::get('LOVABLE_TTS_MODEL', 'openai/tts-1'); }
    public static function getTtsVoice(): string { return Env::get('LOVABLE_TTS_VOICE', 'alloy'); }
    public static function getMetaAppId(): string { return Env::required('META_APP_ID'); }
    public static function getMetaAppSecret(): string { return Env::required('META_APP_SECRET'); }
    public static function getMetaOAuthRedirectUri(): string { return Env::get('META_OAUTH_REDIRECT_URI', '/api/v1/shops/connect-meta.php'); }
    public static function getJwtSecret(): string { return Env::required('JWT_SECRET'); }
    public static function getLogPath(): string { return Env::get('LOG_FILE', '/var/log/salesdaddy.log'); }
    public static function getLogLevel(): string { return Env::get('LOG_LEVEL', 'info'); }
}
