<template>
  <section class="overflow-hidden rounded-[28px] border border-[#dbe3f2] bg-white shadow-[0_16px_36px_rgba(15,35,110,0.07)] sm:rounded-[32px]">
    <div class="relative overflow-hidden px-4 py-5 sm:px-7 sm:py-6">
      <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,255,0.14),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(8,145,178,0.16),transparent_32%)]" />

      <div class="relative flex flex-col gap-5 sm:gap-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-[780px] min-w-0">
            <p class="text-[12px] font-black uppercase tracking-[0.22em] text-[#0000ff]/60">
              {{ eyebrow }}
            </p>
            <h1 class="mt-2 text-[1.75rem] font-black tracking-[-0.05em] text-[#243b63] sm:text-[2.35rem]">
              {{ title }}
            </h1>
            <p class="mt-3 text-[13px] leading-6 text-slate-500 sm:text-[14px] sm:leading-7">
              {{ description }}
            </p>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row">
            <NuxtLink
              :to="primaryTo"
              class="inline-flex h-11 w-full items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-4 text-[13px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff] sm:w-auto"
            >
              <Icon name="i-ph-house-line-fill" class="mr-2 h-4 w-4" />
              {{ primaryLabel }}
            </NuxtLink>

            <NuxtLink
              :to="secondaryTo"
              class="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#0000ff] px-5 text-[13px] font-bold text-white shadow-[0_12px_24px_rgba(0,0,255,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0000e0] sm:w-auto"
            >
              <Icon name="i-ph-magnifying-glass-bold" class="mr-2 h-4 w-4" />
              {{ secondaryLabel }}
            </NuxtLink>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <article
            v-for="item in stats"
            :key="item.label"
            class="rounded-[24px] border border-[#edf2fb] bg-[#fbfcff] px-3.5 py-3.5 sm:px-4 sm:py-4"
          >
            <p class="text-[11px] font-black uppercase tracking-[0.16em] text-[#0000ff]/60">
              {{ item.label }}
            </p>
            <p class="mt-2 text-[1.35rem] font-black tracking-[-0.05em] text-[#243b63] sm:text-[1.55rem]">
              {{ item.value }}
            </p>
            <p class="mt-2 text-[13px] leading-6 text-slate-500">
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
