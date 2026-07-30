<!-- English description: Renders affiliate progress, referrals, and help dialogs with shared theme tokens. -->

<template>
  <section class="settings-affiliates" aria-labelledby="settings-affiliates-title">
    <div class="settings-affiliates__summary">
      <div class="settings-affiliates__summary-main">
        <span class="settings-affiliates__icon" aria-hidden="true">
          <Icon name="i-ph-gift-bold" class="h-6 w-6" />
        </span>
        <div>
          <p class="settings-affiliates__eyebrow">{{ t("settings.data.affiliatesPanel.eyebrow") }}</p>
          <h2 id="settings-affiliates-title" class="settings-affiliates__title">
            {{ t("settings.data.affiliatesPanel.title") }}
          </h2>
          <p class="settings-affiliates__description">{{ t("settings.data.affiliatesPanel.description") }}</p>
        </div>
      </div>
    </div>

    <div class="settings-affiliates__stats">
      <article class="settings-affiliates__stat">
        <span class="settings-affiliates__stat-icon settings-affiliates__stat-icon--green" aria-hidden="true">
          <Icon name="i-ph-hand-coins-bold" class="h-5 w-5" />
        </span>
        <div>
          <p class="settings-affiliates__stat-label">{{ t("settings.data.affiliatesPanel.rewardPerReferral") }}</p>
          <strong class="settings-affiliates__stat-value">{{ formatCurrency(overview?.rewardAmount ?? 0) }}</strong>
        </div>
      </article>
      <article class="settings-affiliates__stat">
        <span class="settings-affiliates__stat-icon settings-affiliates__stat-icon--blue" aria-hidden="true">
          <Icon name="i-ph-check-circle-bold" class="h-5 w-5" />
        </span>
        <div>
          <p class="settings-affiliates__stat-label">{{ t("settings.data.affiliatesPanel.qualifiedReferrals") }}</p>
          <strong class="settings-affiliates__stat-value">{{ overview?.qualifiedReferrals ?? 0 }}</strong>
        </div>
      </article>
      <article class="settings-affiliates__stat">
        <span class="settings-affiliates__stat-icon settings-affiliates__stat-icon--amber" aria-hidden="true">
          <Icon name="i-ph-wallet-bold" class="h-5 w-5" />
        </span>
        <div>
          <p class="settings-affiliates__stat-label">{{ t("settings.data.affiliatesPanel.availableReward") }}</p>
          <strong class="settings-affiliates__stat-value">{{ formatCurrency(availableReward) }}</strong>
        </div>
      </article>
    </div>

    <div class="settings-affiliates__link-panel">
      <label class="settings-affiliates__label" for="settings-affiliates-link">
        {{ t("settings.data.affiliatesPanel.referralLink") }}
      </label>
      <div class="settings-affiliates__link-row">
        <input
          id="settings-affiliates-link"
          class="settings-affiliates__input"
          :value="overview?.referralLink ?? ''"
          readonly
        >
        <button class="settings-affiliates__copy" type="button" @click="copyReferralLink">
          <Icon name="i-ph-copy-bold" class="h-4 w-4" />
          <span>{{ copied ? t("settings.data.affiliatesPanel.copied") : t("settings.data.affiliatesPanel.copy") }}</span>
        </button>
      </div>
    </div>

    <div class="settings-affiliates__progress-panel">
      <div class="settings-affiliates__progress-heading">
        <div>
          <h3 class="settings-affiliates__section-title">{{ t("settings.data.affiliatesPanel.accountRequirementsTitle") }}</h3>
          <p class="settings-affiliates__section-description">
            {{ t("settings.data.affiliatesPanel.accountRequirementsDescription") }}
          </p>
        </div>
      </div>
      <div class="settings-affiliates__requirements">
        <div
          v-for="requirement in overview?.requirements ?? []"
          :key="requirement.key"
          class="settings-affiliates__requirement"
        >
          <Icon :name="requirement.complete ? 'i-ph-check-circle-bold' : 'i-ph-clock-bold'" class="h-4 w-4" />
          <span>{{ requirementLabel(requirement.key) }}</span>
        </div>
      </div>
    </div>

    <article class="settings-affiliates__list-panel">
      <div class="settings-affiliates__progress-heading">
        <div>
          <h3 class="settings-affiliates__section-title">{{ t("settings.data.affiliatesPanel.referralsTitle") }}</h3>
          <p class="settings-affiliates__section-description">{{ t("settings.data.affiliatesPanel.referralsDescription") }}</p>
        </div>
        <button
          class="settings-affiliates__heading-help"
          type="button"
          :aria-label="t('settings.data.affiliatesPanel.progressHelpOpen')"
          @click="openProgressHelp"
        >
          <Icon name="i-ph-warning-circle-bold" class="h-4 w-4" />
        </button>
      </div>

      <div v-if="overview?.referrals.length" class="settings-affiliates__list" role="list">
        <div
          v-for="referral in overview.referrals"
          :key="referral.id"
          class="settings-affiliates__item"
          role="listitem"
        >
          <img
            v-if="referral.avatar"
            class="settings-affiliates__avatar"
            :src="referral.avatar"
            :alt="referral.name"
          >
          <span v-else class="settings-affiliates__avatar settings-affiliates__avatar--fallback">
            {{ initials(referral.name) }}
          </span>
          <div class="settings-affiliates__item-copy">
            <p class="settings-affiliates__item-title">{{ referral.name }}</p>
            <p class="settings-affiliates__item-meta">
              {{ referral.username ? `@${referral.username}` : t("settings.data.affiliatesPanel.noUsername") }}
            </p>
            <div class="settings-affiliates__person-progress">
              <div class="settings-affiliates__person-progress-head">
                <span>{{ t("settings.data.affiliatesPanel.personProgress") }}</span>
                <strong>{{ referral.progressPercent }}%</strong>
              </div>
              <div class="settings-affiliates__progress" aria-hidden="true">
                <span :style="{ width: `${referral.progressPercent}%` }" />
              </div>
              <div class="settings-affiliates__person-steps">
                <span :class="{ 'settings-affiliates__person-step--done': referral.profileComplete }">
                  <Icon :name="referral.profileComplete ? 'i-ph-check-circle-bold' : 'i-ph-circle-dashed'" class="h-3.5 w-3.5" />
                  {{ t("settings.data.affiliatesPanel.personProfileComplete") }}
                </span>
                <span :class="{ 'settings-affiliates__person-step--done': referral.verified }">
                  <Icon :name="referral.verified ? 'i-ph-check-circle-bold' : 'i-ph-circle-dashed'" class="h-3.5 w-3.5" />
                  {{ t("settings.data.affiliatesPanel.personVerified") }}
                </span>
              </div>
            </div>
          </div>
          <div class="settings-affiliates__item-side">
            <span class="settings-affiliates__badge" :class="{ 'settings-affiliates__badge--done': referral.rewardEligible }">
              {{ referralStatusLabel(referral.status) }}
            </span>
            <strong>{{ formatCurrency(referral.rewardEligible ? referral.rewardAmount : 0) }}</strong>
          </div>
        </div>
      </div>

      <div v-else class="settings-affiliates__empty">
        <Icon name="i-ph-users-three-bold" class="h-6 w-6" />
        <p>{{ t("settings.data.affiliatesPanel.emptyReferrals") }}</p>
      </div>
    </article>

    <Teleport to="body">
      <div
        v-if="isProgressHelpOpen"
        class="settings-affiliates-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-affiliates-modal-title"
      >
        <button
          class="settings-affiliates-modal__backdrop"
          type="button"
          :aria-label="t('settings.data.affiliatesPanel.progressHelpClose')"
          @click="closeProgressHelp"
        />
        <div class="settings-affiliates-modal__panel">
          <div class="settings-affiliates-modal__header">
            <div>
              <p class="settings-affiliates__eyebrow">{{ t("settings.data.affiliatesPanel.personProgress") }}</p>
              <h2 id="settings-affiliates-modal-title" class="settings-affiliates-modal__title">
                {{ t("settings.data.affiliatesPanel.progressHelpTitle") }}
              </h2>
            </div>
            <button
              class="settings-affiliates-modal__close"
              type="button"
              :aria-label="t('settings.data.affiliatesPanel.progressHelpClose')"
              @click="closeProgressHelp"
            >
              <Icon name="i-ph-x" class="h-4 w-4" />
            </button>
          </div>

          <p class="settings-affiliates-modal__description">
            {{ t("settings.data.affiliatesPanel.progressHelpDescription") }}
          </p>

          <div class="settings-affiliates-modal__steps">
            <div class="settings-affiliates-modal__step">
              <span class="settings-affiliates-modal__step-icon">
                <Icon name="i-ph-number-circle-one-bold" class="h-4 w-4" />
              </span>
              <div>
                <strong>{{ t("settings.data.affiliatesPanel.personProfileComplete") }}</strong>
                <p>{{ t("settings.data.affiliatesPanel.progressHelpProfile") }}</p>
              </div>
            </div>
            <div class="settings-affiliates-modal__step">
              <span class="settings-affiliates-modal__step-icon">
                <Icon name="i-ph-number-circle-two-bold" class="h-4 w-4" />
              </span>
              <div>
                <strong>{{ t("settings.data.affiliatesPanel.personVerified") }}</strong>
                <p>{{ t("settings.data.affiliatesPanel.progressHelpVerified") }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import type { SettingsAffiliateReferral, SettingsAffiliatesOverview, SettingsUser } from "../../domain/types/settings.types"

const props = defineProps<{
  overview: SettingsAffiliatesOverview | null
  user: SettingsUser | null
}>()

const { t } = useI18n()
const { locale } = useI18n()
const copied = ref(false)
const isProgressHelpOpen = ref(false)

const availableReward = computed(() =>
  props.overview?.referrals.reduce((total, referral) =>
    total + (referral.rewardEligible ? referral.rewardAmount : 0), 0,
  ) ?? 0,
)

const toNumber = (value: unknown) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  const normalized = String(value ?? "").replace(/[^\d.-]/g, "")
  const number = Number(normalized)
  return Number.isFinite(number) ? number : 0
}

const formatterLocale = computed(() => locale.value === "vi" ? "vi-VN" : "en-US")
const sourceCurrency = computed(() => props.overview?.currency || "USD")
const displayCurrency = computed(() =>
  locale.value === "vi"
    ? props.user?.pointsConfig?.displayCurrency || "VND"
    : "USD",
)
const displayExchangeRate = computed(() => {
  const configuredRate = toNumber(props.user?.pointsConfig?.displayExchangeRate)
  if (configuredRate > 1) return configuredRate

  const walletRate = toNumber(props.user?.pointsConfig?.walletExchangeRate)
  return walletRate > 1 ? walletRate : 0
})

const convertMoneyForLocale = (amount: number) => {
  if (sourceCurrency.value === displayCurrency.value) {
    return amount
  }

  if (sourceCurrency.value === "USD" && displayCurrency.value === "VND" && displayExchangeRate.value > 0) {
    return amount * displayExchangeRate.value
  }

  if (sourceCurrency.value === "VND" && displayCurrency.value === "USD" && displayExchangeRate.value > 0) {
    return amount / displayExchangeRate.value
  }

  return amount
}

const formatCurrency = (amount: number) => {
  const convertedAmount = convertMoneyForLocale(amount)
  const fractionDigits = displayCurrency.value === "VND"
    ? 0
    : Number.isInteger(convertedAmount) ? 0 : 2

  try {
    return new Intl.NumberFormat(formatterLocale.value, {
      style: "currency",
      currency: displayCurrency.value,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(convertedAmount)
  }
  catch {
    const symbol = displayCurrency.value === props.user?.pointsConfig?.displayCurrency
      ? props.user?.pointsConfig?.displayCurrencySymbol || displayCurrency.value
      : props.overview?.currencySymbol ?? displayCurrency.value

    return `${new Intl.NumberFormat(formatterLocale.value, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(convertedAmount)} ${symbol}`
  }
}

const requirementLabel = (key: string) =>
  t(`settings.data.affiliatesPanel.requirements.${key}`)

const referralStatusLabel = (status: SettingsAffiliateReferral["status"]) => {
  if (status === "paid") return t("settings.data.affiliatesPanel.paid")
  if (status === "qualified") return t("settings.data.affiliatesPanel.qualified")
  return t("settings.data.affiliatesPanel.pending")
}

const initials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join("")

const copyText = async (value: string) => {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(value)
    return true
  }

  const textarea = document.createElement("textarea")
  textarea.value = value
  textarea.setAttribute("readonly", "true")
  textarea.style.position = "fixed"
  textarea.style.left = "-9999px"
  textarea.style.top = "0"
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()

  try {
    return document.execCommand("copy")
  }
  finally {
    document.body.removeChild(textarea)
  }
}

const copyReferralLink = async () => {
  const link = props.overview?.referralLink
  if (!link) return

  try {
    const success = await copyText(link)
    copied.value = success
    window.setTimeout(() => {
      copied.value = false
    }, 1800)
  }
  catch {
    copied.value = false
  }
}

const openProgressHelp = () => {
  isProgressHelpOpen.value = true
}

const closeProgressHelp = () => {
  isProgressHelpOpen.value = false
}
</script>

<style scoped>
.settings-affiliates {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.settings-affiliates__summary,
.settings-affiliates__stat,
.settings-affiliates__link-panel,
.settings-affiliates__progress-panel,
.settings-affiliates__list-panel {
  border: 1px solid var(--border-light);
  border-radius: 16px;
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
}

.settings-affiliates__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 18px;
}

.settings-affiliates__summary-main {
  display: flex;
  align-items: center;
  gap: 14px;
}

.settings-affiliates__icon {
  display: flex;
  width: 52px;
  height: 52px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: linear-gradient(180deg, var(--bg-brand-hover) 0%, var(--bg-brand) 100%);
  color: var(--text-inverse);
}

.settings-affiliates__eyebrow,
.settings-affiliates__label {
  margin: 0;
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.settings-affiliates__title {
  margin: 0;
  color: var(--text-primary);
  font-size: 22px;
  font-weight: 800;
}

.settings-affiliates__description,
.settings-affiliates__section-description,
.settings-affiliates__item-meta,
.settings-affiliates__empty {
  margin: 4px 0 0;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
}

.settings-affiliates__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.settings-affiliates__stat {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
}

.settings-affiliates__stat-icon {
  display: flex;
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.settings-affiliates__stat-icon--green {
  background: color-mix(in srgb, var(--color-success) 12%, transparent);
  color: var(--text-success);
}

.settings-affiliates__stat-icon--blue {
  background: color-mix(in srgb, var(--bg-brand) 6%, transparent);
  color: var(--text-brand);
}

.settings-affiliates__stat-icon--amber {
  background: color-mix(in srgb, var(--color-warning) 12%, transparent);
  color: var(--color-warning);
}

.settings-affiliates__stat-label {
  margin: 0;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 800;
}

.settings-affiliates__stat-value {
  display: block;
  margin-top: 3px;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 900;
}

.settings-affiliates__link-panel,
.settings-affiliates__progress-panel,
.settings-affiliates__list-panel {
  padding: 16px;
}

.settings-affiliates__link-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  margin-top: 8px;
}

.settings-affiliates__input {
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  outline: none;
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 700;
}

.settings-affiliates__copy {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  border: none;
  border-radius: 12px;
  background: var(--bg-brand);
  color: var(--text-inverse);
  cursor: pointer;
  font-size: 13px;
  font-weight: 800;
}

.settings-affiliates__progress-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.settings-affiliates__progress-heading strong {
  color: var(--text-brand);
  font-size: 20px;
  font-weight: 900;
}

.settings-affiliates__section-title {
  margin: 0;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 800;
}

.settings-affiliates__progress {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--bg-surface-active);
}

.settings-affiliates__progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--color-success);
}

.settings-affiliates__requirements {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 14px;
}

.settings-affiliates__requirement {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 10px;
  border-radius: 12px;
  background: var(--bg-muted);
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 800;
}

.settings-affiliates__requirement .iconify {
  flex: 0 0 auto;
  color: var(--text-success);
}

.settings-affiliates__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 14px;
}

.settings-affiliates__item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 11px;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  background: var(--bg-muted);
}

.settings-affiliates__heading-help {
  display: inline-flex;
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-light);
  border-radius: 10px;
  background: var(--bg-surface);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.settings-affiliates__heading-help:hover {
  border-color: color-mix(in srgb, var(--color-success) 22%, transparent);
  background: color-mix(in srgb, var(--color-success) 8%, transparent);
  color: var(--text-success);
}

.settings-affiliates__avatar {
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  border-radius: 50%;
  object-fit: cover;
}

.settings-affiliates__avatar--fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--bg-brand) 8%, transparent);
  color: var(--text-brand);
  font-size: 12px;
  font-weight: 900;
}

.settings-affiliates__item-copy {
  min-width: 0;
  flex: 1;
}

.settings-affiliates__item-title {
  overflow: hidden;
  margin: 0;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.settings-affiliates__badge {
  display: inline-flex;
  min-height: 28px;
  align-items: center;
  padding: 0 10px;
  border-radius: 999px;
  background: var(--bg-muted);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

.settings-affiliates__badge--done {
  background: color-mix(in srgb, var(--color-success) 12%, transparent);
  color: var(--text-success);
}

.settings-affiliates__person-progress {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-top: 10px;
}

.settings-affiliates__person-progress-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 800;
}

.settings-affiliates__person-progress-head strong {
  color: var(--text-brand);
}

.settings-affiliates__person-steps {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.settings-affiliates__person-steps span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  background: var(--bg-muted);
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 800;
}

.settings-affiliates__person-step--done {
  background: color-mix(in srgb, var(--color-success) 12%, transparent) !important;
  color: var(--text-success) !important;
}

.settings-affiliates__item-side {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.settings-affiliates__item-side strong {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 900;
  white-space: nowrap;
}

.settings-affiliates__empty {
  display: flex;
  min-height: 132px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 14px;
  border: 1px dashed var(--border-strong);
  border-radius: 14px;
  background: var(--bg-muted);
}

.settings-affiliates-modal {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
}

.settings-affiliates-modal__backdrop {
  position: absolute;
  inset: 0;
  border: none;
  background: color-mix(in srgb, var(--bg-media) 48%, transparent);
  cursor: pointer;
}

.settings-affiliates-modal__panel {
  position: relative;
  z-index: 1;
  width: min(100%, 460px);
  padding: 18px;
  border: 1px solid var(--border-light);
  border-radius: 18px;
  background: var(--bg-surface);
  box-shadow: var(--shadow-xl);
}

.settings-affiliates-modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.settings-affiliates-modal__title {
  margin: 0;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 900;
  line-height: 1.25;
}

.settings-affiliates-modal__close {
  display: inline-flex;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-light);
  border-radius: 10px;
  background: var(--bg-surface);
  color: var(--text-secondary);
  cursor: pointer;
}

.settings-affiliates-modal__description {
  margin: 12px 0 0;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.55;
}

.settings-affiliates-modal__steps {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 14px;
}

.settings-affiliates-modal__step {
  display: flex;
  gap: 10px;
  padding: 12px;
  border-radius: 12px;
  background: var(--bg-muted);
}

.settings-affiliates-modal__step-icon {
  display: inline-flex;
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--bg-surface-active);
  color: var(--text-secondary);
}

.settings-affiliates-modal__step-icon--done {
  background: color-mix(in srgb, var(--color-success) 12%, transparent);
  color: var(--text-success);
}

.settings-affiliates-modal__step strong {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 900;
}

.settings-affiliates-modal__step p {
  margin: 3px 0 0;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.5;
}

.settings-affiliates-modal__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
  padding: 12px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--color-success) 8%, transparent);
  color: var(--text-success);
  font-size: 13px;
  font-weight: 900;
}

@media (max-width: 860px) {
  .settings-affiliates__summary,
  .settings-affiliates__summary-main {
    align-items: flex-start;
  }

  .settings-affiliates__summary {
    flex-direction: column;
  }

  .settings-affiliates__link-row,
  .settings-affiliates__requirements,
  .settings-affiliates__stats {
    grid-template-columns: 1fr;
  }

  .settings-affiliates__copy {
    width: 100%;
  }

  .settings-affiliates__item {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
  }

  .settings-affiliates__item-side {
    grid-column: 2;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }
}
</style>
