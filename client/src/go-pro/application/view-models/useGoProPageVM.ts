// English description: Go Pro page view-model that loads backend packages and submits upgrade requests.

import { ApiGoProRepository } from "../../infrastructure/repositories/ApiGoProRepository"

export function useGoProPageVM() {
  const toast = useToast()
  const repository = new ApiGoProRepository()
  const upgradingType = ref("")
  const { data, pending, error, refresh } = useAsyncData(
    "go-pro:catalog",
    () => repository.getCatalog(),
  )

  const packages = computed(() => data.value?.packages ?? [])
  const membershipSystem = computed(() => Boolean(data.value?.membershipSystem))
  const currentIsPro = computed(() => Boolean(data.value?.currentIsPro))

  const upgrade = async (type: string) => {
    upgradingType.value = type

    try {
      await repository.upgrade(type)
      await refresh()
    }
    catch (err) {
      toast.add({
        color: "error",
        title: err instanceof Error ? err.message : "Unable to upgrade.",
      })
    }
    finally {
      upgradingType.value = ""
    }
  }

  return {
    packages,
    membershipSystem,
    currentIsPro,
    pending,
    error,
    upgradingType,
    upgrade,
  }
}
