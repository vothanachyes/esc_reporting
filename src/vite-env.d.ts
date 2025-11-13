/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_APP_KEY: string;
  readonly VITE_IV_LENGTH?: string;
  readonly VITE_TAG_LENGTH?: string;
  readonly VITE_PIN_ENCRYPTED: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.json?raw" {
  const content: string;
  export default content;
}

// Image imports for Vite
declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.gif" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "*.webp" {
  const src: string;
  export default src;
}

