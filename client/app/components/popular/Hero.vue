<template>
  <section class="overflow-hidden rounded-[24px] border border-[#dbe3f2] bg-white shadow-[0_10px_28px_rgba(15,35,110,0.05)]">
    <div class="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
      <div class="max-w-3xl space-y-4">
        <p class="inline-flex h-8 items-center rounded-full bg-primary-50 px-3 text-[12px] font-extrabold text-primary-700 ring-1 ring-primary-100">
          {{ eyebrow }}
        </p>
        <div class="space-y-3">
          <h1 class="text-[30px] font-black leading-tight text-[var(--text-primary)] sm:text-[38px]">
            {{ title }}
          </h1>
          <p class="max-w-2xl text-[14px] font-medium leading-7 text-slate-600 sm:text-[15px]">
            {{ description }}
          </p>
        </div>

        <div class="flex flex-col gap-2 pt-1 sm:flex-row">
          <NuxtLink
            :to="primaryTo"
            class="inline-flex h-11 items-center justify-center rounded-[14px] border border-secondary-200 bg-white px-4 text-[13px] font-extrabold text-[var(--text-primary)] transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 active:scale-95"
          >
            <Icon name="i-ph-house-line-duotone" class="mr-2 h-4.5 w-4.5 shrink-0" />
            {{ primaryLabel }}
          </NuxtLink>

          <NuxtLink
            :to="secondaryTo"
            class="inline-flex h-11 items-center justify-center rounded-[14px] bg-primary-600 px-5 text-[13px] font-extrabold text-white shadow-[0_12px_24px_rgba(37,99,235,0.18)] transition hover:bg-primary-700 active:scale-95"
          >
            <Icon name="i-ph-magnifying-glass-duotone" class="mr-2 h-4.5 w-4.5 shrink-0" />
            {{ secondaryLabel }}
          </NuxtLink>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-x-5 gap-y-5 border-t border-secondary-100 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
        <article
          v-for="item in stats"
          :key="item.label"
          class="min-w-0"
        >
          <p class="text-[11px] font-extrabold uppercase text-slate-500">
            {{ item.label }}
          </p>
          <p class="mt-2 text-[28px] font-black leading-none text-[var(--text-primary)]">
            {{ item.value }}
          </p>
          <p class="mt-2 text-[12px] font-medium leading-5 text-slate-500">
            {{ item.description }}
          </p>
        </article>
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
