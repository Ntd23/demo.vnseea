<!-- English description: Renders account settings sections without duplicating the global navigation locale control. -->
<template>
  <div class="settings-page pb-10 mt-1.5">
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
        <!-- Sections -->
        <SettingsMyPointsPanel
          v-if="activePage.slug === 'myPoints'"
          :user="user"
          :on-exchange="exchangePoints"
          :on-transfer="transferPoints"
          :on-load-receive-qr="getPointsReceiveQr"
        />
        <SettingsVerificationPanel
          v-else-if="isVerificationPage"
        />
        <SettingsMonetizationPanel
          v-else-if="activePage.slug === 'monetization'"
          :overview="monetization"
        />
        <SettingsAffiliatesPanel
          v-else-if="activePage.slug === 'affiliates'"
          :overview="affiliates"
          :user="user"
        />
        <template v-else>
          <SettingsSection
            v-for="section in activePage.sections"
            :key="section.title"
            :section="section"
            :on-save="fields => updateSettings(activePage.slug, fields)"
            :on-action="handleItemAction"
          />
        </template>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSettingsPageVM } from "../../application/view-models/useSettingsPageVM"
import SettingsAffiliatesPanel from "../components/SettingsAffiliatesPanel.vue"
import SettingsMonetizationPanel from "../components/SettingsMonetizationPanel.vue"
import SettingsMyPointsPanel from "../components/SettingsMyPointsPanel.vue"
import SettingsSection from "../components/SettingsSection.vue"
import SettingsSidebar from "../components/SettingsSidebar.vue"
import SettingsVerificationPanel from "../components/SettingsVerificationPanel.vue"

const props = defineProps<{
  pageSlug?: string
}>()

const { 
  pages,
  user,
  activePage,
  monetization,
  affiliates,
  defaultSlug,
  userInitials,
  updateSettings,
  handleItemAction,
  exchangePoints,
  transferPoints,
  getPointsReceiveQr,
} = useSettingsPageVM(() => props.pageSlug)

const isVerificationPage = computed(() =>
  props.pageSlug === "verification" || activePage.value.slug === "verification",
)
</script>

<style scoped>
.settings-page {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1200px;
}

/* ─── Two-column layout ───────────────── */
.settings-page__layout {
  width: 100%;
  min-width: 0;
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
  width: 100%;
}

/* ─── Active page header ──────────────── */
.settings-page__page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--bg-surface);
  border: 1px solid color-mix(in srgb, var(--bg-brand) 4%, transparent);
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
  background: var(--bg-muted);
  border: 1px solid #e2e8f0;
  color: var(--text-primary);
  flex-shrink: 0;
}

.settings-page__page-title {
  font-size: 17px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.settings-page__page-description {
  margin-top: 2px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
}
</style>
