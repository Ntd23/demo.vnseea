<template>
  <UCard
    class="overflow-hidden rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]"
    :ui="{ body: 'p-0' }"
  >
    <div class="border-b border-[var(--border-default)] p-5">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p class="text-label-secondary text-[var(--color-primary-600)]">
            {{ t("pages.goProPage.comparisonEyebrow") }}
          </p>
          <h2 class="mt-1 text-heading text-[var(--text-primary)]">
            {{ t("pages.goProPage.comparisonTitle") }}
          </h2>
          <p class="mt-1 text-body-secondary">
            {{ t("pages.goProPage.comparisonDescription") }}
          </p>
        </div>

        <UAlert
          color="primary"
          variant="subtle"
          icon="i-ph-table-fill"
          :title="t('pages.goProPage.comparisonStatusTitle')"
          :description="statusLabel"
          class="max-w-[420px] rounded-[22px]"
        />
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full min-w-[760px] text-left">
        <thead class="bg-[var(--bg-surface-hover)]">
          <tr>
            <th class="px-5 py-4 text-[12px] font-black uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
              {{ t("pages.goProPage.featureColumn") }}
            </th>
            <th
              v-for="plan in plans"
              :key="plan.id"
              class="px-5 py-4 align-top"
              :class="selectedPlanId === plan.id ? 'bg-[var(--color-primary-50)]' : ''"
            >
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <p class="text-[12px] font-black uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
                    {{ plan.name }}
                  </p>
                  <UBadge
                    v-if="selectedPlanId === plan.id"
                    color="primary"
                    variant="subtle"
                    class="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                  >
                    {{ t("pages.goProPage.selectedPlan") }}
                  </UBadge>
                </div>
                <p class="text-[1rem] font-black text-[var(--text-primary)]">
                  {{ formatProCurrency(getProPlanPrice(plan, billingCycle), locale) }}
                </p>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.label"
            class="border-t border-[var(--border-default)]"
          >
            <td class="px-5 py-4 text-[14px] font-extrabold text-[var(--text-primary)]">
              {{ row.label }}
            </td>
            <td
              v-for="plan in plans"
              :key="plan.id"
              class="px-5 py-4"
              :class="selectedPlanId === plan.id ? 'bg-[var(--color-primary-50)]/60' : ''"
            >
              <div class="flex items-center gap-2">
                <Icon
                  :name="row[plan.id] ? 'i-ph-check-circle-fill' : 'i-ph-x-circle-fill'"
                  class="h-5 w-5"
                  :class="row[plan.id] ? 'text-[var(--color-success)]' : 'text-[var(--text-tertiary)]'"
                />
                <span class="text-[12px] font-semibold text-[var(--text-secondary)]">
                  {{ row[plan.id] ? t("pages.goProPage.featureIncluded") : t("pages.goProPage.featureNotIncluded") }}
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { BillingCycle, ProComparisonRow, ProPlan, ProPlanKey } from "~/composables/useMockGoProData"
import { formatProCurrency, getProPlanPrice } from "~/composables/useMockGoProData"

const props = withDefaults(defineProps<{
  plans: ReadonlyArray<ProPlan>
  rows: ReadonlyArray<ProComparisonRow>
  billingCycle: BillingCycle
  selectedPlanId?: ProPlanKey | ""
}>(), {
  selectedPlanId: "",
})

const { t, locale } = useI18n()

const selectedPlanLabel = computed(() =>
  props.plans.find(plan => plan.id === props.selectedPlanId)?.name ?? "",
)

const statusLabel = computed(() => {
  if (selectedPlanLabel.value) {
    return t("pages.goProPage.comparisonStatusSelected", {
      plan: selectedPlanLabel.value,
    })
  }

  return t("pages.goProPage.comparisonStatusDefault")
})
</script>
