// English description: Declares the repository contract for backend-backed poke lists and actions.

import type { PokeActionResult, PokeRecord } from "../types/poke.types"

export interface PokeRepository {
  getPokes(): Promise<PokeRecord[]>
  runPokeAction(input: {
    action: "create" | "remove"
    userId?: number
    pokeId?: number
  }): Promise<PokeActionResult>
}
