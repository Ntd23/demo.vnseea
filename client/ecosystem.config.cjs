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
      },
    },
  ],
}
