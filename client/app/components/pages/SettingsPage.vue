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
        <section class="rounded-[30px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-md)]">
          <div class="flex items-start gap-4">
            <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[var(--color-primary-50)] text-[var(--color-primary-600)]">
              <Icon :name="activePage.icon" class="h-7 w-7" />
            </div>
            <div>
              <p class="text-label-secondary text-[var(--text-tertiary)]">/setting/{{ activePage.slug === defaultSlug ? "" : activePage.slug }}</p>
              <h1 class="mt-1 text-2xl font-black text-[var(--text-primary)]">{{ activePage.label }}</h1>
              <p class="mt-1 text-body-secondary">{{ activePage.description }}</p>
            </div>
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
import type { SettingPage } from "~/composables/useMockSettingsData"

const props = defineProps<{
  pageSlug?: string
}>()

const { t } = useI18n()
const { pages, defaultSlug, findPageBySlug } = useMockSettingsData()

const activePage = computed<SettingPage>(() =>
  findPageBySlug(props.pageSlug || defaultSlug) ?? findPageBySlug(defaultSlug)!,
)

const featureCount = computed(() =>
  pages.reduce((sum, page) =>
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
    label: t("settings.hero.stats.subPages.label"),
    value: pages.length,
    description: t("settings.hero.stats.subPages.description"),
  },
  {
    label: t("settings.hero.stats.features.label"),
    value: featureCount.value,
    description: t("settings.hero.stats.features.description"),
  },
  {
    label: t("settings.hero.stats.api.label"),
    value: t("settings.hero.stats.api.value"),
    description: t("settings.hero.stats.api.description"),
  },
])

useSeoMeta({
  title: () => `${activePage.value.label} | ${t("settings.seo.titleSuffix")}`,
  description: () => activePage.value.description,
})
</script>
