// English description: Account verification view model for backend account activation.

import type { FormError } from "@nuxt/ui"
import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"
import { createApiAuthRepository } from "../../infrastructure/repositories/ApiAuthRepository"
import { submitBackendBrowserSession } from "../services/backend-browser-session"

type ConfirmAccountFieldName = "code"
type ConfirmAccountValidationError = FormError<ConfirmAccountFieldName>

const extractErrorMessage = (error: unknown, defaultMessage: string) => {
  const maybeError = error as {
    data?: {
      statusMessage?: string
      message?: string
      errors?: { error_text?: string }
      data?: { errors?: { error_text?: string } }
    }
    statusMessage?: string
    message?: string
  }

  return maybeError?.data?.errors?.error_text
    ?? maybeError?.data?.data?.errors?.error_text
    ?? maybeError?.data?.statusMessage
    ?? maybeError?.data?.message
    ?? maybeError?.statusMessage
    ?? maybeError?.message
    ?? defaultMessage
}

export function useConfirmAccountPageVM(
  repository = createApiAuthRepository(),
) {
  const { t } = useI18n()
  const route = useRoute()
  const submitState = ref<"idle" | "loading" | "success" | "error">("idle")
  const submitMessage = ref("")
  const resendRemaining = ref(60)
  const resendState = ref<"idle" | "loading" | "success" | "error">("idle")
  const resendMessage = ref("")
  const state = reactive({
    code: "",
  })

  const userId = computed(() => {
    const value = Array.isArray(route.query.userId) ? route.query.userId[0] : route.query.userId
    const parsed = Number(value)

    return Number.isFinite(parsed) && parsed > 0 ? parsed : null
  })

  const pageReady = computed(() => userId.value !== null)
  const validate = (currentState: typeof state): ConfirmAccountValidationError[] => {
    const errors: ConfirmAccountValidationError[] = []

    if (!/^\d{6}$/.test(currentState.code.trim())) {
      errors.push({ name: "code", message: t("pages.confirmAccountPage.validationCodeRequired") })
    }

    return errors
  }

  async function handleSubmit() {
    if (!userId.value) {
      submitState.value = "error"
      submitMessage.value = t("pages.confirmAccountPage.missingUser")
      return
    }

    submitState.value = "loading"
    submitMessage.value = ""

    let result

    try {
      result = await repository.confirmAccount({
        userId: userId.value,
        code: state.code.trim(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      })
    }
    catch (error) {
      submitState.value = "error"
      submitMessage.value = extractErrorMessage(error, t("pages.confirmAccountPage.statusErrorDescription"))
      return
    }

    submitState.value = "success"
    submitMessage.value = result.message

    try {
      await submitBackendBrowserSession(result.accessToken)
    }
    catch {
      // Account activation has already succeeded. A session hand-off failure
      // must not be presented as a failed verification or invite code retries.
      submitMessage.value = `${result.message} Please return to sign in.`
    }
  }

  const canResend = computed(() => resendRemaining.value === 0 && resendState.value !== "loading")

  async function resendCode() {
    if (!userId.value || !canResend.value) return
    resendState.value = "loading"
    resendMessage.value = ""
    try {
      const result = await repository.resendAccountCode({ userId: userId.value })
      resendState.value = "success"
      resendMessage.value = result.message
      resendRemaining.value = 60
    }
    catch (error) {
      resendState.value = "error"
      resendMessage.value = extractErrorMessage(error, "Unable to resend the confirmation code.")
    }
  }

  if (import.meta.client) {
    const timer = window.setInterval(() => {
      if (resendRemaining.value > 0) resendRemaining.value -= 1
    }, 1000)
    onBeforeUnmount(() => window.clearInterval(timer))
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
    resendRemaining,
    resendState,
    resendMessage,
    canResend,
    resendCode,
    backToWelcome,
  }
}
