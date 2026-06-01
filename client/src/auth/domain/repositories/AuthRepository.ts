// English description: Auth repository contract used by auth view-models and API-backed implementations.

import type {
  ConfirmAccountInput,
  ConfirmAccountResult,
  ConfirmLoginInput,
  ConfirmLoginResult,
  CurrentAuthUser,
  ConfirmResetSmsInput,
  ConfirmResetSmsResult,
  ForgotPasswordInput,
  ForgotPasswordResult,
  LoginInput,
  LoginResult,
  RegisterAccountConfig,
  RegisterAccountInput,
  RegisterAccountResult,
  ResetPasswordInput,
  ResetPasswordResult,
} from "../types/auth.types"

export interface AuthRepository {
  getCurrentUser(): Promise<CurrentAuthUser | null>
  getRegisterConfig(): Promise<RegisterAccountConfig>
  login(input: LoginInput): Promise<LoginResult>
  register(input: RegisterAccountInput): Promise<RegisterAccountResult>
  confirmLogin(input: ConfirmLoginInput): Promise<ConfirmLoginResult>
  confirmAccount(input: ConfirmAccountInput): Promise<ConfirmAccountResult>
  requestPasswordReset(input: ForgotPasswordInput): Promise<ForgotPasswordResult>
  confirmResetSms(input: ConfirmResetSmsInput): Promise<ConfirmResetSmsResult>
  resetPassword(input: ResetPasswordInput): Promise<ResetPasswordResult>
}
