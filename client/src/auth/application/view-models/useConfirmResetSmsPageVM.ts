import type { FormError } from "@nuxt/ui"
import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"
import { createApiAuthRepository } from "../../infrastructure/repositories/ApiAuthRepository"

type ConfirmResetSmsFieldName = "code"
type ConfirmResetSmsValidationError = FormError<ConfirmResetSmsFieldName>

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

export function useConfirmResetSmsPageVM(
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

  const validate = (currentState: typeof state): ConfirmResetSmsValidationError[] => {
    const errors: ConfirmResetSmsValidationError[] = []

    if (!currentState.code.trim()) {
      errors.push({ name: "code", message: "Enter the reset code." })
    }

    return errors
  }

  async function handleSubmit() {
    if (!userId.value) {
      submitState.value = "error"
      submitMessage.value = "The reset request is missing a valid user."
      return
    }

    submitState.value = "loading"
    submitMessage.value = ""

    try {
      const result = await repository.confirmResetSms({
        userId: userId.value,
        code: state.code.trim(),
      })

      submitState.value = "success"
      submitMessage.value = result.message
      await navigateTo({
        path: appRoutes.resetPassword,
        query: {
          code: result.resetCode,
          email: result.email,
        },
      })
    }
    catch (error) {
      submitState.value = "error"
      submitMessage.value = extractErrorMessage(error, "Unable to confirm the reset code.")
    }
  }

  const backToForgotPassword = async () => navigateTo(appRoutes.forgotPassword)

  return {
    state,
    userId,
    pageReady,
    submitState,
    submitMessage,
    validate,
    handleSubmit,
    backToForgotPassword,
  }
}
