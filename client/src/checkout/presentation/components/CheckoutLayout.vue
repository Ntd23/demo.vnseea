<template>
  <div class="space-y-6">
    <section
      class="relative overflow-hidden rounded-[30px] border border-[#dbe3f2] bg-[linear-gradient(180deg,#ffffff_0%,#f7f9ff_100%)] p-5 shadow-[0_16px_38px_rgba(15,35,110,0.07)] sm:p-6"
      :aria-labelledby="headerId"
    >
      <div class="pointer-events-none absolute right-[-32px] top-[-44px] h-[180px] w-[180px] rounded-full border-[18px] border-[#d7e7ff]/55" />
      <div class="pointer-events-none absolute bottom-[-90px] right-[88px] h-[220px] w-[220px] rounded-full bg-[#e9f4ff]/80" />

      <div class="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div class="px-1 pt-1">
          <p class="text-[12px] font-extrabold uppercase tracking-[0.28em] text-[#0000ff]/65">
            {{ eyebrow || $t("checkout.page.eyebrow") }}
          </p>
          <h1 :id="headerId" class="mt-2 text-display text-[2rem] text-[#2f3542] sm:text-[2.3rem]">
            {{ title }}
          </h1>
          <div class="mt-4 h-[5px] w-20 rounded-full bg-[#2f3542]" />
          <p
            v-if="description"
            class="mt-4 max-w-[720px] text-[14px] leading-7 text-slate-500 sm:text-[15px]"
          >
            {{ description }}
          </p>
        </div>

        <div
          v-if="hasProgress"
          class="w-full max-w-[360px] rounded-[24px] border border-[#dbe3f2] bg-white/90 p-4 shadow-[0_12px_30px_rgba(15,35,110,0.06)] backdrop-blur"
        >
          <div class="flex items-center justify-between gap-3">
            <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
              {{ progressLabel }}
            </p>
            <span class="text-[14px] font-black text-[#243b63]">
              {{ Math.round(progressValue) }}%
            </span>
          </div>

          <p v-if="progressText" class="mt-2 text-[14px] font-semibold leading-6 text-[#243b63]">
            {{ progressText }}
          </p>

          <UProgress
            :model-value="progressValue"
            color="primary"
            class="mt-3"
          />
        </div>
      </div>
    </section>

    <div class="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_380px] xl:grid-cols-[minmax(0,1.08fr)_420px] 2xl:grid-cols-[minmax(0,1.1fr)_450px]">
      <section class="order-2 min-w-0 lg:order-1" :aria-label="leftLabel || title">
        <slot name="left" />
      </section>

      <aside
        class="order-1 min-w-0 self-start lg:sticky lg:top-[84px] lg:order-2"
        :aria-label="rightLabel || $t('checkout.page.summaryRegion')"
      >
        <slot name="right" />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
const headerId = "checkout-layout-title"

const props = withDefaults(defineProps<{
  title: string
  eyebrow?: string
  description?: string
  progressLabel?: string
  progressText?: string
  progressValue?: number
  leftLabel?: string
  rightLabel?: string
}>(), {
  eyebrow: "",
  description: "",
  progressLabel: "",
  progressText: "",
  progressValue: 0,
  leftLabel: "",
  rightLabel: "",
})

const hasProgress = computed(() => props.progressLabel.length > 0)
</script>


<style scoped>
/** Fixed CSS parsing error by providing explicit style block */
</style>

