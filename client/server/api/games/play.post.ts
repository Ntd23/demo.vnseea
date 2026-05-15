// English description: Bridges the play/start game action to the backend games API.

import { readBody } from "h3"
import { addGameToMyList } from "./_shared"

export default defineEventHandler(async (event) => {
  const body = await readBody<{ gameId?: number }>(event)

  return await addGameToMyList(event, Number(body.gameId || 0))
})
