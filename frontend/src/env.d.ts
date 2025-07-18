/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_API_BASE_URL: string;
  readonly PUBLIC_API_VERSION: string;
  readonly PUBLIC_APP_NAME: string;
  readonly PUBLIC_APP_URL: string;
  readonly PUBLIC_ENABLE_ANALYTICS: string;
  readonly PUBLIC_ENABLE_CHAT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
