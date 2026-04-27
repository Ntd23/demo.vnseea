<template>
  <div class="space-y-6 pb-20">
    <SettingsHero :stats="stats" />

    <div class="flex flex-col gap-6 lg:flex-row lg:items-start">
      <SettingsSidebar :pages="pages" :active-slug="activeSlug" />

      <main class="min-w-0 flex-1 space-y-6">
        <header class="surface-card p-6 sm:p-10 flex items-center gap-8 shadow-xl ring-1 ring-secondary-100">
          <div class="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-primary-600 text-white shadow-xl shadow-primary-500/20">
            <Icon :name="activePage?.icon || 'i-ph-gear-duotone'" class="h-10 w-10" />
          </div>
          <div class="space-y-2">
            <h1 class="text-4xl font-black tracking-tight text-secondary-900">{{ activePage?.label }}</h1>
            <p class="text-base font-medium text-secondary-500">{{ activePage?.description }}</p>
          </div>
        </header>

        <SettingsSection
          v-for="section in activePage?.sections"
          :key="section.title"
          :section="section"
        />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSettings } from "../../application/composables/use-settings"
import SettingsHero from "../components/SettingsHero.vue"
import SettingsSidebar from "../components/SettingsSidebar.vue"
import SettingsSection from "../components/SettingsSection.vue"

const props = defineProps<{
  pageSlug?: string
}>()

const { t } = useI18n()
const { pages, defaultSlug, findPageBySlug } = useSettings()

const activeSlug = computed(() => props.pageSlug || defaultSlug)
const activePage = computed(() => findPageBySlug(activeSlug.value))

const stats = computed(() => [
  {
    label: t("pages.settingsPage.statsSubpages"),
    value: pages.value.length,
  },
  {
    label: t("pages.settingsPage.statsFeatures"),
    value: 12,
  },
])

useSeoMeta({
  title: () => t("pages.settingsPage.seoTitle", { page: activePage.value?.label }),
})
</script>
