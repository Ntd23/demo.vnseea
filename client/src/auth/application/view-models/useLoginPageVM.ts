// English description: Login page view model that submits credentials through the backend API bridge.

import type { LoginResult } from "../../domain/types/auth.types"
import { createApiAuthRepository } from "../../infrastructure/repositories/ApiAuthRepository"
import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"
import { submitBackendBrowserSession } from "../services/backend-browser-session"

type LoginFieldName = "login" | "password"
type LoginValidationError = {
  name: LoginFieldName
  message: string
}

const extractErrorMessage = (error: unknown, defaultMessage: string) => {
  const maybeError = error as {
    data?: { statusMessage?: string; message?: string }
    statusMessage?: string
    message?: string
  }

  return maybeError?.data?.statusMessage
    ?? maybeError?.data?.message
    ?? maybeError?.statusMessage
    ?? maybeError?.message
    ?? defaultMessage
}

export function useLoginPageVM(
  repository = createApiAuthRepository(),
) {
  const { t } = useI18n()

  const state = reactive({
    login: "",
    password: "",
  })

  const submitState = ref<"idle" | "loading" | "success" | "error">("idle")
  const submitMessage = ref("")
  const lastResult = ref<LoginResult | null>(null)

  const validate = (currentState: typeof state): LoginValidationError[] => {
    const errors: LoginValidationError[] = []

    if (!currentState.login.trim()) {
      errors.push({ name: "login", message: t("pages.welcomePage.validationLoginRequired") })
    }

    if (!currentState.password) {
      errors.push({ name: "password", message: t("pages.welcomePage.validationPasswordRequired") })
    }

    return errors
  }

  const isSubmitting = computed(() => submitState.value === "loading")

  async function handleSubmit() {
    submitState.value = "loading"
    submitMessage.value = ""

    try {
      const result = await repository.login({
        identity: state.login,
        password: state.password,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      })

      lastResult.value = result
      submitState.value = "success"
      submitMessage.value = result.message

      if (result.status === "authenticated" && result.accessToken) {
        await submitBackendBrowserSession(result.accessToken)
        return
      }

      if (result.status === "two_factor_required" && result.userId) {
        await navigateTo({
          path: appRoutes.confirmLogin,
          query: { userId: String(result.userId) },
        })
        return
      }
      submitState.value = "error"
      submitMessage.value = result.message || t("pages.welcomePage.statusWarningTitle")
    }
    catch (error) {
      submitState.value = "error"
      submitMessage.value = extractErrorMessage(
        error,
        t("pages.welcomePage.statusErrorDescription"),
      )

    }
  }

  watch(
    () => [state.login, state.password],
    () => {
      if (submitState.value !== "loading") {
        submitState.value = "idle"
        submitMessage.value = ""
      }
    },
  )

  return {
    state,
    submitState,
    submitMessage,
    lastResult,
    isSubmitting,
    validate,
    handleSubmit,
  }
}
