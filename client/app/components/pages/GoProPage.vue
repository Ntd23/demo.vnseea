<template>
  <div class="mx-auto max-w-[1440px] space-y-5 px-3 pb-12 sm:px-5 lg:px-6">
    <GoProHero
      :payments="paymentHistory"
      :stats="heroStats"
      :subscription="subscriptionState"
      :billing-label="activeBillingLabel"
      :selected-plan-name="focusedPlan?.name"
      :has-active-selection="hasRouteState"
      @select-featured="selectFeaturedPlan"
      @reset="resetSelection"
    />

    <GoProBillingToggle
      v-model="billingCycle"
      :status-label="selectionStatusLabel"
      :yearly-savings-percent="featuredPlanSavingsPercent"
    />

    <div id="go-pro-plans" class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
      <section class="min-w-0 space-y-5">
        <section class="rounded-[24px] border border-[#dbe3f2] bg-white p-5 shadow-[0_10px_28px_rgba(15,35,110,0.05)]">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-[11px] font-extrabold uppercase text-slate-500">
                {{ t("pages.goProPage.plansEyebrow") }}
              </p>
              <h2 class="mt-1 text-[26px] font-black leading-tight text-[var(--text-primary)]">
                {{ t("pages.goProPage.plansShortTitle") }}
              </h2>
            </div>

            <button
              v-if="hasRouteState"
              type="button"
              class="inline-flex h-10 items-center justify-center rounded-[14px] border border-secondary-200 bg-white px-4 text-[12px] font-extrabold text-[var(--text-primary)] transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 active:scale-95"
              @click="resetSelection"
            >
              {{ t("pages.goProPage.resetSelection") }}
            </button>
          </div>

          <div class="mt-5 grid gap-5 xl:grid-cols-3">
            <GoProPlanCard
              v-for="plan in plans"
              :key="plan.id"
              :billing-cycle="billingCycle"
              :plan="plan"
              :selected="focusedPlan?.id === plan.id"
              @select="selectPlan"
            />
          </div>
        </section>

        <GoProComparisonTable
          :billing-cycle="billingCycle"
          :plans="plans"
          :rows="comparisonRows"
          :selected-plan-id="focusedPlanId || ''"
        />
      </section>

      <GoProSidebar
        :subscription="subscriptionState"
        :payments="paymentHistory"
        :stats="sidebarStats"
        :status-label="selectionStatusLabel"
        :selected-plan="focusedPlan"
        :has-active-selection="hasRouteState"
        @reset="resetSelection"
      />
    </div>

    <GoProCheckoutModal
      :billing-cycle="billingCycle"
      :payment-methods="paymentMethods"
      :plan="checkoutPlan"
      @checkout="recordCheckout"
      @close="closeCheckout"
    />
  </div>
</template>

<script setup lang="ts">
import type { LocationQueryRaw } from "vue-router"
import type { BillingCycle, ProCheckoutPayload, ProPlan, ProPlanKey } from "~/composables/useMockGoProData"
import {
  defaultBillingCycle,
  formatProCurrency,
  getProPlanPrice,
  getProSavingsPercent,
  normalizeBillingCycle,
  normalizeProPlanKey,
  readGoProQueryValue,
  useMockGoProData,
} from "~/composables/useMockGoProData"

const { plans, comparisonRows, paymentMethods, currentSubscription } = useMockGoProData()
const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

const billingCycle = ref<BillingCycle>(
  normalizeBillingCycle(readGoProQueryValue(route.query.billing)),
)
const focusedPlanId = ref<ProPlanKey | "">(
  normalizeProPlanKey(readGoProQueryValue(route.query.plan)),
)
const checkoutPlanId = ref<ProPlanKey | null>(null)
const checkouts = ref<ProCheckoutPayload[]>([])

const activeBillingLabel = computed(() =>
  billingCycle.value === "monthly"
    ? t("pages.goProPage.monthly")
    : t("pages.goProPage.yearlySavings"),
)

const featuredPlan = computed(() =>
  plans.value.find(plan => plan.highlight) ?? plans.value[1] ?? plans.value[0] ?? null,
)

const featuredPlanSavingsPercent = computed(() =>
  featuredPlan.value ? getProSavingsPercent(featuredPlan.value) : 0,
)

const focusedPlan = computed<ProPlan | null>(() =>
  plans.value.find(plan => plan.id === focusedPlanId.value) ?? null,
)

const checkoutPlan = computed<ProPlan | null>(() =>
  plans.value.find(plan => plan.id === checkoutPlanId.value) ?? null,
)

const hasRouteState = computed(() =>
  billingCycle.value !== defaultBillingCycle || Boolean(focusedPlanId.value),
)

const selectionStatusLabel = computed(() => {
  if (focusedPlan.value && billingCycle.value !== defaultBillingCycle) {
    return t("pages.goProPage.selectionStatusPlanBilling", {
      plan: focusedPlan.value.name,
      billing: activeBillingLabel.value,
    })
  }

  if (focusedPlan.value) {
    return t("pages.goProPage.selectionStatusPlan", {
      plan: focusedPlan.value.name,
    })
  }

  if (billingCycle.value !== defaultBillingCycle) {
    return t("pages.goProPage.selectionStatusBilling", {
      billing: activeBillingLabel.value,
    })
  }

  return t("pages.goProPage.selectionStatusDefault")
})

const subscriptionState = computed(() => {
  const latest = checkouts.value[0]
  if (!latest) return currentSubscription.value

  const plan = plans.value.find(item => item.id === latest.planId)
  return {
    plan: plan?.name ?? t("pages.goProPage.subscriptionFallbackPlan"),
    status: t("pages.goProPage.subscriptionActive"),
    renewsAt: latest.billingCycle === "monthly"
      ? t("pages.goProPage.renewsMonthly")
      : t("pages.goProPage.renewsYearly"),
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
    value: t("pages.goProPage.statSavingsValue", {
      percent: featuredPlanSavingsPercent.value,
    }),
    description: t("pages.goProPage.statSavingsDescription"),
  },
  {
    label: t("pages.goProPage.statPayments"),
    value: checkouts.value.length,
    description: t("pages.goProPage.statPaymentsDescription"),
  },
])

const sidebarStats = computed(() => {
  const plan = focusedPlan.value ?? featuredPlan.value
  const price = plan ? getProPlanPrice(plan, billingCycle.value) : 0

  return [
    {
      label: t("pages.goProPage.sidebarBilling"),
      value: activeBillingLabel.value,
    },
    {
      label: t("pages.goProPage.sidebarPrice"),
      value: formatProCurrency(price, locale.value),
    },
    {
      label: t("pages.goProPage.sidebarPayments"),
      value: paymentHistory.value.length,
    },
  ]
})

watch(
  () => route.query.billing,
  (value) => {
    const nextBilling = normalizeBillingCycle(readGoProQueryValue(value))
    if (nextBilling !== billingCycle.value) {
      billingCycle.value = nextBilling
    }
  },
)

watch(
  () => route.query.plan,
  (value) => {
    const nextPlan = normalizeProPlanKey(readGoProQueryValue(value))
    if (nextPlan !== focusedPlanId.value) {
      focusedPlanId.value = nextPlan
    }
  },
)

watch(billingCycle, syncRoute)
watch(focusedPlanId, syncRoute)

onMounted(() => {
  syncRoute()
})

function selectPlan(plan: ProPlan) {
  focusedPlanId.value = plan.id
  checkoutPlanId.value = plan.id
}

function selectFeaturedPlan() {
  if (!featuredPlan.value) return
  selectPlan(featuredPlan.value)
}

function closeCheckout() {
  checkoutPlanId.value = null
}

function recordCheckout(payload: ProCheckoutPayload) {
  checkouts.value = [payload, ...checkouts.value]
  focusedPlanId.value = payload.planId
  closeCheckout()
}

function resetSelection() {
  billingCycle.value = defaultBillingCycle
  focusedPlanId.value = ""
  closeCheckout()
}

function syncRoute() {
  const currentRawBilling = readGoProQueryValue(route.query.billing)
  const currentRawPlan = readGoProQueryValue(route.query.plan)
  const nextBilling = billingCycle.value === defaultBillingCycle ? "" : billingCycle.value
  const nextPlan = focusedPlanId.value

  if (currentRawBilling === nextBilling && currentRawPlan === nextPlan) {
    return
  }

  const nextQuery: LocationQueryRaw = { ...route.query }

  if (nextBilling) {
    nextQuery.billing = nextBilling
  }
  else {
    delete nextQuery.billing
  }

  if (nextPlan) {
    nextQuery.plan = nextPlan
  }
  else {
    delete nextQuery.plan
  }

  void router.replace({ path: "/go-pro", query: nextQuery })
}
</script>


<style scoped>
/** Fixed CSS parsing error by providing explicit style block */
</style>

