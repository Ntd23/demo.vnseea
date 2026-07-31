// English description: Closes the shared Redis connection when the Nitro server shuts down.

import { closeRedisClient } from "../utils/redis-client"

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("close", async () => {
    await closeRedisClient()
  })
})
