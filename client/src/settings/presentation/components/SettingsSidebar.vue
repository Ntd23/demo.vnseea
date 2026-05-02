<template>
  <aside class="settings-sidebar" aria-label="Settings navigation">
    <!-- User mini-profile -->
    <div class="settings-sidebar__profile">
      <div class="settings-sidebar__avatar" aria-hidden="true">
        <span v-if="userInitials">{{ userInitials }}</span>
        <Icon v-else name="i-ph-user-circle-duotone" class="h-5 w-5" />
      </div>
      <div class="settings-sidebar__profile-info">
        <p class="settings-sidebar__profile-name">{{ t("settings.sidebar.title") }}</p>
        <p class="settings-sidebar__profile-meta">
          {{ t("settings.sidebar.subPages", { count: pages.length }) }}
        </p>
      </div>
    </div>

    <div class="settings-sidebar__divider" />

    <!-- Navigation -->
    <nav class="settings-sidebar__nav">
      <NuxtLink
        v-for="page in pages"
        :key="page.slug"
        :to="page.slug === defaultSlug ? appRoutes.settings : appRoutes.settingsPage(page.slug)"
        class="settings-sidebar__item"
        :class="{ 'settings-sidebar__item--active': page.slug === activeSlug }"
      >
        <span
          class="settings-sidebar__icon"
          :class="{ 'settings-sidebar__icon--active': page.slug === activeSlug }"
        >
          <Icon
            :name="page.slug === activeSlug ? page.icon : page.icon.replace('-fill', '-duotone')"
            class="h-4 w-4"
          />
        </span>
        <span class="settings-sidebar__label">{{ page.label }}</span>
        <Icon
          v-if="page.slug === activeSlug"
          name="i-ph-caret-right-bold"
          class="settings-sidebar__caret"
          aria-hidden="true"
        />
      </NuxtLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import type { SettingPage } from "../../application/composables/useSettingsData"

const { t } = useI18n()

defineProps<{
  pages: ReadonlyArray<SettingPage>
  activeSlug: string
  defaultSlug: string
  userInitials?: string
}>()
</script>

<style scoped>
.settings-sidebar {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 255, 0.04);
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  padding: 14px;
  width: 260px;
  flex-shrink: 0;
  /* sticky on xl */
  position: sticky;
  top: 80px;
  align-self: flex-start;
}

/* ─── Profile section ─────────────────── */
.settings-sidebar__profile {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 4px 10px;
}

.settings-sidebar__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(145deg, #3333ff 0%, #0000ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: #ffffff;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 255, 0.2);
}

.settings-sidebar__profile-name {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
}

.settings-sidebar__profile-meta {
  font-size: 11px;
  font-weight: 500;
  color: #94a3b8;
  margin-top: 2px;
}

/* ─── Divider ─────────────────────────── */
.settings-sidebar__divider {
  height: 1px;
  background: #f1f5f9;
  margin: 0 4px 8px;
}

/* ─── Nav ─────────────────────────────── */
.settings-sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.settings-sidebar__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 12px;
  text-decoration: none;
  color: #334155;
  transition: all 0.15s ease;
}

.settings-sidebar__item:hover {
  background: rgba(0, 0, 255, 0.03);
  color: #0000ff;
}

.settings-sidebar__item--active {
  background: rgba(0, 0, 255, 0.05);
  color: #0000ff;
}

/* ─── Icon container ──────────────────── */
.settings-sidebar__icon {
  display: flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #f1f5f9;
  color: #475569;
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.settings-sidebar__item:hover .settings-sidebar__icon {
  background: rgba(0, 0, 255, 0.06);
  color: #0000ff;
}

.settings-sidebar__icon--active {
  background: #0000ff !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(0, 0, 255, 0.2);
}

/* ─── Label ───────────────────────────── */
.settings-sidebar__label {
  font-size: 13px;
  font-weight: 600;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.settings-sidebar__item--active .settings-sidebar__label {
  font-weight: 700;
}

/* ─── Caret ───────────────────────────── */
.settings-sidebar__caret {
  width: 11px;
  height: 11px;
  color: #0000ff;
  opacity: 0.5;
  flex-shrink: 0;
}
</style>
