<template>
  <section :class="theme.container">
    <div class="pointer-events-none absolute inset-x-[-10%] top-[26%] h-[220px] rounded-[50%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18),transparent_65%)]" />
    <div class="pointer-events-none absolute right-[-6%] top-[-14%] h-[260px] w-[260px] rounded-full bg-white/10 blur-2xl" />
    <div :class="theme.bottomGlow" />

    <div class="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
      <div class="max-w-[760px]">
        <p class="text-[12px] font-extrabold uppercase tracking-[0.32em] text-white/70">
          {{ badge }}
        </p>
        <h1 class="mt-3 text-display text-[2.2rem] leading-[0.92] text-white sm:text-[2.85rem]">
          {{ title }}
        </h1>
        <p class="mt-3 max-w-[580px] text-[15px] leading-7 text-white/88 sm:text-[17px]">
          {{ description }}
        </p>

        <div class="mt-6 flex flex-wrap gap-3">
          <NuxtLink
            to="/my-products"
            class="inline-flex h-12 items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 text-[14px] font-bold text-white transition hover:bg-white/15"
          >
            <Icon name="i-ph-arrow-left" class="mr-2 h-4 w-4" />
            Quay lại sản phẩm của tôi
          </NuxtLink>

          <button
            :class="theme.secondaryAction"
            type="button"
            @click="$emit('secondaryAction')"
          >
            {{ secondaryActionLabel }}
          </button>
        </div>
      </div>

      <div class="grid gap-3 sm:grid-cols-3 xl:w-[430px] xl:grid-cols-1">
        <div
          v-for="item in stats"
          :key="item.label"
          class="rounded-[22px] border border-white/15 bg-white/10 p-4 backdrop-blur-[6px]"
        >
          <p class="text-[11px] font-bold uppercase tracking-[0.22em] text-white/60">
            {{ item.label }}
          </p>
          <p class="mt-2 text-[1.7rem] font-black leading-none text-white">
            {{ item.value }}
          </p>
          <p class="mt-1 text-[13px] text-white/72">
            {{ item.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ProductHeroStat } from "~/types/product-editor"

const props = defineProps<{
  variant: "create" | "edit"
  badge: string
  title: string
  description: string
  stats: ProductHeroStat[]
  secondaryActionLabel: string
}>()

defineEmits<{
  (e: "secondaryAction"): void
}>()

const theme = computed(() => {
  if (props.variant === "edit") {
    return {
      container: "relative overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#243b63_0%,#1d4ed8_42%,#38bdf8_110%)] px-5 pb-10 pt-6 text-white shadow-[0_16px_40px_rgba(29,78,216,0.22)] sm:px-7 sm:pt-8 lg:px-8",
      bottomGlow: "pointer-events-none absolute bottom-[-22%] left-[-8%] h-[220px] w-[220px] rounded-full bg-[#0f172a]/30 blur-3xl",
      secondaryAction: "inline-flex h-12 items-center justify-center rounded-full bg-[#dbeafe] px-5 text-[14px] font-extrabold text-[#1d4ed8] shadow-[0_10px_26px_rgba(219,234,254,0.24)] transition hover:-translate-y-0.5",
    }
  }

  return {
    container: "relative overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#9d2e43_0%,#d95d93_44%,#f59e0b_120%)] px-5 pb-10 pt-6 text-white shadow-[0_16px_40px_rgba(157,46,67,0.22)] sm:px-7 sm:pt-8 lg:px-8",
    bottomGlow: "pointer-events-none absolute bottom-[-22%] left-[-8%] h-[220px] w-[220px] rounded-full bg-[#243b63]/30 blur-3xl",
    secondaryAction: "inline-flex h-12 items-center justify-center rounded-full bg-[#fde7b2] px-5 text-[14px] font-extrabold text-[#9d2e43] shadow-[0_10px_26px_rgba(253,231,178,0.24)] transition hover:-translate-y-0.5",
  }
})
</script>
