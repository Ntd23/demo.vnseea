<template>
  <article>
    <UCard
      class="relative flex h-full flex-col overflow-hidden rounded-[30px] border bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]"
      :class="cardClass"
      :ui="{ body: 'p-6' }"
    >
      <div class="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-[30px]" :class="plan.highlight ? 'bg-[linear-gradient(90deg,var(--color-primary-500),var(--color-accent-500))]' : 'bg-[var(--bg-surface-hover)]'" />

      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <UBadge color="primary" variant="subtle" class="rounded-full px-3 py-1.5 text-[11px] font-bold">
              {{ plan.badge }}
            </UBadge>

            <UBadge
              v-if="selected"
              color="success"
              variant="subtle"
              class="rounded-full px-3 py-1.5 text-[11px] font-bold"
            >
              {{ t("pages.goProPage.selectedPlan") }}
            </UBadge>

            <UBadge
              v-else-if="plan.highlight"
              color="warning"
              variant="subtle"
              class="rounded-full px-3 py-1.5 text-[11px] font-bold"
            >
              {{ t("pages.goProPage.bestValueBadge") }}
            </UBadge>
          </div>

          <h3 class="mt-4 text-2xl font-black text-[var(--text-primary)]">
            {{ plan.name }}
          </h3>
          <p class="mt-2 min-h-[48px] text-[13px] font-semibold leading-6 text-[var(--text-secondary)]">
            {{ plan.description }}
          </p>
        </div>

        <Icon
          :name="selected ? 'i-ph-check-circle-fill' : plan.highlight ? 'i-ph-star-fill' : 'i-ph-crown-simple-fill'"
          class="h-7 w-7 shrink-0"
          :class="selected ? 'text-[var(--color-success)]' : plan.highlight ? 'text-[var(--color-accent-500)]' : 'text-[var(--color-primary-500)]'"
        />
      </div>

      <UCard
        class="mt-6 rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface-hover)]"
        :ui="{ body: 'p-4' }"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="break-words text-[1.8rem] font-black leading-tight text-[var(--text-primary)] 2xl:text-[2.15rem]">
              {{ formatProCurrency(price, locale) }}
            </p>
            <p class="mt-1 text-[12px] font-semibold text-[var(--text-tertiary)]">
              {{ billingCycle === "monthly" ? t("pages.goProPage.billedMonthly") : t("pages.goProPage.billedYearly") }}
            </p>
          </div>

          <UBadge
            v-if="billingCycle === 'yearly' && savingsPercent > 0"
            color="warning"
            variant="subtle"
            class="rounded-full px-3 py-1.5 text-[11px] font-bold"
          >
            {{ t("pages.goProPage.savePercent", { percent: savingsPercent }) }}
          </UBadge>
        </div>

        <p v-if="billingCycle === 'yearly'" class="mt-3 text-[12px] font-semibold text-[var(--text-secondary)]">
          {{ t("pages.goProPage.perMonthEquivalent", { amount: formatProCurrency(monthlyEquivalent, locale) }) }}
        </p>
      </UCard>

      <ul class="mt-6 grid gap-3">
        <li
          v-for="feature in plan.features"
          :key="feature"
          class="flex gap-2 text-[13px] font-semibold leading-5 text-[var(--text-secondary)]"
        >
          <Icon name="i-ph-check-circle-fill" class="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]" />
          {{ feature }}
        </li>
      </ul>

      <div class="mt-6 grid gap-2">
        <div
          v-for="item in plan.limits"
          :key="item.label"
          class="flex items-center justify-between rounded-[18px] bg-[var(--bg-surface-hover)] px-3 py-2"
        >
          <span class="text-[12px] font-bold text-[var(--text-tertiary)]">{{ item.label }}</span>
          <span class="text-[12px] font-black text-[var(--text-primary)]">{{ item.value }}</span>
        </div>
      </div>

      <UButton
        type="button"
        :color="selected ? 'success' : plan.highlight ? 'primary' : 'neutral'"
        :variant="selected ? 'solid' : plan.highlight ? 'solid' : 'outline'"
        size="lg"
        class="mt-auto justify-center rounded-full"
        :aria-pressed="selected"
        @click="emit('select', plan)"
      >
        <Icon :name="selected ? 'i-ph-check-circle-fill' : 'i-ph-crown-simple-fill'" class="mr-1.5 h-5 w-5" />
        {{ selected ? t("pages.goProPage.selectedPlanAction") : t("pages.goProPage.selectPlan") }}
      </UButton>
    </UCard>
  </article>
</template>

<script setup lang="ts">
import type { BillingCycle, ProPlan } from "~/composables/useMockGoProData"
import { formatProCurrency, getProPlanPrice, getProSavingsPercent } from "~/composables/useMockGoProData"

const props = withDefaults(defineProps<{
  plan: ProPlan
  billingCycle: BillingCycle
  selected?: boolean
}>(), {
  selected: false,
})

const emit = defineEmits<{ select: [plan: ProPlan] }>()

const { t, locale } = useI18n()

const price = computed(() => getProPlanPrice(props.plan, props.billingCycle))

const savingsPercent = computed(() => getProSavingsPercent(props.plan))

const monthlyEquivalent = computed(() => Math.round(props.plan.yearlyPrice / 12))

const cardClass = computed(() =>
  props.selected
    ? "border-[var(--color-success)] ring-4 ring-sky-50 shadow-[var(--shadow-xl)]"
    : props.plan.highlight
      ? "border-[var(--color-primary-500)] shadow-[var(--shadow-xl)]"
      : "border-[var(--border-default)] shadow-[var(--shadow-md)]",
)
</script>
