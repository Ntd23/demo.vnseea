<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between gap-3 text-[12px] font-bold text-[var(--text-secondary)]">
      <span>{{ formatFundingCurrency(raised, locale.value) }}</span>
      <span>{{ percent }}%</span>
    </div>

    <UProgress
      :model-value="clampedPercent"
      color="primary"
      size="xl"
      :aria-label="progressAriaLabel"
    />

    <p class="text-[12px] font-semibold text-[var(--text-tertiary)]">
      {{ t("pages.fundingPage.goalAmount", { amount: formatFundingCurrency(goal, locale.value) }) }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { formatFundingCurrency } from "../../infrastructure/mocks/fundingCatalog"

const props = defineProps<{
  raised: number
  goal: number
}>()

const { t, locale } = useI18n()

const safeGoal = computed(() => (props.goal > 0 ? props.goal : 0))

const percent = computed(() => {
  if (!safeGoal.value) return 0
  return Math.round((props.raised / safeGoal.value) * 100)
})

const clampedPercent = computed(() => Math.min(Math.max(percent.value, 0), 100))

const progressAriaLabel = computed(() =>
  t("pages.fundingPage.progressAriaLabel", {
    raised: formatFundingCurrency(props.raised, locale.value),
    goal: formatFundingCurrency(props.goal, locale.value),
    percent: percent.value,
  }),
)
</script>
