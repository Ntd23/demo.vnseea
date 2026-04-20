<template>
  <aside class="space-y-4">
    <section class="rounded-[30px] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)]">
      <p class="text-label-secondary text-[var(--text-tertiary)]">{{ t("pages.goProPage.currentPlanLabel") }}</p>
      <h2 class="mt-1 text-heading text-[var(--text-primary)]">{{ subscription.plan }}</h2>
      <div class="mt-4 space-y-3">
        <div class="rounded-[20px] bg-[var(--bg-surface-hover)] p-3">
          <p class="text-[12px] font-bold text-[var(--text-tertiary)]">{{ t("pages.goProPage.statusLabel") }}</p>
          <p class="mt-1 text-[14px] font-black text-[var(--text-primary)]">{{ subscription.status }}</p>
        </div>
        <div class="rounded-[20px] bg-[var(--bg-surface-hover)] p-3">
          <p class="text-[12px] font-bold text-[var(--text-tertiary)]">{{ t("pages.goProPage.renewsAtLabel") }}</p>
          <p class="mt-1 text-[14px] font-black text-[var(--text-primary)]">{{ subscription.renewsAt }}</p>
        </div>
      </div>
    </section>

    <section class="rounded-[30px] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)]">
      <p class="text-label-secondary text-[var(--text-tertiary)]">{{ t("pages.goProPage.recentPaymentsLabel") }}</p>
      <h2 class="mt-1 text-heading text-[var(--text-primary)]">{{ t("pages.goProPage.mockHistoryTitle") }}</h2>
      <div class="mt-4 space-y-2">
        <div v-for="item in payments" :key="item.id" class="rounded-[20px] bg-[var(--bg-surface-hover)] p-3">
          <div class="flex items-center justify-between gap-3">
            <p class="text-[13px] font-extrabold text-[var(--text-primary)]">{{ item.plan }}</p>
            <p class="text-[12px] font-black text-[var(--color-primary-600)]">{{ item.amount }}</p>
          </div>
          <p class="mt-1 text-[12px] font-semibold text-[var(--text-secondary)]">{{ item.method }} · {{ item.time }}</p>
        </div>
      </div>
    </section>
  </aside>
</template>

<script setup lang="ts">
defineProps<{
  subscription: { plan: string; status: string; renewsAt: string }
  payments: ReadonlyArray<{ id: number; plan: string; amount: string; method: string; time: string }>
}>()

const { t } = useI18n()
</script>
