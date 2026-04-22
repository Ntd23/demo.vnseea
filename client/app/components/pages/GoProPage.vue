<template>
  <div class="space-y-5 pb-10">
    <GoProHero
      :payments="paymentHistory"
      :stats="heroStats"
      :subscription="subscriptionState"
    />

    <GoProBillingToggle v-model="billingCycle" />

    <section class="rounded-[30px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-md)]">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-label-secondary text-[var(--text-tertiary)]">{{ t("pages.goProPage.plansEyebrow") }}</p>
          <h2 class="mt-1 text-heading text-[var(--text-primary)]">{{ t("pages.goProPage.plansTitle") }}</h2>
          <p class="mt-1 text-body-secondary">{{ t("pages.goProPage.plansDescription") }}</p>
        </div>
      </div>

      <div class="mt-5 grid gap-5 xl:grid-cols-3">
        <GoProPlanCard
          v-for="plan in plans"
          :key="plan.id"
          :billing-cycle="billingCycle"
          :plan="plan"
          @select="selectPlan"
        />
      </div>
    </section>

    <GoProComparisonTable
      :plans="plans"
      :rows="comparisonRows"
    />

    <GoProCheckoutModal
      :billing-cycle="billingCycle"
      :payment-methods="paymentMethods"
      :plan="selectedPlan"
      @checkout="recordCheckout"
      @close="selectedPlan = undefined"
    />
  </div>
</template>

<script setup lang="ts">
import type { BillingCycle, ProCheckoutPayload, ProPlan } from "~/composables/useMockGoProData"
import { formatProCurrency } from "~/composables/useMockGoProData"

const { plans, comparisonRows, paymentMethods, currentSubscription } = useMockGoProData()
const { t, locale } = useI18n()

useSeoMeta({
  title: () => t("pages.goProPage.seoTitle"),
  description: () => t("pages.goProPage.seoDescription"),
})

const billingCycle = ref<BillingCycle>("yearly")
const selectedPlan = ref<ProPlan>()
const checkouts = ref<ProCheckoutPayload[]>([])

const subscriptionState = computed(() => {
  const latest = checkouts.value[0]
  if (!latest) return currentSubscription.value

  const plan = plans.value.find(item => item.id === latest.planId)
  return {
    plan: plan?.name ?? t("pages.goProPage.subscriptionFallbackPlan"),
    status: t("pages.goProPage.subscriptionActive"),
    renewsAt: latest.billingCycle === "monthly" ? t("pages.goProPage.renewsMonthly") : t("pages.goProPage.renewsYearly"),
  }
})

const paymentHistory = computed(() =>
  checkouts.value.map((checkout, index) => {
    const plan = plans.value.find(item => item.id === checkout.planId)
    const method = paymentMethods.value.find(item => item.value === checkout.paymentMethod)
    return {
      id: index + 1,
      plan: plan?.name ?? t("pages.goProPage.subscriptionFallbackPlan"),
      amount: formatProCurrency(checkout.amount, locale.value),
      method: method?.label ?? t("pages.goProPage.paymentFallbackMethod"),
      time: t("pages.goProPage.justNow"),
    }
  }),
)

const heroStats = computed(() => [
  {
    label: t("pages.goProPage.statPackages"),
    value: plans.value.length,
    description: t("pages.goProPage.statPackagesDescription"),
  },
  {
    label: t("pages.goProPage.statSavings"),
    value: t("pages.goProPage.statSavingsValue"),
    description: t("pages.goProPage.statSavingsDescription"),
  },
  {
    label: t("pages.goProPage.statPayments"),
    value: checkouts.value.length,
    description: t("pages.goProPage.statPaymentsDescription"),
  },
])

const selectPlan = (plan: ProPlan) => {
  selectedPlan.value = plan
}

const recordCheckout = (payload: ProCheckoutPayload) => {
  checkouts.value = [payload, ...checkouts.value]
}
</script>
