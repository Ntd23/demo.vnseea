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
          <p class="text-label-secondary text-[var(--text-tertiary)]">Gói ưu đãi</p>
          <h2 class="mt-1 text-heading text-[var(--text-primary)]">Chọn plan phù hợp</h2>
          <p class="mt-1 text-body-secondary">Các gói được đặt rộng hơn để đọc giá, quyền lợi và giới hạn rõ ràng.</p>
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

useSeoMeta({
  title: "Go Pro | VNSEEA",
  description: "So sánh packages, chọn plan và thanh toán mock để nâng cấp VNSEEA Pro.",
})

const billingCycle = ref<BillingCycle>("yearly")
const selectedPlan = ref<ProPlan>()
const checkouts = ref<ProCheckoutPayload[]>([])

const subscriptionState = computed(() => {
  const latest = checkouts.value[0]
  if (!latest) return currentSubscription

  const plan = plans.find(item => item.id === latest.planId)
  return {
    plan: plan?.name ?? "Pro",
    status: "Đang hoạt động",
    renewsAt: latest.billingCycle === "monthly" ? "Sau 30 ngày" : "Sau 12 tháng",
  }
})

const paymentHistory = computed(() =>
  checkouts.value.map((checkout, index) => {
    const plan = plans.find(item => item.id === checkout.planId)
    const method = paymentMethods.find(item => item.value === checkout.paymentMethod)
    return {
      id: index + 1,
      plan: plan?.name ?? "Pro",
      amount: formatProCurrency(checkout.amount),
      method: method?.label ?? "Payment",
      time: "Vừa xong",
    }
  }),
)

const heroStats = computed(() => [
  {
    label: "Packages",
    value: plans.length,
    description: "Starter, Creator, Business.",
  },
  {
    label: "Tiết kiệm",
    value: "2 tháng",
    description: "Khi chọn thanh toán yearly.",
  },
  {
    label: "Thanh toán",
    value: checkouts.value.length,
    description: "Giao dịch trong phiên này.",
  },
])

const selectPlan = (plan: ProPlan) => {
  selectedPlan.value = plan
}

const recordCheckout = (payload: ProCheckoutPayload) => {
  checkouts.value = [payload, ...checkouts.value]
}
</script>
