import type { FormError } from "@nuxt/ui"
import { appRoutes, backendRoutes } from "../../../shared-kernel/application/constants/route-registry"
import { useBackendWebUrl } from "../../../shared-kernel/application/utils/backend-web-url"
import { createApiAuthRepository } from "../../infrastructure/repositories/ApiAuthRepository"

type ConfirmAccountFieldName = "code"
type ConfirmAccountValidationError = FormError<ConfirmAccountFieldName>

const extractErrorMessage = (error: unknown, fallback: string) => {
  const maybeError = error as {
    data?: { statusMessage?: string; message?: string }
    statusMessage?: string
    message?: string
  }

  return maybeError?.data?.statusMessage
    ?? maybeError?.data?.message
    ?? maybeError?.statusMessage
    ?? maybeError?.message
    ?? fallback
}

export function useConfirmAccountPageVM(
  repository = createApiAuthRepository(),
) {
  const route = useRoute()
  const submitState = ref<"idle" | "loading" | "success" | "error">("idle")
  const submitMessage = ref("")
  const state = reactive({
    code: "",
  })

  const userId = computed(() => {
    const value = Array.isArray(route.query.userId) ? route.query.userId[0] : route.query.userId
    const parsed = Number(value)

    return Number.isFinite(parsed) && parsed > 0 ? parsed : null
  })

  const pageReady = computed(() => userId.value !== null)
  const browserSessionUrl = (accessToken: string) =>
    useBackendWebUrl(backendRoutes.session.setBrowserCookie(accessToken))

  const validate = (currentState: typeof state): ConfirmAccountValidationError[] => {
    const errors: ConfirmAccountValidationError[] = []

    if (!currentState.code.trim()) {
      errors.push({ name: "code", message: "Enter the verification code." })
    }

    return errors
  }

  async function handleSubmit() {
    if (!userId.value) {
      submitState.value = "error"
      submitMessage.value = "The verification request is missing a valid user."
      return
    }

    submitState.value = "loading"
    submitMessage.value = ""

    try {
      const result = await repository.confirmAccount({
        userId: userId.value,
        code: state.code.trim(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      })

      submitState.value = "success"
      submitMessage.value = result.message
      await navigateTo(browserSessionUrl(result.accessToken), { external: true })
    }
    catch (error) {
      submitState.value = "error"
      submitMessage.value = extractErrorMessage(error, "Unable to verify the account.")
    }
  }

  const backToWelcome = async () => navigateTo(appRoutes.welcome)

  return {
    state,
    userId,
    pageReady,
    submitState,
    submitMessage,
    validate,
    handleSubmit,
    backToWelcome,
  }
}
