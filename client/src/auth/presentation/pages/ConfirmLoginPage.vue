<!-- English description: Login confirmation presentation for two-factor backend auth. -->

<template>
  <div class="auth-form">
    <div class="auth-form__head">
      <p class="auth-form__eyebrow">{{ $t('pages.confirmLoginPage.eyebrow') }}</p>
      <h1 class="auth-form__title">{{ $t('pages.confirmLoginPage.title') }}</h1>
      <p class="auth-form__subtitle">
        {{ $t('pages.confirmLoginPage.subtitle') }}
      </p>
    </div>

    <UAlert
      v-if="!pageReady"
      color="warning"
      variant="subtle"
      icon="i-ph-warning-circle-fill"
      :title="$t('pages.confirmLoginPage.invalidTitle')"
      :description="$t('pages.confirmLoginPage.invalidDescription')"
      class="rounded-[14px]"
    />

    <UForm
      v-else
      :state="state"
      :validate="validate"
      class="auth-form__body"
      @submit="handleSubmit"
    >
      <UFormField name="code" :label="$t('pages.confirmLoginPage.codeLabel')" required>
        <UInput
          v-model="state.code"
          type="text"
          autocomplete="one-time-code"
          size="xl"
          :placeholder="$t('pages.confirmLoginPage.codePlaceholder')"
          class="w-full"
        />
      </UFormField>

      <UAlert
        v-if="submitState === 'error' && submitMessage"
        color="error"
        variant="subtle"
        icon="i-ph-warning-circle-fill"
        :title="$t('pages.confirmLoginPage.statusErrorTitle')"
        :description="submitMessage"
        class="rounded-[14px]"
      />

      <UButton
        type="submit"
        color="primary"
        variant="solid"
        block
        size="xl"
        :loading="submitState === 'loading'"
        loading-icon="i-lucide-loader-2"
        class="auth-submit"
      >
        {{ $t('pages.confirmLoginPage.submit') }}
      </UButton>

      <p class="auth-form__footer-text">
        {{ $t('pages.confirmLoginPage.restartQuestion') }}
        <button type="button" class="auth-form__footer-link auth-form__footer-button" @click="backToWelcome">
          {{ $t('pages.confirmLoginPage.backToSignIn') }}
        </button>
      </p>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { useConfirmLoginPageVM } from "../../application/view-models/useConfirmLoginPageVM"

const {
  state,
  pageReady,
  submitState,
  submitMessage,
  validate,
  handleSubmit,
  backToWelcome,
} = useConfirmLoginPageVM()

</script>

<style scoped>
.auth-form {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
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
  color: var(--bg-brand);
}

.auth-form__title {
  font-size: 2.2rem;
  font-weight: 900;
  line-height: 0.95;
  letter-spacing: -0.06em;
  color: var(--text-primary);
}

.auth-form__subtitle {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--text-secondary);
  margin-top: 4px;
}

.auth-form__body {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.auth-submit {
  display: inline-flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 0;
  border-radius: 14px !important;
  background: var(--bg-brand) !important;
  color: var(--text-inverse) !important;
  height: 3.5rem !important;
  font-size: 1rem !important;
  font-weight: 800 !important;
  margin-top: 4px;
  box-shadow: 0 12px 28px color-mix(in srgb, var(--bg-brand) 20%, transparent) !important;
  transition: all 0.2s ease !important;
  cursor: pointer;
}

.auth-submit:hover:not(:disabled) {
  background: var(--bg-brand-hover) !important;
  box-shadow: 0 16px 36px color-mix(in srgb, var(--bg-brand) 28%, transparent) !important;
  transform: translateY(-1px);
}

.auth-submit:disabled {
  opacity: 0.7 !important;
  cursor: not-allowed;
}

.auth-form__footer-text {
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.auth-form__footer-link {
  font-weight: 800;
  color: var(--bg-brand);
}

.auth-form__footer-button {
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 0;
}
</style>
