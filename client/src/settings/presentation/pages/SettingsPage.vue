<template>
  <div class="space-y-5 pb-10">
    <SettingsHero :stats="stats" />

    <div class="flex min-w-0 flex-col gap-5 xl:flex-row xl:items-start">
      <SettingsSidebar
        :active-slug="activePage.slug"
        :default-slug="defaultSlug"
        :pages="pages"
      />

      <main class="min-w-0 flex-1 space-y-5">
        <section class="surface-card flex items-center gap-6 p-6 sm:p-8">
          <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-[var(--text-primary)] border border-primary-100 shadow-sm transition hover:scale-105">
            <Icon :name="activePage.icon" class="h-8 w-8" />
          </div>
          <div class="space-y-1">
            <h1 class="text-3xl font-extrabold text-[var(--text-primary)] leading-tight">{{ activePage.label }}</h1>
            <p class="text-body-secondary text-sm">{{ activePage.description }}</p>
          </div>
        </section>

        <SettingsSection
          v-for="section in activePage.sections"
          :key="section.title"
          :section="section"
        />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SettingPage } from "../../application/composables/useMockSettingsData"
import { useMockSettingsData } from "../../application/composables/useMockSettingsData"
import SettingsHero from "../components/SettingsHero.vue"
import SettingsSection from "../components/SettingsSection.vue"
import SettingsSidebar from "../components/SettingsSidebar.vue"

const props = defineProps<{
  pageSlug?: string
}>()

const { t } = useI18n()
const { pages, defaultSlug, findPageBySlug } = useMockSettingsData()

const activePage = computed<SettingPage>(() =>
  findPageBySlug(props.pageSlug || defaultSlug) ?? findPageBySlug(defaultSlug)!,
)

const featureCount = computed(() =>
  pages.value.reduce((sum, page) =>
    sum
    + page.sections.reduce((sectionSum, section) =>
      sectionSum
      + (section.fields?.length ?? 0)
      + (section.toggles?.length ?? 0)
      + (section.items?.length ?? 0)
      + (section.actions?.length ?? 0), 0),
  0),
)

const stats = computed(() => [
  {
    label: t("pages.settingsPage.statsSubpages"),
    value: pages.value.length,
    description: t("pages.settingsPage.statsSubpagesDescription"),
  },
  {
    label: t("pages.settingsPage.statsFeatures"),
    value: featureCount.value,
    description: t("pages.settingsPage.statsFeaturesDescription"),
  },
  {
    label: t("pages.settingsPage.statsApi"),
    value: t("pages.settingsPage.statsApiValue"),
    description: t("pages.settingsPage.statsApiDescription"),
  },
])

useSeoMeta({
  title: () => t("pages.settingsPage.seoTitle", { page: activePage.value.label }),
  description: () => activePage.value.description,
})
</script>
