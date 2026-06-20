// English description: Loads poke requests and exposes backend-backed poke actions for the poke route.

import type { PokeRecord } from "../composables/usePokeData"
import { createApiPokeRepository } from "../../infrastructure/repositories/ApiPokeRepository"
import type { PokeRepository } from "../../domain/repositories/PokeRepository"

export function usePokePageVM(
  repository: PokeRepository = createApiPokeRepository(),
) {
  const { t } = useI18n()

  const loading = ref(true)
  const errorMessage = ref("")
  const pokeRecords = ref<PokeRecord[]>([])
  const pokedBackIds = ref<string[]>([])
  const respondingIds = ref<string[]>([])

  const respondedCount = computed(() => pokedBackIds.value.length)

  const isResponding = (id: string) => respondingIds.value.includes(id)

  async function fetchPokes() {
    loading.value = true
    errorMessage.value = ""

    try {
      pokeRecords.value = await repository.getPokes()
    }
    catch (error) {
      errorMessage.value = error instanceof Error ? error.message : t("pages.pokePage.listDescription")
    }
    finally {
      loading.value = false
    }
  }

  async function pokeBack(id: string) {
    if (pokedBackIds.value.includes(id) || respondingIds.value.includes(id)) {
      return
    }

    const record = pokeRecords.value.find(item => item.id === id)
    if (!record) {
      return
    }

    errorMessage.value = ""
    respondingIds.value = [...respondingIds.value, id]

    try {
      await repository.runPokeAction({
        action: "create",
        userId: record.userId,
        pokeId: record.pokeId,
      })
      pokedBackIds.value = [...pokedBackIds.value, id]
    }
    catch (error) {
      errorMessage.value = error instanceof Error ? error.message : t("pages.pokePage.listDescription")
    }
    finally {
      respondingIds.value = respondingIds.value.filter(item => item !== id)
    }
  }

  return {
    loading,
    errorMessage,
    pokeRecords,
    pokedBackIds,
    respondingIds,
    respondedCount,
    isResponding,
    fetchPokes,
    pokeBack,
  }
}
