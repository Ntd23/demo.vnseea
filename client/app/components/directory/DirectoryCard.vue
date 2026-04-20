<template>
  <NuxtLink
    :to="item.href"
    class="group overflow-hidden rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
  >
    <div class="relative min-h-[190px] p-5 text-white" :style="{ background: item.accent }">
      <div class="absolute inset-0 bg-black/10" />
      <div class="relative z-10 flex h-full flex-col justify-between gap-8">
        <div class="flex items-start justify-between gap-3">
          <span class="rounded-[var(--radius-full)] bg-white/18 px-3 py-1.5 text-[12px] font-extrabold backdrop-blur">{{ item.categoryLabel }}</span>
          <Icon name="i-ph-arrow-up-right-bold" class="h-5 w-5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
        <div>
          <h3 class="text-2xl font-black leading-tight">{{ item.title }}</h3>
          <p class="mt-2 line-clamp-2 text-[13px] font-semibold leading-5 text-white/80">{{ item.description }}</p>
        </div>
      </div>
    </div>

    <div class="p-4">
      <div class="grid grid-cols-2 gap-2">
        <div class="rounded-[18px] bg-[var(--bg-surface-hover)] p-3">
          <p class="text-[11px] font-bold uppercase text-[var(--text-tertiary)]">{{ t("pages.directoryPage.metaLabel") }}</p>
          <p class="mt-1 text-[14px] font-black text-[var(--text-primary)]">{{ item.meta }}</p>
        </div>
        <div class="rounded-[18px] bg-[var(--bg-surface-hover)] p-3">
          <p class="text-[11px] font-bold uppercase text-[var(--text-tertiary)]">{{ t("pages.directoryPage.activityLabel") }}</p>
          <p class="mt-1 text-[14px] font-black text-[var(--text-primary)]">{{ item.count }}</p>
        </div>
      </div>
      <div class="mt-4 flex flex-wrap gap-2">
        <span v-for="tag in item.tags" :key="tag" class="rounded-[var(--radius-full)] bg-[var(--color-primary-50)] px-3 py-1.5 text-[12px] font-extrabold text-[var(--color-primary-600)]">{{ tag }}</span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { DirectoryItem } from "~/composables/useMockDirectoryData"

const { t } = useI18n()

defineProps<{ item: DirectoryItem }>()
</script>
