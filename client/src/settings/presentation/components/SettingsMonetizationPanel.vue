<template>
  <section class="settings-money" aria-labelledby="settings-money-title">
    <div class="settings-money__summary">
      <div class="settings-money__summary-main">
        <span class="settings-money__icon text-[var(--text-primary)]" aria-hidden="true">
          <Icon name="i-ph-currency-circle-dollar-bold" class="h-6 w-6" />
        </span>
        <div>
          <p class="settings-money__eyebrow">{{ t("settings.data.monetizationPanel.eyebrow") }}</p>
          <h2 id="settings-money-title" class="settings-money__title">
            {{ t(overview?.eligible ? "settings.data.monetizationPanel.readyTitle" : "settings.data.monetizationPanel.notReadyTitle") }}
          </h2>
          <p class="settings-money__description">{{ t("settings.data.monetizationPanel.description") }}</p>
        </div>
      </div>
      <span class="settings-money__status" :class="{ 'settings-money__status--active': overview?.enabled }">
        {{ t(overview?.enabled ? "settings.data.monetizationPanel.enabled" : "settings.data.monetizationPanel.disabled") }}
      </span>
    </div>

    <div class="settings-money__grid">
      <article class="settings-money__card">
        <p class="settings-money__card-label">{{ t("settings.data.monetizationPanel.walletBalance") }}</p>
        <strong class="settings-money__card-value">{{ formatCurrency(overview?.walletBalance ?? 0) }}</strong>
      </article>
      <article class="settings-money__card">
        <p class="settings-money__card-label">{{ t("settings.data.monetizationPanel.activePlans") }}</p>
        <strong class="settings-money__card-value">{{ activePlanCount }}</strong>
      </article>
    </div>

    <div class="settings-money__body">
      <article class="settings-money__panel">
        <h3 class="settings-money__section-title">{{ t("settings.data.monetizationPanel.requirementsTitle") }}</h3>
        <div class="settings-money__requirements">
          <div
            v-for="requirement in overview?.requirements ?? []"
            :key="requirement.key"
            class="settings-money__requirement"
          >
            <span class="settings-money__requirement-icon" :class="{ 'settings-money__requirement-icon--done': requirement.complete }">
              <Icon :name="requirement.complete ? 'i-ph-check-circle-bold' : 'i-ph-clock-bold'" class="h-4 w-4" />
            </span>
            <span>{{ requirementLabel(requirement.key) }}</span>
          </div>
        </div>
      </article>

      <article class="settings-money__panel">
        <div class="settings-money__section-heading">
          <div>
            <h3 class="settings-money__section-title">{{ t("settings.data.monetizationPanel.plansTitle") }}</h3>
            <p class="settings-money__section-description">{{ t("settings.data.monetizationPanel.plansDescription") }}</p>
          </div>
        </div>

        <div v-if="overview?.plans.length" class="settings-money__plans">
          <div v-for="plan in overview.plans" :key="plan.id" class="settings-money__plan">
            <div>
              <p class="settings-money__plan-title">{{ plan.title }}</p>
              <p class="settings-money__plan-description">{{ plan.description || t("settings.data.monetizationPanel.noPlanDescription") }}</p>
            </div>
            <div class="settings-money__plan-side">
              <strong>{{ formatCurrency(plan.price, plan.currency) }}</strong>
              <span :class="{ 'settings-money__status--active': plan.status === 'active' }" class="settings-money__status">
                {{ t(plan.status === "active" ? "settings.data.monetizationPanel.active" : "settings.data.monetizationPanel.inactive") }}
              </span>
            </div>
          </div>
        </div>

        <div v-else class="settings-money__empty">
          <Icon name="i-ph-package-bold" class="h-6 w-6" />
          <p>{{ t("settings.data.monetizationPanel.emptyPlans") }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { SettingsMonetizationOverview } from "../../domain/types/settings.types"

const props = defineProps<{
  overview: SettingsMonetizationOverview | null
}>()

const { t } = useI18n()

const activePlanCount = computed(() =>
  props.overview?.plans.filter(plan => plan.status === "active").length ?? 0,
)

const formatCurrency = (amount: number, currency = props.overview?.currency) => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(amount)
  }
  catch {
    return `${props.overview?.currencySymbol ?? ""}${new Intl.NumberFormat().format(amount)}`
  }
}

const requirementLabel = (key: string) =>
  t(`settings.data.monetizationPanel.requirements.${key}`)
</script>

<style scoped>
.settings-money {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.settings-money__summary,
.settings-money__card,
.settings-money__panel {
  border: 1px solid color-mix(in srgb, var(--bg-brand) 5%, transparent);
  border-radius: 16px;
  background: var(--bg-surface);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.settings-money__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 18px;
}

.settings-money__summary-main {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.settings-money__icon {
  display: flex;
  width: 52px;
  height: 52px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: linear-gradient(180deg, var(--bg-brand-hover) 0%, var(--bg-brand) 100%);
  color: #ffffff;
}

.settings-money__eyebrow,
.settings-money__card-label {
  margin: 0;
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.settings-money__title {
  margin: 0;
  color: var(--text-primary);
  font-size: 22px;
  font-weight: 800;
}

.settings-money__description,
.settings-money__section-description,
.settings-money__plan-description,
.settings-money__empty {
  margin: 4px 0 0;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
}

.settings-money__status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: var(--bg-muted);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

.settings-money__status--active {
  background: rgba(22, 163, 74, 0.12);
  color: #15803d;
}

.settings-money__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.settings-money__card {
  padding: 14px;
}

.settings-money__card-value {
  display: block;
  margin-top: 4px;
  color: var(--text-primary);
  font-size: 20px;
  font-weight: 800;
}

.settings-money__body {
  display: grid;
  grid-template-columns: minmax(220px, 0.8fr) minmax(0, 1.2fr);
  gap: 12px;
}

.settings-money__panel {
  padding: 16px;
}

.settings-money__section-title {
  margin: 0;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 800;
}

.settings-money__requirements,
.settings-money__plans {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 14px;
}

.settings-money__requirement,
.settings-money__plan {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  background: #fafbfe;
}

.settings-money__requirement-icon {
  display: flex;
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(100, 116, 139, 0.1);
  color: var(--text-secondary);
}

.settings-money__requirement-icon--done {
  background: rgba(22, 163, 74, 0.12);
  color: #16a34a;
}

.settings-money__plan {
  justify-content: space-between;
}

.settings-money__plan-title {
  margin: 0;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 800;
}

.settings-money__plan-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 800;
}

.settings-money__empty {
  display: flex;
  min-height: 128px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 14px;
  border: 1px dashed #cbd5e1;
  border-radius: 14px;
  background: #fafbfe;
}

@media (max-width: 860px) {
  .settings-money__summary,
  .settings-money__summary-main {
    align-items: flex-start;
  }

  .settings-money__summary {
    flex-direction: column;
  }

  .settings-money__grid,
  .settings-money__body {
    grid-template-columns: 1fr;
  }
}
</style>
