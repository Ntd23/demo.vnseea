// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from "node:url"
import { resolve } from "node:path"

const __dirname = fileURLToPath(new URL(".", import.meta.url))

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  alias: {
    "#shared-kernel": resolve(__dirname, "src/shared-kernel"),
  },
  css: ["~/assets/css/main.css"],
  imports: {
    dirs: [
      resolve(__dirname, "src/shared-kernel/application/composables"),
    ],
  },
  devServer: {
    host: "127.0.0.1",
    port: 3000,
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
  ogImage: {
    zeroRuntime: true,
  },
  hooks: {
    "pages:extend"(pages) {
      // Xóa route /[username] tự động (tránh conflict)
      const idx = pages.findIndex(p => p.name === "username")
      if (idx !== -1) pages.splice(idx, 1)

      // Thêm route /@username với đường dẫn tuyệt đối
      pages.push({
        name: "profile",
        path: "/@:username",
        file: resolve(__dirname, "app/pages/[username].vue"),
      })
    },
  },
  vite: {
    server: {
      allowedHosts: ["demo.vnseea.test"],
    },
  },
  modules: [
    "@nuxt/ui",
    "@nuxtjs/seo",
    "@nuxt/fonts",
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
  fonts: {
    families: [
      {
        name: "Inter",
        provider: "google",
        weights: [400, 500, 600, 700, 800],
        subsets: ["latin", "vietnamese"],
      },
      {
        name: "Be Vietnam Pro",
        provider: "google",
        weights: [400, 500, 600, 700, 800],
        subsets: ["latin", "vietnamese"],
      },
    ],
  },
});
