export interface User {
  id: string
  username: string
  email: string
  fullName: string
  avatar?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  status: "idle" | "loading" | "authenticated" | "unauthenticated" | "error"
}

export interface LoginPayload {
  login: string
  password: string
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  emailOrPhone: string
  password: string
  birthdayDay?: string
  birthdayMonth?: string
  birthdayYear?: string
  gender?: string
}
