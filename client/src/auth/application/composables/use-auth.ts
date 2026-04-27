import type { AuthState, LoginPayload, RegisterPayload, User } from "../../domain/types/auth.types"

// Global shared state for auth
const state = reactive<AuthState>({
  user: null,
  token: null,
  status: "unauthenticated",
})

export const useAuth = () => {
  const { t } = useI18n()

  const login = async (payload: LoginPayload) => {
    state.status = "loading"
    // Mock simulation
    await new Promise(r => setTimeout(r, 1000))
    
    if (payload.login === "admin" && payload.password === "password") {
      state.user = {
        id: "1",
        username: "admin",
        email: "admin@example.com",
        fullName: "Administrator",
      }
      state.token = "mock-token"
      state.status = "authenticated"
    } else {
      state.status = "error"
      throw new Error(t("pages.welcomePage.statusErrorDescription"))
    }
  }

  const logout = () => {
    state.user = null
    state.token = null
    state.status = "unauthenticated"
  }

  const register = async (payload: RegisterPayload) => {
    state.status = "loading"
    await new Promise(r => setTimeout(r, 1000))
    state.status = "authenticated"
    state.user = {
      id: "2",
      username: payload.username,
      email: payload.email,
      fullName: payload.username,
    }
  }

  return {
    state: readonly(state),
    login,
    logout,
    register,
  }
}
