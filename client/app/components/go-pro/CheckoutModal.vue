<template>
  <Teleport to="body">
    <div v-if="plan" class="fixed inset-0 z-50 flex items-end justify-center bg-black/42 px-3 py-4 backdrop-blur-[2px] sm:items-center" @click.self="$emit('close')">
      <form class="w-full max-w-[620px] rounded-[30px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-xl)]" @submit.prevent="submit">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-label-secondary text-[var(--color-primary-600)]">{{ t("pages.goProPage.checkoutEyebrow") }}</p>
            <h2 class="mt-1 text-heading text-[var(--text-primary)]">{{ plan.name }}</h2>
            <p class="mt-1 text-body-secondary">{{ billingCycle === "monthly" ? t("pages.goProPage.checkoutMonthly") : t("pages.goProPage.checkoutYearly") }}</p>
          </div>
          <button class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] bg-[var(--bg-surface-hover)] text-[var(--text-secondary)]" type="button" @click="$emit('close')">
            <Icon name="i-ph-x-bold" class="h-4 w-4" />
          </button>
        </div>

        <div class="mt-5 rounded-[24px] bg-[var(--bg-surface-hover)] p-4">
          <div class="flex items-center justify-between gap-4">
            <span class="text-[14px] font-bold text-[var(--text-secondary)]">{{ t("pages.goProPage.totalPayment") }}</span>
            <span class="text-2xl font-black text-[var(--text-primary)]">{{ formatProCurrency(amount, locale) }}</span>
          </div>
          <p class="mt-2 text-[12px] font-semibold text-[var(--text-tertiary)]">{{ t("pages.goProPage.mockPaymentNote") }}</p>
        </div>

        <div class="mt-5 grid gap-2 sm:grid-cols-3">
          <button
            v-for="method in paymentMethods"
            :key="method.value"
            class="rounded-[20px] border p-4 text-left transition"
            :class="paymentMethod === method.value ? 'border-[var(--border-strong)] bg-[var(--color-primary-50)] text-[var(--color-primary-600)]' : 'border-[var(--border-default)] bg-white text-[var(--text-secondary)]'"
            type="button"
            @click="paymentMethod = method.value"
          >
            <Icon :name="method.icon" class="h-6 w-6" />
            <p class="mt-3 text-[13px] font-extrabold">{{ method.label }}</p>
          </button>
        </div>

        <div v-if="submitted" class="mt-4 rounded-[18px] bg-[var(--color-primary-50)] px-4 py-3 text-[13px] font-bold text-[var(--color-primary-600)]">
          {{ t("pages.goProPage.checkoutSuccess") }}
        </div>

        <div class="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button class="h-11 rounded-[18px] border border-[var(--border-default)] bg-white px-5 text-[13px] font-bold text-[var(--text-secondary)]" type="button" @click="$emit('close')">{{ t("pages.goProPage.close") }}</button>
          <button class="h-11 rounded-[18px] bg-[var(--color-primary-500)] px-5 text-[13px] font-extrabold text-white shadow-[var(--shadow-brand)]" type="submit">{{ t("pages.goProPage.pay") }}</button>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { BillingCycle, PaymentMethodKey, ProCheckoutPayload, ProPlan } from "~/composables/useMockGoProData"
import { formatProCurrency } from "~/composables/useMockGoProData"

const props = defineProps<{
  plan?: ProPlan
  billingCycle: BillingCycle
  paymentMethods: ReadonlyArray<{ label: string; value: PaymentMethodKey; icon: string }>
}>()

const emit = defineEmits<{
  close: []
  checkout: [payload: ProCheckoutPayload]
}>()

const paymentMethod = ref<PaymentMethodKey>("wallet")
const submitted = ref(false)
const { t, locale } = useI18n()

const amount = computed(() => {
  if (!props.plan) return 0
  return props.billingCycle === "monthly" ? props.plan.monthlyPrice : props.plan.yearlyPrice
})

watch(() => props.plan?.id, () => {
  submitted.value = false
  paymentMethod.value = "wallet"
})

const submit = () => {
  if (!props.plan) return
  submitted.value = true
  emit("checkout", {
    planId: props.plan.id,
    billingCycle: props.billingCycle,
    paymentMethod: paymentMethod.value,
    amount: amount.value,
  })
}
</script>
