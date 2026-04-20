<template>
  <section class="overflow-hidden rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-lg)]">
    <div class="grid gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div class="p-5 sm:p-7 lg:p-8">
        <div class="inline-flex items-center gap-2 rounded-[var(--radius-full)] bg-[var(--color-primary-50)] px-4 py-2 text-[12px] font-extrabold uppercase tracking-[0.14em] text-[var(--color-primary-600)]">
          <span class="h-2 w-2 rounded-full bg-[var(--color-error)]" />
          {{ $t("pages.livePage.heroEyebrow") }}
        </div>
        <h1 class="mt-5 text-display text-[2.2rem] leading-[1.02] text-[var(--text-primary)] sm:text-[3rem]">
          {{ $t("pages.livePage.heroTitle") }}
        </h1>
        <p class="mt-4 max-w-[680px] text-[15px] font-semibold leading-7 text-[var(--text-secondary)]">
          {{ $t("pages.livePage.heroDescription") }}
        </p>
        <div class="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            class="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-full)] bg-[var(--color-primary-500)] px-6 text-[14px] font-extrabold text-white shadow-[var(--shadow-brand)] transition hover:-translate-y-0.5"
            type="button"
            @click="$emit('goLive')"
          >
            <Icon name="i-ph-video-camera-fill" class="h-5 w-5" />
            {{ $t("pages.livePage.goLive") }}
          </button>
          <button
            class="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-full)] border border-[var(--border-default)] bg-white px-6 text-[14px] font-extrabold text-[var(--color-primary-600)] transition hover:border-[var(--border-strong)] hover:bg-[var(--color-primary-50)]"
            type="button"
            @click="$emit('focusChat')"
          >
            <Icon name="i-ph-chat-circle-dots-fill" class="h-5 w-5" />
            {{ $t("pages.livePage.openChat") }}
          </button>
        </div>
      </div>

      <div class="border-t border-[var(--border-default)] bg-[var(--bg-surface-hover)] p-5 lg:border-l lg:border-t-0">
        <div class="grid gap-3">
          <div v-for="item in stats" :key="item.label" class="rounded-[22px] bg-white p-4 shadow-[var(--shadow-sm)]">
            <p class="text-label-secondary text-[var(--text-tertiary)]">{{ item.label }}</p>
            <p class="mt-2 text-[1.7rem] font-black leading-none text-[var(--text-primary)]">{{ item.value }}</p>
            <p class="mt-1 text-caption-secondary">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  stats: ReadonlyArray<{ label: string; value: string | number; description: string }>
}>()

defineEmits<{ goLive: []; focusChat: [] }>()
</script>
