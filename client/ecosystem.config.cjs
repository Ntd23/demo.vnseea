const path = require("node:path")

const clientRoot = __dirname

module.exports = {
  apps: [
    {
      name: "vnseea-client",
      cwd: clientRoot,
      script: path.join(clientRoot, ".output", "server", "index.mjs"),
      interpreter: "node",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        HOST: process.env.HOST,
        PORT: process.env.PORT,
        NITRO_HOST: process.env.NITRO_HOST || process.env.HOST,
        NITRO_PORT: process.env.NITRO_PORT || process.env.PORT,
        NUXT_PUBLIC_API_BASE: process.env.NUXT_PUBLIC_API_BASE,
        NUXT_PUBLIC_SITE_URL: process.env.NUXT_PUBLIC_SITE_URL ,
        NUXT_BACKEND_API_BASE: process.env.NUXT_BACKEND_API_BASE,
        NUXT_BACKEND_SERVER_KEY: process.env.NUXT_BACKEND_SERVER_KEY,
        NUXT_PUBLIC_REALTIME_URL: process.env.NUXT_PUBLIC_REALTIME_URL,
        REALTIME_INTERNAL_URL: process.env.REALTIME_INTERNAL_URL,
        REALTIME_SECRET: process.env.REALTIME_SECRET,
      },
    },
    {
      name: "vnseea-realtime",
      cwd: clientRoot,
      script: path.join(clientRoot, "realtime", "notification-server.mjs"),
      interpreter: "node",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "256M",
      env: {
        NODE_ENV: "production",
        REALTIME_HOST: process.env.REALTIME_HOST || "0.0.0.0",
        REALTIME_PORT: process.env.REALTIME_PORT || "3015",
        REALTIME_SECRET: process.env.REALTIME_SECRET,
        REALTIME_CORS_ORIGIN: process.env.REALTIME_CORS_ORIGIN || process.env.NUXT_PUBLIC_SITE_URL,
      },
    },
  ],
}
