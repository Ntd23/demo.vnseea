<template>
  <section class="surface-card p-6 sm:p-8">
    <div class="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
      <div class="space-y-3">
        <p class="text-label-primary text-primary-600 uppercase tracking-widest">{{ $t("pages.settingsPage.heroEyebrow") }}</p>
        <h1 class="text-display text-4xl sm:text-5xl text-secondary-900 leading-tight">{{ $t("pages.settingsPage.heroTitle") }}</h1>
        <p class="max-w-2xl text-body-secondary text-lg leading-relaxed">
          {{ $t("pages.settingsPage.heroDescription") }}
        </p>
      </div>
      <div class="grid gap-4 sm:grid-cols-3 lg:w-[480px]">
        <div v-for="item in stats" :key="item.label" class="rounded-2xl bg-secondary-50/50 p-5 border border-secondary-100/30">
          <p class="text-micro font-bold uppercase tracking-wider text-secondary-400">{{ item.label }}</p>
          <p class="mt-2 text-2xl font-black text-secondary-900 leading-none">{{ item.value }}</p>
          <p class="mt-1 text-xs font-semibold text-secondary-500">{{ item.description }}</p>
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
