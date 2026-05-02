<template>
  <div class="settings-page pb-10">
    <!-- Compact hero banner -->
    <SettingsHero />

    <!-- Two-column layout -->
    <div class="settings-page__layout">
      <!-- Left nav sidebar -->
      <SettingsSidebar
        :active-slug="activePage.slug"
        :default-slug="defaultSlug"
        :pages="pages"
        :user-initials="userInitials"
      />

      <!-- Main content -->
      <main class="settings-page__main">
        <!-- Active page header (compact, not a full card) -->
        <div class="settings-page__page-header">
          <div class="settings-page__page-icon" aria-hidden="true">
            <Icon :name="activePage.icon" class="h-5 w-5" />
          </div>
          <div>
            <h1 class="settings-page__page-title">{{ activePage.label }}</h1>
            <p class="settings-page__page-description">{{ activePage.description }}</p>
          </div>
        </div>

        <!-- Sections -->
        <SettingsSection
          v-for="section in activePage.sections"
          :key="section.title"
          :section="section"
          :on-save="fields => updateSettings(activePage.slug, fields)"
        />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SettingPage } from "../../application/composables/useSettingsData"
import { useSettingsData } from "../../application/composables/useSettingsData"
import SettingsHero from "../components/SettingsHero.vue"
import SettingsSection from "../components/SettingsSection.vue"
import SettingsSidebar from "../components/SettingsSidebar.vue"

const props = defineProps<{
  pageSlug?: string
}>()

const { t } = useI18n()
const { pages, user, defaultSlug, findPageBySlug, updateSettings } = useSettingsData()

const activePage = computed<SettingPage>(() =>
  findPageBySlug(props.pageSlug || defaultSlug) ?? findPageBySlug(defaultSlug)!,
)

const userInitials = computed(() => {
  const name = user.value?.name || user.value?.username || ""
  const parts = name.trim().split(/\s+/).filter(Boolean)

  return parts.slice(0, 2).map(part => part[0]?.toUpperCase()).join("")
})

useSeoMeta({
  title: () => `${activePage.value.label} | ${t("settings.seo.titleSuffix")}`,
  description: () => activePage.value.description,
})
</script>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 12px;
}

/* ─── Two-column layout ───────────────── */
.settings-page__layout {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

@media (max-width: 1280px) {
  .settings-page__layout {
    flex-direction: column;
  }
}

/* ─── Main column ─────────────────────── */
.settings-page__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ─── Active page header ──────────────── */
.settings-page__page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 255, 0.04);
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.settings-page__page-icon {
  display: flex;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(0, 0, 255, 0.06);
  color: #0000ff;
  flex-shrink: 0;
}

.settings-page__page-title {
  font-size: 17px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.01em;
}

.settings-page__page-description {
  margin-top: 2px;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
}
</style>
