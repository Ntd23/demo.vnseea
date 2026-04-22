<template>
  <section class="rounded-[30px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-md)]">
    <p class="text-label-secondary text-[var(--text-tertiary)]">{{ t("pages.withdrawalPage.paymentInfoEyebrow") }}</p>
    <h2 class="mt-1 text-heading text-[var(--text-primary)]">{{ t("pages.withdrawalPage.paymentInfoTitle") }}</h2>

    <div class="mt-5 space-y-3">
      <div
        v-for="profile in profiles"
        :key="profile.label"
        class="rounded-[22px] bg-[var(--bg-surface-hover)] p-4"
      >
        <p class="text-[12px] font-bold text-[var(--text-tertiary)]">{{ profile.label }}</p>
        <p class="mt-1 text-[14px] font-extrabold text-[var(--text-primary)]">{{ profile.value }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()

defineProps<{
  profiles: ReadonlyArray<{ label: string; value: string }>
}>()
</script>
