// Description: Requests the browser's current coordinates and serializes them into the native-compatible map message URL.

import { buildLocationMessageUrl } from "../utils/message-location"
import { useCurrentAuthUserStore } from "../../../auth/application/stores/useCurrentAuthUserStore"

export type MessageLocationError = "unsupported" | "insecure-context" | "permission-denied" | "unavailable" | "timeout" | "unknown"

export function useCurrentLocationShare() {
  const runtimeConfig = useRuntimeConfig()
  const currentAuthUserStore = useCurrentAuthUserStore()
  const isLocating = ref(false)
  const locationError = ref<MessageLocationError | null>(null)

  async function createCurrentLocationMessage(title: string) {
    if (!import.meta.client || !("geolocation" in navigator)) {
      locationError.value = "unsupported"
      return ""
    }

    if (!window.isSecureContext) {
      locationError.value = "insecure-context"
      return ""
    }

    isLocating.value = true
    locationError.value = null

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000,
        })
      })

      return buildLocationMessageUrl({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        title,
        siteUrl: String(runtimeConfig.public.siteUrl || ""),
        avatarUrl: currentAuthUserStore.user?.avatarUrl || "",
      })
    }
    catch (error) {
      const code = typeof error === "object" && error && "code" in error
        ? Number(error.code)
        : 0

      locationError.value = code === 1
        ? "permission-denied"
        : code === 2
          ? "unavailable"
          : code === 3
            ? "timeout"
            : "unknown"

      return ""
    }
    finally {
      isLocating.value = false
    }
  }

  function clearLocationError() {
    locationError.value = null
  }

  return {
    isLocating,
    locationError,
    createCurrentLocationMessage,
    clearLocationError,
  }
}
