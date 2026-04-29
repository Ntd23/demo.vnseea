<template>
  <aside class="surface-card p-6 xl:w-[360px] xl:max-w-[360px] xl:shrink-0 flex flex-col ring-1 ring-secondary-100 shadow-xl min-h-[600px]">
    <div class="px-2 space-y-4 mb-8">
      <p class="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400">
        {{ t("pages.settingsPage.sidebarEyebrow") || 'Account Center' }}
      </p>
      <div class="space-y-1">
        <h2 class="text-3xl font-extrabold leading-none tracking-tight text-[var(--text-primary)]">
          {{ t("pages.settingsPage.sidebarTitle") }}
        </h2>
        <p class="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400">
          {{ t("pages.settingsPage.sidebarCount", { count: pages.length }) }}
        </p>
      </div>
    </div>

    <nav class="flex-1 space-y-2 overflow-y-auto no-scrollbar">
      <NuxtLink
        v-for="page in pages"
        :key="page.slug"
        :to="page.slug === defaultSlug ? appRoutes.settings : appRoutes.settingsPage(page.slug)"
        class="group flex w-full min-w-0 items-center gap-4 rounded-2xl px-4 py-4 transition-all duration-300 border border-transparent"
        :class="page.slug === activeSlug 
          ? 'bg-primary-50 text-primary-600 ring-1 ring-primary-100 shadow-sm shadow-primary-500/5' 
          : 'text-[var(--text-primary)] hover:bg-secondary-50 hover:text-primary-600'"
      >
        <div 
          :class="page.slug === activeSlug ? 'bg-white border-primary-200 text-[var(--icon-primary)] shadow-md ring-1 ring-primary-100' : 'bg-white border-secondary-100 text-[var(--icon-primary)] group-hover:border-primary-200 group-hover:text-primary-600'"
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] transition-all duration-300 border shadow-sm"
        >
          <Icon :name="page.slug === activeSlug ? page.icon : page.icon.replace('-fill', '-duotone')" class="h-6 w-6" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-[13px] font-semibold leading-none">{{ page.label }}</p>
          <p class="mt-1.5 truncate text-[11px] font-medium text-slate-400 transition-colors group-hover:text-primary-400">{{ page.description }}</p>
        </div>
      </NuxtLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import type { SettingPage } from "../../application/composables/useMockSettingsData"

const { t } = useI18n()

defineProps<{
  pages: ReadonlyArray<SettingPage>
  activeSlug: string
  defaultSlug: string
}>()
</script>
