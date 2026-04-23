<template>
  <section class="surface-card p-8 sm:p-10 relative overflow-hidden ring-1 ring-secondary-100 shadow-xl">
    <!-- Visual Decor -->
    <div class="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
    <div class="absolute bottom-0 left-0 w-48 h-48 bg-primary-600/5 rounded-full blur-3xl -ml-24 -mb-24" />

    <div class="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
      <div class="space-y-4">
        <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1">
          {{ $t("pages.settingsPage.heroEyebrow") }}
        </p>
        <h1 class="text-5xl font-black leading-[0.9] tracking-tighter text-secondary-900 sm:text-6xl max-w-2xl">
          {{ $t("pages.settingsPage.heroTitle") }}
        </h1>
        <p class="max-w-xl text-base font-medium leading-relaxed text-secondary-500 sm:text-lg">
          {{ $t("pages.settingsPage.heroDescription") }}
        </p>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:w-[520px]">
        <div v-for="item in stats" :key="item.label" class="surface-card p-5 group transition-all duration-300 hover:ring-primary-200 ring-1 ring-secondary-100/50 bg-secondary-50/10">
          <p class="text-[9px] font-black uppercase tracking-widest text-secondary-400 group-hover:text-primary-500 transition-colors">{{ item.label }}</p>
          <div class="mt-3 flex items-baseline gap-1">
            <p class="text-3xl font-black text-secondary-900 leading-none tracking-tighter">{{ item.value }}</p>
          </div>
          <p class="mt-2 text-[10px] font-bold text-secondary-500 uppercase tracking-widest leading-tight">{{ item.description }}</p>
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
