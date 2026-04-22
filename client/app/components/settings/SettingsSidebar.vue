<template>
  <aside class="surface-card p-5 xl:w-[330px] xl:max-w-[330px] xl:shrink-0 flex flex-col">
    <div class="px-2 py-1">
      <p class="text-label-primary text-secondary-500 uppercase tracking-widest text-[10px]">{{ t("pages.settingsPage.sidebarCount", { count: pages.length }) }}</p>
      <h2 class="mt-1 text-heading text-secondary-900">{{ t("pages.settingsPage.sidebarTitle") }}</h2>
    </div>

    <nav class="mt-6 flex flex-col gap-2 overflow-y-auto">
      <NuxtLink
        v-for="page in pages"
        :key="page.slug"
        :to="page.slug === defaultSlug ? '/setting' : `/setting/${page.slug}`"
        class="group flex w-full min-w-0 items-center gap-4 rounded-2xl px-4 py-3.5 transition-all duration-300 border border-transparent"
        :class="page.slug === activeSlug 
          ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' 
          : 'text-secondary-600 hover:bg-secondary-50 hover:text-primary-600 hover:border-secondary-100'"
      >
        <div 
          :class="page.slug === activeSlug ? 'bg-white/20' : 'bg-secondary-100 group-hover:bg-primary-100'"
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors"
        >
          <Icon :name="page.icon" class="h-6 w-6" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-black tracking-tight">{{ page.label }}</p>
          <p class="truncate text-xs font-semibold opacity-70 mt-0.5">{{ page.description }}</p>
        </div>
      </NuxtLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import type { SettingPage } from "~/composables/useMockSettingsData"

const { t } = useI18n()

defineProps<{
  pages: ReadonlyArray<SettingPage>
  activeSlug: string
  defaultSlug: string
}>()
</script>
