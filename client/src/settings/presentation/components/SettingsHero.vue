<template>
  <section class="relative overflow-hidden rounded-[2.5rem] bg-secondary-900 p-8 text-white shadow-2xl sm:p-12">
    <!-- Decor -->
    <div class="absolute right-0 top-0 h-64 w-64 -translate-y-16 translate-x-16 rounded-full bg-primary-500/10 blur-[100px]" />
    <div class="absolute bottom-0 left-0 h-64 w-64 translate-y-16 -translate-x-16 rounded-full bg-sky-500/10 blur-[100px]" />

    <div class="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
      <div class="space-y-6">
        <div class="space-y-2">
          <p class="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
            {{ $t("pages.settingsPage.heroEyebrow") }}
          </p>
          <h1 class="text-5xl font-black tracking-tight sm:text-6xl md:text-7xl">
            {{ $t("pages.settingsPage.heroTitle") }}
          </h1>
        </div>

        <div class="flex flex-wrap gap-8">
          <div v-for="stat in stats" :key="stat.label" class="space-y-1">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
              {{ stat.label }}
            </p>
            <p class="text-xl font-black text-primary-400">
              {{ stat.value }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  stats: Array<{ label: string; value: string | number }>
}>()
</script>
