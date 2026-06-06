<!-- English description: Renders the guest login form without exposing credentials through URL fallback submits. -->
<template>
  <div class="auth-form">
    <div class="auth-form__head">
      <h1 class="auth-form__title">{{ $t('pages.welcomePage.title') }}</h1>
    </div>

    <form
      method="post"
      action="/welcome"
      class="auth-form__body"
      @submit.prevent="handleLoginSubmit"
    >
      <div
        class="auth-form__field"
        :class="{ 'auth-form__field--invalid': fieldErrors.login }"
      >
        <label class="auth-form__label" for="welcome-login">
          {{ $t('pages.welcomePage.loginLabel') }}
          <span aria-hidden="true">*</span>
        </label>
        <input
          id="welcome-login"
          v-model="state.login"
          name="login"
          type="text"
          autocomplete="username"
          :placeholder="$t('pages.welcomePage.loginPlaceholder')"
          class="auth-form__input"
          :aria-invalid="Boolean(fieldErrors.login)"
          :aria-describedby="fieldErrors.login ? 'welcome-login-error' : undefined"
        />
        <p v-if="fieldErrors.login" id="welcome-login-error" class="auth-form__error">
          {{ fieldErrors.login }}
        </p>
      </div>

      <div
        class="auth-form__field"
        :class="{ 'auth-form__field--invalid': fieldErrors.password }"
      >
        <div class="auth-form__label-row">
          <label class="auth-form__label" for="welcome-password">
            {{ $t('pages.welcomePage.passwordLabel') }}
            <span aria-hidden="true">*</span>
          </label>
          <NuxtLink class="auth-form__field-link" :to="appRoutes.forgotPassword">
            {{ $t('pages.welcomePage.forgotPassword') }}
          </NuxtLink>
        </div>
        <div class="auth-form__password-wrap">
          <input
            id="welcome-password"
            v-model="state.password"
            name="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            :placeholder="$t('pages.welcomePage.passwordLabel')"
            class="auth-form__input auth-form__input--password"
            :aria-invalid="Boolean(fieldErrors.password)"
            :aria-describedby="fieldErrors.password ? 'welcome-password-error' : undefined"
          >
          <button
            type="button"
            class="auth-form__password-toggle"
            :aria-label="showPassword ? $t('pages.welcomePage.hidePassword') : $t('pages.welcomePage.showPassword')"
            @click="showPassword = !showPassword"
          >
            <Icon
              :name="showPassword ? 'i-ph-eye-slash-duotone' : 'i-ph-eye-duotone'"
              class="h-5 w-5"
            />
          </button>
        </div>
        <p v-if="fieldErrors.password" id="welcome-password-error" class="auth-form__error">
          {{ fieldErrors.password }}
        </p>
      </div>

      <div
        v-if="submitState === 'error' && submitMessage"
        class="auth-form__status"
        role="alert"
      >
        {{ submitMessage }}
      </div>

      <button
        type="submit"
        class="auth-submit"
        :disabled="isSubmitting"
      >
        <Icon
          v-if="isSubmitting"
          name="i-lucide-loader-2"
          class="h-5 w-5 animate-spin"
          aria-hidden="true"
        />
        <span>{{ $t('pages.welcomePage.login') }}</span>
      </button>

      <p class="auth-form__footer-text">
        {{ $t('pages.welcomePage.noAccount') }}
        <NuxtLink class="auth-form__footer-link" :to="appRoutes.register">
          {{ $t('pages.welcomePage.register') }}
        </NuxtLink>
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { appRoutes } from '#shared-kernel/application/constants/route-registry'
import { useLoginPageVM } from "../../../auth/application/view-models/useLoginPageVM"

const showPassword = ref(false)
const fieldErrors = reactive({
  login: "",
  password: "",
})
const {
  state,
  submitState,
  submitMessage,
  isSubmitting,
  validate,
  handleSubmit: handleLogin,
} = useLoginPageVM()

const handleLoginSubmit = async () => {
  fieldErrors.login = ""
  fieldErrors.password = ""

  const errors = validate(state)

  if (errors.length) {
    for (const error of errors) {
      fieldErrors[error.name] = error.message
    }

    return
  }

  await handleLogin()
}

</script>

<style scoped>
.auth-form {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.auth-form__head {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.auth-form__eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #0000ff;
}

.auth-form__title {
  font-size: 2.2rem;
  font-weight: 900;
  line-height: 0.95;
  letter-spacing: -0.06em;
  color: #0f172a;
}

@media (min-width: 640px) {
  .auth-form__title { font-size: 2.6rem; }
}

.auth-form__subtitle {
  font-size: 0.95rem;
  line-height: 1.7;
  color: #64748b;
  margin-top: 4px;
}

.auth-form__body {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.auth-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.auth-form__label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.auth-form__label {
  color: #0f172a;
  font-size: 0.9rem;
  font-weight: 800;
}

.auth-form__label span {
  color: #ef4444;
}

.auth-form__input {
  width: 100%;
  height: 3rem;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #ffffff;
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 600;
  outline: none;
  padding: 0 0.875rem;
  transition: border-color 0.16s ease, box-shadow 0.16s ease;
}

.auth-form__input::placeholder {
  color: #94a3b8;
}

.auth-form__input:focus {
  border-color: #0000ff;
  box-shadow: 0 0 0 3px rgba(0, 0, 255, 0.12);
}

.auth-form__field--invalid .auth-form__input {
  border-color: #dc2626;
}

.auth-form__password-wrap {
  position: relative;
}

.auth-form__input--password {
  padding-right: 3rem;
}

.auth-form__password-toggle {
  position: absolute;
  right: 0.45rem;
  top: 50%;
  display: inline-flex;
  width: 2.25rem;
  height: 2.25rem;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 10px;
  color: #475569;
  background: transparent;
  transform: translateY(-50%);
}

.auth-form__password-toggle:hover,
.auth-form__password-toggle:focus-visible {
  color: #0000ff;
  background: #eef2ff;
}

.auth-form__error {
  color: #b91c1c;
  font-size: 0.78rem;
  font-weight: 700;
}

.auth-form__status {
  border: 1px solid #fed7aa;
  border-radius: 12px;
  background: #fff7ed;
  color: #9a3412;
  font-size: 0.86rem;
  font-weight: 800;
  line-height: 1.5;
  padding: 0.85rem 1rem;
}

.auth-form__field-link {
  font-size: 0.82rem;
  font-weight: 700;
  color: #0000ff;
  text-decoration: none;
  transition: opacity 0.12s ease;
}

.auth-form__field-link:hover { opacity: 0.72; }

.auth-submit {
  display: inline-flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 0;
  background: #0000ff !important;
  border-radius: 14px !important;
  color: #ffffff !important;
  height: 3.5rem !important;
  font-size: 1rem !important;
  font-weight: 800 !important;
  margin-top: 4px;
  box-shadow: 0 12px 28px rgba(0, 0, 255, 0.2) !important;
  transition: all 0.2s ease !important;
}

.auth-submit:hover:not(:disabled) {
  background: #0000d8 !important;
  box-shadow: 0 16px 36px rgba(0, 0, 255, 0.28) !important;
  transform: translateY(-1px);
}

.auth-submit:disabled {
  background: #334155 !important;
  color: #ffffff !important;
  opacity: 0.78 !important;
}

.auth-form__footer-text {
  text-align: center;
  font-size: 0.9rem;
  color: #64748b;
}

.auth-form__footer-link {
  font-weight: 800;
  color: #0000ff;
  text-decoration: none;
}

.auth-form__footer-link:hover { opacity: 0.75; }
</style>
