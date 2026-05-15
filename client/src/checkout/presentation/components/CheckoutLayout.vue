<template>
  <div class="bg-slate-50 min-h-screen pb-12">
    <!-- Header Section -->
    <header class="bg-white border-b border-slate-200 px-4 py-6 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p class="text-[13px] font-semibold text-[var(--color-primary-600)] uppercase tracking-wider">
            {{ eyebrow || $t("checkout.page.eyebrow") }}
          </p>
          <h1 :id="headerId" class="mt-1 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {{ title }}
          </h1>
          <p v-if="description" class="mt-2 text-[15px] text-slate-500 max-w-2xl">
            {{ description }}
          </p>
        </div>

        <div v-if="hasProgress" class="w-full md:w-72">
          <div class="flex justify-between items-center text-[13px] font-medium text-slate-700 mb-2">
            <span>{{ progressLabel }}</span>
            <span class="text-[var(--color-primary-600)] font-bold">{{ Math.round(progressValue) }}%</span>
          </div>
          <UProgress :model-value="progressValue" color="primary" class="h-2" />
          <p v-if="progressText" class="mt-1.5 text-[12px] text-slate-500">
            {{ progressText }}
          </p>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Left Column: Form -->
        <section class="lg:col-span-7 xl:col-span-8" :aria-label="leftLabel || title">
          <slot name="left" />
        </section>

        <!-- Right Column: Summary -->
        <aside class="lg:col-span-5 xl:col-span-4" :aria-label="rightLabel || $t('checkout.page.summaryRegion')">
          <div class="sticky top-8">
            <slot name="right" />
          </div>
        </aside>
      </div>
    </main>
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
