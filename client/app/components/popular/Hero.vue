<template>
  <section class="overflow-hidden rounded-[28px] border border-[#dbe3f2] bg-white shadow-[0_16px_36px_rgba(15,35,110,0.07)] sm:rounded-[32px]">
    <div class="relative overflow-hidden px-8 py-10 sm:px-12 sm:py-12">
      <!-- Premium Decorations -->
      <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(5,150,105,0.08),transparent_35%)]" />
      <div class="absolute top-0 right-0 w-80 h-80 bg-primary-500/10 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none transition-transform duration-1000 group-hover:scale-110" />

      <div class="relative flex flex-col gap-10">
        <div class="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-3xl space-y-3">
            <p class="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-primary)] pl-1">
              {{ eyebrow }}
            </p>
            <h1 class="text-4xl sm:text-5xl font-black tracking-tight text-[var(--text-primary)] leading-[1.1]">
              {{ title }}
            </h1>
            <p class="text-[15px] font-medium leading-relaxed text-secondary-500 max-w-2xl pl-0.5">
              {{ description }}
            </p>
          </div>

          <div class="flex flex-col gap-4 sm:flex-row">
            <NuxtLink
              :to="primaryTo"
              class="h-12 inline-flex items-center justify-center rounded-2xl border border-secondary-100 bg-white/60 px-6 text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)] backdrop-blur-xl transition-all hover:bg-white hover:text-primary-600 hover:border-primary-100 hover:shadow-lg active:scale-95"
            >
              <Icon name="i-ph-house-line-duotone" class="mr-2.5 h-4.5 w-4.5" />
              {{ primaryLabel }}
            </NuxtLink>

            <NuxtLink
              :to="secondaryTo"
              class="h-12 inline-flex items-center justify-center rounded-2xl bg-primary-600 px-8 text-[11px] font-black uppercase tracking-widest text-white shadow-2xl shadow-primary-500/30 transition-all hover:-translate-y-0.5 hover:bg-primary-700 active:scale-95"
            >
              <Icon name="i-ph-magnifying-glass-duotone" class="mr-2.5 h-4.5 w-4.5" />
              {{ secondaryLabel }}
            </NuxtLink>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <article
            v-for="item in stats"
            :key="item.label"
            class="surface-card p-5 bg-secondary-50/50 group/stat hover:bg-white ring-1 ring-secondary-100 transition-all duration-500"
          >
            <p class="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--text-primary)] pl-1">
              {{ item.label }}
            </p>
            <p class="mt-4 text-3xl font-black tracking-tight text-[var(--text-primary)] group-hover/stat:text-[var(--text-primary)] transition-colors">
              {{ item.value }}
            </p>
            <p class="mt-3 text-[12px] font-medium leading-relaxed text-secondary-400 italic px-1">
              {{ item.description }}
            </p>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  description: string
  primaryLabel: string
  primaryTo: string
  secondaryLabel: string
  secondaryTo: string
  stats: ReadonlyArray<{ label: string; value: string | number; description: string }>
}>()
</script>
