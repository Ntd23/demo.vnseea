<template>
  <section class="overflow-hidden rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-lg)]">
    <div class="grid gap-0 xl:grid-cols-[minmax(0,1fr)_520px]">
      <div class="p-5 sm:p-7 lg:p-8">
        <p class="text-label-secondary text-[var(--color-primary-600)]">{{ t("pages.goProPage.heroEyebrow") }}</p>
        <h1 class="mt-2 text-display text-[2.15rem] leading-tight text-[var(--text-primary)] sm:text-[3rem]">
          {{ t("pages.goProPage.heroTitle") }}
        </h1>
        <p class="mt-3 max-w-2xl text-[15px] font-semibold leading-7 text-[var(--text-secondary)]">
          {{ t("pages.goProPage.heroDescription") }}
        </p>

        <div class="mt-6 grid gap-3 sm:grid-cols-3">
          <div v-for="item in stats" :key="item.label" class="rounded-[22px] bg-[var(--bg-surface-hover)] p-4">
            <p class="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">{{ item.label }}</p>
            <p class="mt-2 text-[1.45rem] font-black leading-none text-[var(--text-primary)]">{{ item.value }}</p>
            <p class="mt-1 text-[12px] font-semibold text-[var(--text-secondary)]">{{ item.description }}</p>
          </div>
        </div>
      </div>

      <div class="border-t border-[var(--border-default)] bg-[var(--bg-surface-hover)] p-5 xl:border-l xl:border-t-0">
        <div class="rounded-[28px] bg-white p-5 shadow-[var(--shadow-sm)]">
          <p class="text-label-secondary text-[var(--text-tertiary)]">{{ t("pages.goProPage.currentPlanLabel") }}</p>
          <div class="mt-3 flex items-center justify-between gap-4">
            <div>
              <h2 class="text-2xl font-black text-[var(--text-primary)]">{{ subscription.plan }}</h2>
              <p class="mt-1 text-[13px] font-semibold text-[var(--text-secondary)]">{{ subscription.status }}</p>
            </div>
            <div class="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[var(--color-primary-50)] text-[var(--color-primary-600)]">
              <Icon name="i-ph-crown-simple-fill" class="h-7 w-7" />
            </div>
          </div>

          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <div class="rounded-[18px] bg-[var(--bg-surface-hover)] p-3">
              <p class="text-[11px] font-bold uppercase text-[var(--text-tertiary)]">{{ t("pages.goProPage.renewsAtLabel") }}</p>
              <p class="mt-1 text-[14px] font-black text-[var(--text-primary)]">{{ subscription.renewsAt }}</p>
            </div>
            <div class="rounded-[18px] bg-[var(--bg-surface-hover)] p-3">
              <p class="text-[11px] font-bold uppercase text-[var(--text-tertiary)]">{{ t("pages.goProPage.paymentsLabel") }}</p>
              <p class="mt-1 text-[14px] font-black text-[var(--text-primary)]">{{ t("pages.goProPage.transactionCount", { count: payments.length }) }}</p>
            </div>
          </div>
        </div>

        <div class="mt-4 rounded-[28px] bg-white p-5 shadow-[var(--shadow-sm)]">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-label-secondary text-[var(--text-tertiary)]">{{ t("pages.goProPage.recentLabel") }}</p>
              <h3 class="mt-1 text-[18px] font-black text-[var(--text-primary)]">{{ t("pages.goProPage.mockHistoryTitle") }}</h3>
            </div>
            <Icon name="i-ph-receipt-fill" class="h-6 w-6 text-[var(--color-primary-600)]" />
          </div>

          <div v-if="payments.length > 0" class="mt-4 space-y-2">
            <div v-for="item in payments.slice(0, 2)" :key="item.id" class="rounded-[18px] bg-[var(--bg-surface-hover)] p-3">
              <div class="flex items-center justify-between gap-3">
                <p class="text-[13px] font-extrabold text-[var(--text-primary)]">{{ item.plan }}</p>
                <p class="text-[12px] font-black text-[var(--color-primary-600)]">{{ item.amount }}</p>
              </div>
              <p class="mt-1 text-[12px] font-semibold text-[var(--text-secondary)]">{{ item.method }} · {{ item.time }}</p>
            </div>
          </div>
          <p v-else class="mt-4 rounded-[18px] bg-[var(--bg-surface-hover)] p-3 text-[13px] font-semibold text-[var(--text-secondary)]">
            {{ t("pages.goProPage.emptyPayments") }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  stats: ReadonlyArray<{ label: string; value: string | number; description: string }>
  subscription: { plan: string; status: string; renewsAt: string }
  payments: ReadonlyArray<{ id: number; plan: string; amount: string; method: string; time: string }>
}>()

const { t } = useI18n()
</script>
