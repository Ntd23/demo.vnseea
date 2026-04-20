<template>
  <section class="overflow-hidden rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]">
    <div class="border-b border-[var(--border-default)] p-5">
      <p class="text-label-secondary text-[var(--text-tertiary)]">{{ t("pages.goProPage.comparisonEyebrow") }}</p>
      <h2 class="mt-1 text-heading text-[var(--text-primary)]">{{ t("pages.goProPage.comparisonTitle") }}</h2>
      <p class="mt-1 text-body-secondary">{{ t("pages.goProPage.comparisonDescription") }}</p>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full min-w-[720px] text-left">
        <thead class="bg-[var(--bg-surface-hover)]">
          <tr>
            <th class="px-5 py-4 text-[12px] font-black uppercase tracking-[0.14em] text-[var(--text-tertiary)]">{{ t("pages.goProPage.featureColumn") }}</th>
            <th v-for="plan in plans" :key="plan.id" class="px-5 py-4 text-[12px] font-black uppercase tracking-[0.14em] text-[var(--text-tertiary)]">{{ plan.name }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.label" class="border-t border-[var(--border-default)]">
            <td class="px-5 py-4 text-[14px] font-extrabold text-[var(--text-primary)]">{{ row.label }}</td>
            <td v-for="plan in plans" :key="plan.id" class="px-5 py-4">
              <Icon
                :name="row[plan.id] ? 'i-ph-check-circle-fill' : 'i-ph-x-circle-fill'"
                class="h-5 w-5"
                :class="row[plan.id] ? 'text-[var(--color-success)]' : 'text-[var(--text-tertiary)]'"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ProPlan } from "~/composables/useMockGoProData"

defineProps<{
  plans: ReadonlyArray<ProPlan>
  rows: ReadonlyArray<{ label: string; starter: boolean; creator: boolean; business: boolean }>
}>()

const { t } = useI18n()
</script>
