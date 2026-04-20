<template>
  <aside class="w-full overflow-hidden rounded-[30px] border border-[var(--border-default)] bg-white p-3 shadow-[var(--shadow-md)] xl:w-[330px] xl:max-w-[330px] xl:shrink-0">
    <div class="p-2">
      <p class="text-label-secondary text-[var(--text-tertiary)]">{{ $t("settings.sidebar.subPages", { count: pages.length }) }}</p>
      <h2 class="mt-1 text-heading text-[var(--text-primary)]">{{ $t("settings.sidebar.title") }}</h2>
    </div>

    <nav class="mt-3 grid max-h-[720px] gap-1 overflow-y-auto pr-1">
      <NuxtLink
        v-for="page in pages"
        :key="page.slug"
        :to="page.slug === defaultSlug ? '/setting' : `/setting/${page.slug}`"
        class="flex w-full min-w-0 items-center gap-3 overflow-hidden rounded-[20px] px-3 py-3 transition"
        :class="page.slug === activeSlug ? 'bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-brand)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--color-primary-600)]'"
      >
        <Icon :name="page.icon" class="h-5 w-5 shrink-0" />
        <div class="min-w-0 flex-1">
          <p class="truncate text-[13px] font-extrabold">{{ page.label }}</p>
          <p class="truncate text-[11px] font-semibold opacity-70">{{ page.description }}</p>
        </div>
      </NuxtLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import type { SettingPage } from "~/composables/useMockSettingsData"

defineProps<{
  pages: ReadonlyArray<SettingPage>
  activeSlug: string
  defaultSlug: string
}>()
</script>
