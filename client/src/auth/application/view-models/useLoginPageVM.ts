import type { FormError } from "@nuxt/ui"
import type { LoginResult } from "../../domain/types/auth.types"
import { createApiAuthRepository } from "../../infrastructure/repositories/ApiAuthRepository"
import { appRoutes, backendRoutes } from "../../../shared-kernel/application/constants/route-registry"
import { useBackendWebUrl } from "../../../shared-kernel/application/utils/backend-web-url"

type LoginFieldName = "login" | "password"
type LoginValidationError = FormError<LoginFieldName>

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

export function useLoginPageVM(
  repository = createApiAuthRepository(),
) {
  const { t } = useI18n()
  const toast = useToast()
  const browserSessionUrl = (accessToken: string) =>
    useBackendWebUrl(backendRoutes.session.setBrowserCookie(accessToken))

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
      errors.push({ name: "login", message: t("pages.welcomePage.validationLoginRequired") || "Vui lòng nhập email hoặc số điện thoại" })
    }

    if (!currentState.password) {
      errors.push({ name: "password", message: t("pages.welcomePage.validationPasswordRequired") || "Vui lòng nhập mật khẩu" })
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
        await navigateTo(browserSessionUrl(result.accessToken), { external: true })
        return
      }

      if (result.status === "two_factor_required" && result.userId) {
        await navigateTo({
          path: appRoutes.confirmLogin,
          query: { userId: String(result.userId) },
        })
        return
      }

      toast.add({
        color: "warning",
        icon: "i-ph-warning-circle-fill",
        title: "Confirmation required",
        description: result.message,
      })
    }
    catch (error) {
      submitState.value = "error"
      submitMessage.value = extractErrorMessage(
        error,
        "Unable to sign in with the provided credentials.",
      )

      toast.add({
        color: "error",
        icon: "i-ph-warning-circle-fill",
        title: "Sign in failed",
        description: submitMessage.value,
      })
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
