<!-- English description: Account confirmation presentation for backend account activation. -->

<template>
  <div class="auth-form">
    <div class="auth-form__head">
      <h1 class="auth-form__title">{{ $t('pages.confirmAccountPage.title') }}</h1>
      <p class="auth-form__subtitle">
        {{ $t('pages.confirmAccountPage.subtitle') }}
      </p>
    </div>

    <UAlert
      v-if="!pageReady"
      color="warning"
      variant="subtle"
      icon="i-ph-warning-circle-fill"
      :title="$t('pages.confirmAccountPage.invalidTitle')"
      :description="$t('pages.confirmAccountPage.invalidDescription')"
      class="rounded-[14px]"
    />

    <UForm
      v-else
      :state="state"
      :validate="validate"
      class="auth-form__body"
      @submit="handleSubmit"
    >
      <UFormField name="code" :label="$t('pages.confirmAccountPage.codeLabel')" required>
        <UPinInput
          :model-value="otpDigits"
          :length="6"
          type="number"
          otp
          required
          autofocus
          class="otp-inputs"
          @update:model-value="updateOtpDigits"
        />
      </UFormField>

      <button type="button" class="auth-resend" :disabled="!canResend" @click="resendCode">
        <span v-if="resendState === 'loading'">Đang gửi...</span>
        <span v-else-if="resendRemaining > 0">Gửi lại mã sau {{ resendRemaining }}s</span>
        <span v-else>Gửi lại mã xác nhận</span>
      </button>
      <p v-if="resendMessage" class="auth-resend__message" :class="`auth-resend__message--${resendState}`">{{ resendMessage }}</p>

      <UAlert
        v-if="submitState === 'error' && submitMessage"
        color="error"
        variant="subtle"
        icon="i-ph-warning-circle-fill"
        :title="$t('pages.confirmAccountPage.statusErrorTitle')"
        :description="submitMessage"
        class="rounded-[14px]"
      />

      <UAlert
        v-if="submitState === 'success' && submitMessage"
        color="success"
        variant="subtle"
        icon="i-ph-check-circle-fill"
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
        :disabled="submitState === 'success'"
        loading-icon="i-lucide-loader-2"
        class="auth-submit"
      >
        {{ $t('pages.confirmAccountPage.submit') }}
      </UButton>

      <p class="auth-form__footer-text">
        {{ $t('pages.confirmAccountPage.restartQuestion') }}
        <button type="button" class="auth-form__footer-link auth-form__footer-button" @click="backToWelcome">
          {{ $t('pages.confirmAccountPage.backToSignIn') }}
        </button>
      </p>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { useConfirmAccountPageVM } from "../../application/view-models/useConfirmAccountPageVM"

const {
  state,
  pageReady,
  submitState,
  submitMessage,
  validate,
  handleSubmit,
  resendRemaining, resendState, resendMessage, canResend, resendCode,
  backToWelcome,
} = useConfirmAccountPageVM()

const otpDigits = ref<number[]>([])

function updateOtpDigits(digits: number[]) {
  otpDigits.value = digits
  state.code = digits.join("")
}

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

.otp-inputs {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
}

.otp-inputs :deep(input) {
  height: 54px;
  padding: 0;
  border-color: #e2e8f0;
  background: #fafbfe;
  text-align: center;
  font-size: 24px;
  font-weight: 800;
}

.auth-resend {
  align-self: center;
  border: 0;
  background: transparent;
  color: #0000ff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: color 0.15s ease;
}

.auth-resend:disabled {
  color: #94a3b8;
  cursor: not-allowed;
}

.auth-resend__message {
  margin: -8px 0 0;
  text-align: center;
  font-size: 13px;
}

.auth-resend__message--success {
  color: #15803d;
}

.auth-resend__message--error {
  color: #dc2626;
}

.auth-form__title {
  font-size: 2.2rem;
  font-weight: 900;
  line-height: 0.95;
  letter-spacing: -0.06em;
  color: #0f172a;
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

.auth-submit {
  border-radius: 14px !important;
  height: 3.5rem !important;
  font-size: 1rem !important;
  font-weight: 800 !important;
  margin-top: 4px;
  box-shadow: 0 12px 28px rgba(0, 0, 255, 0.2) !important;
}

.auth-form__footer-text {
  text-align: center;
  font-size: 0.9rem;
  color: #64748b;
}

.auth-form__footer-link {
  font-weight: 800;
  color: #0000ff;
}

.auth-form__footer-button {
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 0;
}
</style>
