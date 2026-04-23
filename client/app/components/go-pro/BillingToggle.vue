<template>
  <UCard
    class="rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]"
    :ui="{ body: 'p-5' }"
  >
    <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
      <div class="max-w-[680px]">
        <p class="text-label-secondary text-[var(--color-primary-600)]">
          {{ t("pages.goProPage.billingEyebrow") }}
        </p>
        <h2 class="mt-1 text-heading text-[var(--text-primary)]">
          {{ t("pages.goProPage.billingTitle") }}
        </h2>
        <p class="mt-1 text-body-secondary">
          {{ t("pages.goProPage.billingDescription") }}
        </p>
      </div>

      <UBadge
        color="warning"
        variant="subtle"
        class="justify-center rounded-full px-4 py-2 text-[12px] font-semibold"
      >
        {{ t("pages.goProPage.yearlySavingsBadge", { percent: yearlySavingsPercent }) }}
      </UBadge>
    </div>

    <div class="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <URadioGroup
        v-model="model"
        :items="billingOptions"
        value-key="value"
        label-key="label"
        color="primary"
        variant="card"
        indicator="end"
        size="xl"
        :ui="radioGroupUi"
      >
        <template #legend>
          <span class="sr-only">{{ t("pages.goProPage.billingTitle") }}</span>
        </template>

        <template #label="{ item }">
          <div class="flex min-w-0 items-center gap-2">
            <span class="truncate text-[0.98rem] font-semibold text-[var(--text-primary)]">
              {{ item.label }}
            </span>
            <UBadge
              v-if="item.value === 'yearly'"
              color="warning"
              variant="subtle"
              class="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
            >
              {{ t("pages.goProPage.yearlySavingsShort", { percent: yearlySavingsPercent }) }}
            </UBadge>
          </div>
        </template>

        <template #description="{ item }">
          <span class="text-[13px] leading-5 text-[var(--text-secondary)]">
            {{ item.description }}
          </span>
        </template>
      </URadioGroup>

      <UAlert
        color="primary"
        variant="subtle"
        icon="i-ph-currency-circle-dollar-fill"
        :title="t('pages.goProPage.billingStatusTitle')"
        :description="statusLabel"
        class="rounded-[24px]"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { BillingCycle } from "~/composables/useMockGoProData"

const model = defineModel<BillingCycle>({ default: "yearly" })

withDefaults(defineProps<{
  statusLabel?: string
  yearlySavingsPercent?: number
}>(), {
  statusLabel: "",
  yearlySavingsPercent: 0,
})

const { t } = useI18n()

const billingOptions = computed(() => [
  {
    label: t("pages.goProPage.monthly"),
    value: "monthly",
    description: t("pages.goProPage.billingMonthlyDescription"),
  },
  {
    label: t("pages.goProPage.yearlySavings"),
    value: "yearly",
    description: t("pages.goProPage.billingYearlyDescription"),
  },
])

const radioGroupUi = {
  fieldset: "grid grid-cols-1 gap-3 md:grid-cols-2",
  item: "min-h-[5rem] items-start rounded-[1.2rem] border px-4 py-4 transition",
  container: "h-full",
  wrapper: "flex-1",
  label: "text-[0.98rem] font-semibold",
  description: "mt-1 text-sm leading-5 text-[var(--text-secondary)]",
  base: "size-5 ring-[var(--border-default)] bg-white data-[state=checked]:ring-[var(--color-primary-500)]",
}
</script>
