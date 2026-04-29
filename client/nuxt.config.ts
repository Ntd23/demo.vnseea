// https://nuxt.com/docs/api/configuration/nuxt-config
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = fileURLToPath(new URL(".", import.meta.url))

process.loadEnvFile?.(resolve(__dirname, ".env"))

function requireEnv(name: string) {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

const publicApiBase = requireEnv("NUXT_PUBLIC_API_BASE")
const legacyApiBase = requireEnv("NUXT_LEGACY_API_BASE")
const publicSiteUrl = requireEnv("NUXT_PUBLIC_SITE_URL")
const allowedHosts = requireEnv("NUXT_ALLOWED_HOSTS")
  .split(",")
  .map(host => host.trim())
  .filter(Boolean)

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  alias: {
    "#shared-kernel": resolve(__dirname, "src/shared-kernel"),
  },
  runtimeConfig: {
    legacyApiBase,
    public: {
      apiBase: publicApiBase,
      siteUrl: publicSiteUrl,
    },
  },
  css: ["~/assets/css/main.css"],
  imports: {
    dirs: [
      resolve(__dirname, "src/shared-kernel/application/composables"),
    ],
  },
  devServer: {
    host: process.env.NUXT_DEV_HOST,
    port: Number(process.env.NUXT_DEV_PORT),
  },
  app: {
    head: {
      title: "VNSEEA",
      titleTemplate: "%s | VNSEEA",
      meta: [
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
      ],
    },
  },
  site: {
    name: "VNSEEA",
    url: publicSiteUrl,
    defaultLocale: "vi",
  },
  ogImage: {
    zeroRuntime: true,
  },
  vite: {
    server: {
      allowedHosts,
    },
  },
  modules: [
    "@nuxt/ui",
    "@nuxtjs/seo",
    "@nuxt/icon",
    "@nuxt/image",
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "@nuxtjs/i18n",
  ],
  i18n: {
    defaultLocale: "vi",
    langDir: "locales",
    locales: [
      { code: "vi", language: "vi-VN", file: "vi.json", name: "Tiếng Việt" },
      { code: "en", language: "en-US", file: "en.json", name: "English" },
    ],
    strategy: "no_prefix",
  },
})
