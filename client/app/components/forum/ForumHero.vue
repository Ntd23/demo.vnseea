<template>
  <section class="rounded-[30px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-lg)] sm:p-7">
    <div class="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
      <div class="max-w-[760px]">
        <p class="text-label-secondary text-[var(--color-primary-600)]">{{ t("pages.forumPage.heroEyebrow") }}</p>
        <h1 class="mt-2 text-display text-[2.15rem] leading-tight text-[var(--text-primary)] sm:text-[3rem]">
          {{ t("pages.forumPage.heroTitle") }}
        </h1>
        <p class="mt-3 text-[15px] font-semibold leading-7 text-[var(--text-secondary)]">
          {{ t("pages.forumPage.heroDescription") }}
        </p>
        <button
          class="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-full)] bg-[var(--color-primary-500)] px-6 text-[14px] font-extrabold text-white shadow-[var(--shadow-brand)]"
          type="button"
          @click="$emit('createThread')"
        >
          <Icon name="i-ph-plus-circle-fill" class="h-5 w-5" />
          {{ t("pages.forumPage.createThreadButton") }}
        </button>
      </div>

      <div class="grid gap-3 sm:grid-cols-3 xl:w-[520px]">
        <div v-for="item in stats" :key="item.label" class="rounded-[22px] bg-[var(--bg-surface-hover)] p-4">
          <p class="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">{{ item.label }}</p>
          <p class="mt-2 text-[1.55rem] font-black leading-none text-[var(--text-primary)]">{{ item.value }}</p>
          <p class="mt-1 text-[12px] font-semibold text-[var(--text-secondary)]">{{ item.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()

defineProps<{
  stats: ReadonlyArray<{ label: string; value: string | number; description: string }>
}>()

defineEmits<{ createThread: [] }>()
</script>
