<!-- English description: Backend-backed Pro package comparison page aligned to the WoWonder go-pro phtml plan table. -->
<template>
  <main class="mx-auto w-full max-w-6xl space-y-5 px-3 py-4 sm:px-5">
    <section class="surface-card p-4 sm:p-5">
      <div class="flex items-center gap-3">
        <span class="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-surface-active)] text-[var(--text-brand)]">
          <Icon name="i-ph-rocket-launch-duotone" class="h-6 w-6" />
        </span>
        <div>
          <p class="text-label-secondary">PRO</p>
          <h1 class="text-heading">{{ t("pages.goProPage.plansTitle") }}</h1>
        </div>
      </div>
    </section>

    <section v-if="pending" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <USkeleton v-for="index in 4" :key="index" class="h-96 rounded-[var(--radius-xl)]" />
    </section>

    <UAlert v-else-if="error" color="error" variant="soft" :title="String(error.message || error)" />

    <section v-else-if="packages.length" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="plan in packages"
        :key="plan.id"
        class="surface-card-hover flex flex-col overflow-hidden"
      >
        <div class="p-5 text-white" :style="{ background: plan.color }">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-xl font-black">{{ plan.name }}</h2>
            <UBadge v-if="plan.isCurrent" color="neutral" variant="soft" class="bg-white/20 text-white">
              {{ t("pages.goProPage.currentPlanLabel") }}
            </UBadge>
          </div>
          <p class="mt-4 text-3xl font-black">
            {{ formatMoney(plan.price, plan.currency, plan.currencySymbol) }}
          </p>
        </div>

        <div class="flex flex-1 flex-col gap-4 p-5">
          <ul class="space-y-3">
            <li
              v-for="[key, value] in Object.entries(plan.features)"
              :key="key"
              class="flex items-start justify-between gap-3 border-b border-[var(--border-light)] pb-2 text-sm"
            >
              <span class="font-semibold text-[var(--text-secondary)]">{{ normalizeFeature(key) }}</span>
              <span class="font-bold text-[var(--text-primary)]">{{ formatFeature(value) }}</span>
            </li>
          </ul>

          <UButton
            color="primary"
            block
            class="mt-auto rounded-[var(--radius-full)]"
            :disabled="plan.isCurrent"
            :loading="upgradingType === plan.id"
            @click="upgrade(plan.id)"
          >
            {{ plan.isCurrent ? t("pages.goProPage.currentPlanLabel") : t("pages.goProPage.pay") }}
          </UButton>
        </div>
      </article>
    </section>

    <UCard v-else class="surface-card text-center" :ui="{ body: 'p-8' }">
      <Icon name="i-ph-rocket-launch-duotone" class="mx-auto h-10 w-10 text-[var(--text-tertiary)]" />
      <h2 class="text-heading mt-3">{{ t("pages.goProPage.emptyPaymentsTitle") }}</h2>
      <p class="text-body-secondary mt-2">{{ t("pages.goProPage.emptyPaymentsDescription") }}</p>
    </UCard>
  </main>
</template>

<script setup lang="ts">
import { formatCurrency } from "../../../shared-kernel/application/utils/formatCurrency"
import { useGoProPageVM } from "../../application/view-models/useGoProPageVM"

const { t, locale } = useI18n()
const {
  packages,
  pending,
  error,
  upgradingType,
  upgrade,
} = useGoProPageVM()

const formatMoney = (amount: number, currency: string, currencySymbol: string) =>
  formatCurrency(amount, {
    currency,
    currencySymbol,
    locale: locale.value,
  })

const normalizeFeature = (key: string) =>
  key.replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase())

const formatFeature = (value: boolean | string | number) => {
  if (value === true) return t("pages.goProPage.featureIncluded")
  if (value === false) return t("pages.goProPage.featureNotIncluded")
  return String(value || t("pages.goProPage.featureNotIncluded"))
}
</script>
