<template>
  <div>
    <div class="flex items-center justify-between gap-3 text-[12px] font-bold text-[var(--text-secondary)]">
      <span>{{ formatFundingCurrency(raised) }}</span>
      <span>{{ percent }}%</span>
    </div>
    <div class="mt-2 h-3 overflow-hidden rounded-full bg-[var(--color-secondary-100)]">
      <div
        class="h-full rounded-full bg-[var(--color-primary-500)] transition-all"
        :style="{ width: `${Math.min(percent, 100)}%` }"
      />
    </div>
    <p class="mt-2 text-[12px] font-semibold text-[var(--text-tertiary)]">
      Mục tiêu {{ formatFundingCurrency(goal) }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { formatFundingCurrency } from "~/composables/useMockFundingData"

const props = defineProps<{
  raised: number
  goal: number
}>()

const percent = computed(() => Math.round((props.raised / props.goal) * 100))
</script>
