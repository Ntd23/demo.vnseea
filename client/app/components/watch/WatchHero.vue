<template>
  <section class="surface-card p-6 sm:p-8">
    <div class="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
      <div class="max-w-[800px] space-y-4">
        <p class="text-label-primary text-[var(--text-primary)] uppercase tracking-widest">{{ $t("pages.watchPage.heroEyebrow") }}</p>
        <h1 class="text-display text-4xl sm:text-6xl text-[var(--text-primary)] leading-[1.1]">
          {{ $t("pages.watchPage.heroTitle") }}
        </h1>
        <p class="text-body-secondary text-lg leading-relaxed max-w-2xl">
          {{ $t("pages.watchPage.heroDescription") }}
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-3 xl:w-[540px]">
        <div v-for="item in stats" :key="item.label" class="rounded-2xl bg-secondary-50/50 p-5 border border-secondary-100/30">
          <p class="text-micro font-bold uppercase tracking-wider text-[var(--text-primary)]">{{ item.label }}</p>
          <p class="mt-2 text-3xl font-black text-[var(--text-primary)] leading-none">{{ item.value }}</p>
          <p class="mt-1 text-xs font-semibold text-[var(--text-primary)]">{{ item.description }}</p>
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
