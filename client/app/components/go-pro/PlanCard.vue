<template>
  <article
    class="relative flex min-h-[620px] flex-col rounded-[30px] border bg-white p-6 shadow-[var(--shadow-md)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
    :class="plan.highlight ? 'border-[var(--border-strong)] ring-4 ring-[var(--color-primary-50)]' : 'border-[var(--border-default)]'"
  >
    <div class="flex items-start justify-between gap-3">
      <div>
        <span class="rounded-[var(--radius-full)] bg-[var(--color-primary-50)] px-3 py-1.5 text-[12px] font-extrabold text-[var(--color-primary-600)]">
          {{ plan.badge }}
        </span>
        <h3 class="mt-4 text-2xl font-black text-[var(--text-primary)]">{{ plan.name }}</h3>
        <p class="mt-2 min-h-[48px] text-[13px] font-semibold leading-6 text-[var(--text-secondary)]">{{ plan.description }}</p>
      </div>
      <Icon v-if="plan.highlight" name="i-ph-star-fill" class="h-7 w-7 shrink-0 text-[var(--color-accent-500)]" />
    </div>

    <div class="mt-6 rounded-[24px] bg-[var(--bg-surface-hover)] p-4">
      <p class="break-words text-[1.8rem] font-black leading-tight text-[var(--text-primary)] 2xl:text-[2.15rem]">{{ formatProCurrency(price) }}</p>
      <p class="mt-1 text-[12px] font-semibold text-[var(--text-tertiary)]">/{{ billingCycle === "monthly" ? "tháng" : "năm" }}</p>
    </div>

    <ul class="mt-6 grid gap-3">
      <li v-for="feature in plan.features" :key="feature" class="flex gap-2 text-[13px] font-semibold leading-5 text-[var(--text-secondary)]">
        <Icon name="i-ph-check-circle-fill" class="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]" />
        {{ feature }}
      </li>
    </ul>

    <div class="mt-6 grid gap-2">
      <div v-for="item in plan.limits" :key="item.label" class="flex items-center justify-between rounded-[18px] bg-[var(--bg-surface-hover)] px-3 py-2">
        <span class="text-[12px] font-bold text-[var(--text-tertiary)]">{{ item.label }}</span>
        <span class="text-[12px] font-black text-[var(--text-primary)]">{{ item.value }}</span>
      </div>
    </div>

    <button
      class="mt-auto inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-full)] text-[14px] font-extrabold transition"
      :class="plan.highlight ? 'bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-brand)]' : 'border border-[var(--border-default)] bg-white text-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)]'"
      type="button"
      @click="$emit('select', plan)"
    >
      <Icon name="i-ph-crown-simple-fill" class="h-5 w-5" />
      Chọn plan
    </button>
  </article>
</template>

<script setup lang="ts">
import type { BillingCycle, ProPlan } from "~/composables/useMockGoProData"
import { formatProCurrency } from "~/composables/useMockGoProData"

const props = defineProps<{
  plan: ProPlan
  billingCycle: BillingCycle
}>()

defineEmits<{ select: [plan: ProPlan] }>()

const price = computed(() => props.billingCycle === "monthly" ? props.plan.monthlyPrice : props.plan.yearlyPrice)
</script>
