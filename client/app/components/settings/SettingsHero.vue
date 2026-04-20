<template>
  <section class="rounded-[30px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-lg)] sm:p-7">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p class="text-label-secondary text-[var(--color-primary-600)]">{{ $t("pages.settingsPage.heroEyebrow") }}</p>
        <h1 class="mt-2 text-display text-[2.1rem] leading-tight text-[var(--text-primary)] sm:text-[3rem]">{{ $t("pages.settingsPage.heroTitle") }}</h1>
        <p class="mt-3 max-w-2xl text-[15px] font-semibold leading-7 text-[var(--text-secondary)]">
          {{ $t("pages.settingsPage.heroDescription") }}
        </p>
      </div>
      <div class="grid gap-2 sm:grid-cols-3 lg:w-[460px]">
        <div v-for="item in stats" :key="item.label" class="rounded-[22px] bg-[var(--bg-surface-hover)] p-4">
          <p class="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">{{ item.label }}</p>
          <p class="mt-2 text-[1.5rem] font-black leading-none text-[var(--text-primary)]">{{ item.value }}</p>
          <p class="mt-1 text-[12px] font-semibold text-[var(--text-secondary)]">{{ item.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  stats: ReadonlyArray<{ label: string; value: string | number; description: string }>
}>()
</script>
