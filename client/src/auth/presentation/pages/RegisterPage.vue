<!-- English description: Registration form presentation for the backend-backed auth flow. -->

<template>
  <div class="auth-form">
    <div class="auth-form__head">
      <h3 class="auth-form__title">{{ $t('pages.registerPage.title') }}</h3>
    </div>

    <UForm :state="state" :validate="validate" class="auth-form__body" @submit="handleSubmit">
      <UFormField name="firstName" :label="$t('pages.registerPage.firstName')" required>
        <UInput
          v-model="state.firstName"
          type="text"
          autocomplete="name"
          size="xl"
          class="w-full"
          :placeholder="$t('pages.registerPage.firstNamePlaceholder')"
        />
      </UFormField>

    <div class="auth-form__row-2">
      <UFormField name="birthDay" :label="$t('pages.registerPage.birthday')" class="min-w-0">
        <div class="auth-birthday-selects">
          <USelect
            v-model="state.birthDay"
            :items="birthDayItems"
            value-key="value"
            label-key="label"
            :aria-label="$t('pages.registerPage.day')"
            size="xl"
            class="w-full min-w-0"
          />
          <USelect
            v-model="state.birthMonth"
            :items="birthMonthItems"
            value-key="value"
            label-key="label"
            :aria-label="$t('pages.registerPage.month')"
            size="xl"
            class="w-full min-w-0"
          />
          <USelect
            v-model="state.birthYear"
            :items="birthYearItems"
            value-key="value"
            label-key="label"
            :aria-label="$t('pages.registerPage.year')"
            size="xl"
            class="w-full min-w-0"
          />
        </div>
      </UFormField>

  <UFormField name="gender" :label="$t('pages.registerPage.gender')" class="min-w-0">
    <USelect
      v-model="state.gender"
      :items="genderItems"
      :placeholder="$t('pages.registerPage.gender')"
      size="xl"
      class="w-full"
    />
  </UFormField>
    </div>

      <UFormField name="email" :label="$t('pages.registerPage.loginIdentity')" required>
        <UInput v-model="state.email" type="text" autocomplete="username" size="xl"
          :placeholder="$t('pages.registerPage.loginIdentityPlaceholder')" class="w-full" />
      </UFormField>

      <UFormField name="password" :label="$t('pages.registerPage.newPassword')" required>
        <UInput v-model="state.password" :type="showPassword ? 'text' : 'password'" autocomplete="new-password"
          size="xl" class="w-full">
          <template #trailing>
            <UButton type="button" color="neutral" variant="ghost" size="sm"
              :icon="showPassword ? 'i-ph-eye-slash-duotone' : 'i-ph-eye-duotone'"
              :aria-label="showPassword ? $t('pages.registerPage.hidePassword') : $t('pages.registerPage.showPassword')"
              @click="showPassword = !showPassword" />
          </template>
        </UInput>
        <!-- Password strength bars -->
        <div class="auth-strength">
          <div v-for="i in 4" :key="i" class="auth-strength__bar" :class="{
            'auth-strength__bar--weak': strength >= 1 && i === 1,
            'auth-strength__bar--fair': strength >= 2 && i <= 2,
            'auth-strength__bar--good': strength >= 3 && i <= 3,
            'auth-strength__bar--strong': strength >= 4,
          }" />
        </div>
      </UFormField>

      <UFormField name="confirmPassword" :label="$t('pages.registerPage.confirmPassword')" required>
        <UInput v-model="state.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
          autocomplete="new-password" size="xl" :placeholder="$t('pages.registerPage.confirmPasswordPlaceholder')"
          class="w-full">
          <template #trailing>
            <UButton type="button" color="neutral" variant="ghost" size="sm"
              :icon="showConfirmPassword ? 'i-ph-eye-slash-duotone' : 'i-ph-eye-duotone'"
              :aria-label="$t('pages.registerPage.toggleConfirmPassword')"
              @click="showConfirmPassword = !showConfirmPassword" />
          </template>
        </UInput>
      </UFormField>

     <div class="auth-checklist">
  <UCheckbox
    v-model="state.hasExistingStorefront"
    :label="$t('pages.registerPage.storefrontQuestion')"
  />

  <UFormField name="acceptTerms" required>
    <UCheckbox v-model="state.acceptTerms" required="">
      <template #label>
        <span class="auth-check__text">
          {{ $t('pages.registerPage.termsAgreementPrefix') }}
          <a
            class="auth-check__link"
            :href="termsHref"
            target="_blank"
            rel="noreferrer"
            @click.stop
          >
            {{ $t('pages.registerPage.terms') }}
          </a>
          {{ $t('pages.registerPage.termsConnector') }}
          <a
            class="auth-check__link"
            :href="privacyHref"
            target="_blank"
            rel="noreferrer"
            @click.stop
          >
            {{ $t('pages.registerPage.privacy') }}
          </a>
        </span>
      </template>
    </UCheckbox>
  </UFormField>
</div>

      <UButton type="submit" color="primary" variant="solid" block size="xl" :loading="isSubmitting"
        loading-icon="i-lucide-loader-2" class="auth-submit">
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
const termsHref = appRoutes.termsOfUse
const privacyHref = appRoutes.privacyPolicy

const birthDayItems = Array.from({ length: 31 }, (_, index) => ({
  label: String(index + 1).padStart(2, '0'),
  value: index + 1,
}))
const birthMonthItems = Array.from({ length: 12 }, (_, index) => ({
  label: String(index + 1).padStart(2, '0'),
  value: index + 1,
}))
const birthYearItems = Array.from({ length: 1101 }, (_, index) => {
  const year = 1900 + index
  return {
    label: String(year),
    value: year,
  }
})
const genderOptions = [
  { value: 'female', labelKey: 'pages.registerPage.female' },
  { value: 'male', labelKey: 'pages.registerPage.male' },
  { value: 'custom', labelKey: 'pages.registerPage.custom' },
]
const genderItems = computed(() =>
  genderOptions.map(g => ({
    label: $t(g.labelKey),
    value: g.value
  }))
)
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
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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
  font-size: 1.8rem;
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
  gap: 0.85rem;
}

/* Row grids */
.auth-form__row-2 {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
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
  background: var(--bg-muted);
  transition: background 0.2s ease;
}

.auth-strength__bar--weak {
  background: var(--color-error);
}

.auth-strength__bar--fair {
  background: var(--color-warning);
}

.auth-strength__bar--good {
  background: var(--color-success);
}

.auth-strength__bar--strong {
  background: var(--bg-brand);
}

.auth-checklist {
  display: flex;
  flex-direction: column;
  gap: 12px;
}


.auth-check__text {
  font-size: 0.92rem;
  line-height: 1.65;
  color: var(--text-secondary);
}

.auth-check__link {
  color: var(--bg-brand);
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
  border: 1.5px solid var(--border-light);
  background: var(--bg-muted);
  cursor: pointer;
  transition: all 0.12s ease;
}

.auth-gender__option:hover {
  border-color: color-mix(in srgb, var(--bg-brand) 20%, transparent);
  background: color-mix(in srgb, var(--bg-brand) 2%, transparent);
}

.auth-gender__option--active {
  border-color: var(--bg-brand);
  background: color-mix(in srgb, var(--bg-brand) 4%, transparent);
}

.auth-gender__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.auth-gender__radio {
  width: 15px;
  height: 15px;
  accent-color: var(--bg-brand);
  cursor: pointer;
}

/* Submit button */
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

.auth-birthday-selects {
  display: grid;
  grid-template-columns: minmax(72px, 0.8fr) minmax(72px, 0.8fr) minmax(112px, 1.25fr);
  gap: 8px;
  width: 100%;
}

@media (max-width: 639px) {
  .auth-form__row-2 {
    grid-template-columns: 1fr;
  }

  .auth-birthday-selects {
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 0.8fr) minmax(0, 1.25fr);
  }
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
  text-decoration: none;
}
</style>
