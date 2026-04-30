<template>
  <div class="auth-form">
    <div class="auth-form__head">
      <p class="auth-form__eyebrow">{{ $t('pages.registerPage.eyebrow') }}</p>
      <h1 class="auth-form__title">{{ $t('pages.registerPage.title') }}</h1>
      <p class="auth-form__subtitle">{{ $t('pages.registerPage.subtitle') }}</p>
    </div>

    <UForm
      :state="state"
      :validate="validate"
      class="auth-form__body"
      @submit="handleSubmit"
    >
      <div class="auth-form__row-2">
        <UFormField name="firstName" :label="$t('pages.registerPage.firstName')" required class="min-w-0">
          <UInput
            v-model="state.firstName"
            size="xl"
            :placeholder="$t('pages.registerPage.firstNamePlaceholder')"
            class="w-full"
            :ui="inputUi"
          />
        </UFormField>
        <UFormField name="lastName" :label="$t('pages.registerPage.lastName')" required class="min-w-0">
          <UInput
            v-model="state.lastName"
            size="xl"
            :placeholder="$t('pages.registerPage.lastNamePlaceholder')"
            class="w-full"
            :ui="inputUi"
          />
        </UFormField>
      </div>

      <UFormField name="username" label="Username" required>
        <UInput
          v-model="state.username"
          type="text"
          autocomplete="username"
          size="xl"
          class="w-full"
          placeholder="Enter your username"
          :ui="inputUi"
        />
      </UFormField>

      <UFormField name="birthDay" :label="$t('pages.registerPage.birthday')">
        <div class="auth-form__row-3">
          <USelect
            v-model="state.birthDay"
            :items="dayOptions"
            size="xl"
            :placeholder="$t('pages.registerPage.day')"
            class="flex-1"
            :ui="inputUi"
          />
          <USelect
            v-model="state.birthMonth"
            :items="monthOptions"
            size="xl"
            :placeholder="$t('pages.registerPage.month')"
            class="flex-1"
            :ui="inputUi"
          />
          <USelect
            v-model="state.birthYear"
            :items="yearOptions"
            size="xl"
            :placeholder="$t('pages.registerPage.year')"
            class="flex-1"
            :ui="inputUi"
          />
        </div>
      </UFormField>

      <UFormField name="gender" :label="$t('pages.registerPage.gender')">
        <div class="auth-gender">
          <label
            v-for="g in genderOptions"
            :key="g.value"
            class="auth-gender__option"
            :class="{ 'auth-gender__option--active': state.gender === g.value }"
          >
            <span class="auth-gender__label">{{ $t(g.labelKey) }}</span>
            <input
              v-model="state.gender"
              class="auth-gender__radio"
              name="gender"
              type="radio"
              :value="g.value"
            >
          </label>
        </div>
      </UFormField>

      <UFormField name="email" label="Tên đăng nhập (Địa chỉ email / Số điện thoại)" required>
        <UInput
          v-model="state.email"
          type="text"
          autocomplete="username"
          size="xl"
          placeholder="Nhập địa chỉ email hoặc số điện thoại"
          class="w-full"
          :ui="inputUi"
        />
      </UFormField>

      <UFormField name="password" :label="$t('pages.registerPage.newPassword')" required>
        <UInput
          v-model="state.password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="new-password"
          size="xl"
          class="w-full"
          :ui="inputUi"
        >
          <template #trailing>
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              size="sm"
              :icon="showPassword ? 'i-ph-eye-slash-duotone' : 'i-ph-eye-duotone'"
              :aria-label="showPassword ? $t('pages.registerPage.hidePassword') : $t('pages.registerPage.showPassword')"
              @click="showPassword = !showPassword"
            />
          </template>
        </UInput>
        <!-- Password strength bars -->
        <div class="auth-strength">
          <div
            v-for="i in 4"
            :key="i"
            class="auth-strength__bar"
            :class="{
              'auth-strength__bar--weak':   strength >= 1 && i === 1,
              'auth-strength__bar--fair':   strength >= 2 && i <= 2,
              'auth-strength__bar--good':   strength >= 3 && i <= 3,
              'auth-strength__bar--strong': strength >= 4,
            }"
          />
        </div>
      </UFormField>

      <UFormField name="confirmPassword" label="Confirm password" required>
        <UInput
          v-model="state.confirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          autocomplete="new-password"
          size="xl"
          class="w-full"
          :ui="inputUi"
        >
          <template #trailing>
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              size="sm"
              :icon="showConfirmPassword ? 'i-ph-eye-slash-duotone' : 'i-ph-eye-duotone'"
              aria-label="Toggle confirm password visibility"
              @click="showConfirmPassword = !showConfirmPassword"
            />
          </template>
        </UInput>
      </UFormField>

      <div class="auth-checklist">
        <label class="auth-check">
          <input v-model="state.hasExistingStorefront" class="auth-check__input" type="checkbox">
          <span class="auth-check__box" />
          <span class="auth-check__text">Bạn là cửa hàng đã có sẵn địa điểm?</span>
        </label>

        <UFormField name="acceptTerms" required>
          <label class="auth-check">
            <input v-model="state.acceptTerms" class="auth-check__input" type="checkbox">
            <span class="auth-check__box" />
            <span class="auth-check__text">
              Bằng cách tạo tài khoản của bạn, bạn đồng ý với
              <a class="auth-check__link" :href="termsHref" target="_blank" rel="noreferrer">Điều khoản sử dụng</a>
              &
              <a class="auth-check__link" :href="privacyHref" target="_blank" rel="noreferrer">Chính sách bảo mật</a>
            </span>
          </label>
        </UFormField>
      </div>

      <UButton
        type="submit"
        color="primary"
        variant="solid"
        block
        size="xl"
        :loading="isSubmitting"
        loading-icon="i-lucide-loader-2"
        class="auth-submit"
      >
        {{ isSubmitting ? $t('pages.registerPage.submitting') : $t('pages.registerPage.submit') }}
      </UButton>

      <p class="auth-form__footer-text">
        {{ $t('pages.registerPage.hasAccount') }}
        <NuxtLink class="auth-form__footer-link" :to="appRoutes.welcome">
          {{ $t('pages.registerPage.login') }}
        </NuxtLink>
      </p>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { appRoutes } from '#shared-kernel/application/constants/route-registry'
import { useRegisterPageVM } from '../../application/view-models/useRegisterPageVM'

const { t } = useI18n()
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const { state, isSubmitting, validate, handleSubmit } = useRegisterPageVM()
const termsHref = '#'
const privacyHref = '#'

const inputUi = {
  base: 'rounded-[14px] border-[1.5px] border-slate-200 bg-[#fafbfe]',
}

const dayOptions = Array.from({ length: 31 }, (_, i) => ({ label: String(i + 1), value: i + 1 }))
const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  label: t('pages.registerPage.monthShort', { month: i + 1 }),
  value: i + 1,
}))
const yearOptions = Array.from({ length: 70 }, (_, i) => ({ label: String(2025 - i), value: 2025 - i }))

const genderOptions = [
  { value: 'female', labelKey: 'pages.registerPage.female' },
  { value: 'male', labelKey: 'pages.registerPage.male' },
  { value: 'custom', labelKey: 'pages.registerPage.custom' },
]

const strength = computed(() => {
  const p = state.password
  if (!p) return 0
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
})
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

/* Row grids */
.auth-form__row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.auth-form__row-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}

/* Password strength */
.auth-strength {
  display: flex;
  gap: 4px;
  margin-top: 8px;
}

.auth-strength__bar {
  height: 3px;
  flex: 1;
  border-radius: 999px;
  background: #e2e8f0;
  transition: background 0.2s ease;
}

.auth-strength__bar--weak   { background: #ef4444; }
.auth-strength__bar--fair   { background: #f59e0b; }
.auth-strength__bar--good   { background: #22c55e; }
.auth-strength__bar--strong { background: #0000ff; }

.auth-checklist {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.auth-check {
  display: grid;
  grid-template-columns: 20px 20px 1fr;
  gap: 12px;
  align-items: start;
  cursor: pointer;
}

.auth-check__input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.auth-check__box {
  grid-column: 2;
  margin-top: 2px;
  display: block;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 1.5px solid #cbd5e1;
  background: #fff;
  transition: all 0.15s ease;
}

.auth-check__input:checked + .auth-check__box {
  border-color: #0000ff;
  background: #0000ff;
  box-shadow: inset 0 0 0 4px #fff;
}

.auth-check__text {
  font-size: 0.92rem;
  line-height: 1.65;
  color: #475569;
}

.auth-check__link {
  color: #0000ff;
  font-weight: 700;
  text-decoration: none;
}

/* Gender radio pills */
.auth-gender {
  display: flex;
  gap: 8px;
}

.auth-gender__option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  background: #fafbfe;
  cursor: pointer;
  transition: all 0.12s ease;
}

.auth-gender__option:hover {
  border-color: rgba(0, 0, 255, 0.2);
  background: rgba(0, 0, 255, 0.02);
}

.auth-gender__option--active {
  border-color: #0000ff;
  background: rgba(0, 0, 255, 0.04);
}

.auth-gender__label {
  font-size: 13px;
  font-weight: 500;
  color: #334155;
}

.auth-gender__radio {
  width: 15px;
  height: 15px;
  accent-color: #0000ff;
  cursor: pointer;
}

/* Submit button */
.auth-submit {
  border-radius: 14px !important;
  height: 3.5rem !important;
  font-size: 1rem !important;
  font-weight: 800 !important;
  margin-top: 4px;
  box-shadow: 0 12px 28px rgba(0, 0, 255, 0.2) !important;
}

.auth-submit:hover {
  box-shadow: 0 16px 36px rgba(0, 0, 255, 0.28) !important;
  transform: translateY(-1px);
}

/* Footer */
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
</style>
