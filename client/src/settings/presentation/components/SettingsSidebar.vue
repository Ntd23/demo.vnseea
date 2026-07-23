<template>
  <aside class="settings-sidebar" aria-label="Settings navigation">

    <div class="settings-sidebar__divider" />

    <!-- Navigation (Desktop) -->
    <nav class="settings-sidebar__nav settings-sidebar__nav--desktop">
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
            :name="page.slug === activeSlug ? page.icon : page.icon"
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

    <!-- Navigation (Mobile) -->
    <nav class="settings-sidebar__nav settings-sidebar__nav--mobile">
      <NuxtLink
        v-for="page in visiblePages"
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
            :name="page.slug === activeSlug ? page.icon : page.icon"
            class="h-5 w-5"
          />
        </span>
        <span class="settings-sidebar__label">{{ page.label }}</span>
      </NuxtLink>

      <div
        v-if="morePages.length"
        ref="dropdownRef"
        class="settings-sidebar__dropdown-wrapper"
      >
        <div
          class="settings-sidebar__item settings-sidebar__item--more"
          :class="{ 'settings-sidebar__item--active': isMoreActive || isMenuOpen }"
          @click="isMenuOpen = !isMenuOpen"
        >
          <span
            class="settings-sidebar__icon"
            :class="{ 'settings-sidebar__icon--active': isMoreActive || isMenuOpen }"
          >
            <Icon name="i-ph-dots-three-bold" class="h-5 w-5" />
          </span>
        </div>

        <!-- Custom Dropdown Menu -->
        <Transition name="dropdown">
          <div v-if="isMenuOpen" class="settings-sidebar__dropdown-menu">
            <NuxtLink
              v-for="page in morePages"
              :key="page.slug"
              :to="page.slug === defaultSlug ? appRoutes.settings : appRoutes.settingsPage(page.slug)"
              class="settings-sidebar__dropdown-item"
              :class="{ 'settings-sidebar__dropdown-item--active': page.slug === activeSlug }"
              @click="isMenuOpen = false"
            >
              <Icon
                :name="page.slug === activeSlug ? page.icon : page.icon"
                class="h-4 w-4"
              />
              <span>{{ page.label }}</span>
            </NuxtLink>
          </div>
        </Transition>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import type { SettingPage } from "../../application/view-models/settings-page.types"

const { t } = useI18n()

const props = defineProps<{
  pages: ReadonlyArray<SettingPage>
  activeSlug: string
  defaultSlug: string
  userInitials?: string
}>()

// Mobile split logic
const visiblePages = computed(() => props.pages.slice(0, 3))
const morePages = computed(() => props.pages.slice(3))
const isMoreActive = computed(() => morePages.value.some(p => p.slug === props.activeSlug))

// Custom Dropdown State
const isMenuOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

onClickOutside(dropdownRef, () => {
  isMenuOpen.value = false
})
</script>

<style scoped>
.settings-sidebar {
  background: var(--bg-surface);
  border: 1px solid color-mix(in srgb, var(--bg-brand) 4%, transparent);
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
  background: linear-gradient(145deg, var(--bg-brand-hover) 0%, var(--bg-brand) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: #ffffff;
  flex-shrink: 0;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--bg-brand) 20%, transparent);
}

.settings-sidebar__profile-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.settings-sidebar__profile-meta {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-tertiary);
  margin-top: 2px;
}

/* ─── Divider ─────────────────────────── */
.settings-sidebar__divider {
  height: 1px;
  background: var(--bg-muted);
  margin: 0 4px 8px;
}

/* ─── Nav ─────────────────────────────── */
.settings-sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.settings-sidebar__nav--desktop {
  display: flex;
}

.settings-sidebar__nav--mobile {
  display: none;
}

.settings-sidebar__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 12px;
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.15s ease;
  white-space: nowrap;
  cursor: pointer;
}

.settings-sidebar__item:hover {
  background: color-mix(in srgb, var(--bg-brand) 3%, transparent);
  color: var(--bg-brand);
}

.settings-sidebar__item--active {
  background: color-mix(in srgb, var(--bg-brand) 5%, transparent);
  color: var(--bg-brand);
}

/* ─── Icon container ──────────────────── */
.settings-sidebar__icon {
  display: flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--bg-surface);
  border: 1px solid #e2e8f0;
  color: var(--text-primary);
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.settings-sidebar__item:hover .settings-sidebar__icon {
  background: var(--bg-muted);
  border-color: var(--text-primary);
  color: var(--text-primary);
}

.settings-sidebar__icon--active {
  background: var(--bg-brand) !important;
  color: #ffffff !important;
}

/* ─── Label ───────────────────────────── */
.settings-sidebar__label {
  font-size: 13px;
  font-weight: 600;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.settings-sidebar__item--active .settings-sidebar__label {
  font-weight: 700;
}

/* ─── Caret ───────────────────────────── */
.settings-sidebar__caret {
  width: 11px;
  height: 11px;
  color: var(--text-primary);
  opacity: 0.7;
  flex-shrink: 0;
}

.settings-sidebar__dropdown-wrapper {
  flex: 1;
  display: flex;
  position: relative;
}

.settings-sidebar__item--more {
  width: 100%;
}

.settings-sidebar__dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: var(--bg-surface);
  border: 1px solid color-mix(in srgb, var(--bg-brand) 8%, transparent);
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 200px;
  z-index: 100;
}

.settings-sidebar__dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  text-decoration: none;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 600;
  transition: all 0.15s ease;
}

.settings-sidebar__dropdown-item:hover {
  background: var(--bg-muted);
  color: var(--bg-brand);
}

.settings-sidebar__dropdown-item--active {
  background: color-mix(in srgb, var(--bg-brand) 5%, transparent);
  color: var(--bg-brand);
  font-weight: 700;
}

/* Dropdown Transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ─── Mobile Overrides ────────────────── */
@media (max-width: 1280px) {
  .settings-sidebar {
    width: 100%;
    position: relative;
    top: 0;
    padding: 12px;
    margin-bottom: 8px;
  }
  
  .settings-sidebar__profile,
  .settings-sidebar__divider {
    display: none;
  }

  .settings-sidebar__nav--desktop {
    display: none !important;
  }

  .settings-sidebar__nav--mobile {
    display: flex !important;
    flex-direction: row;
    justify-content: space-between;
    gap: 8px;
  }
  
  .settings-sidebar__item {
    flex: 1;
    flex-direction: column;
    padding: 8px 12px;
    border-radius: 16px;
    background: transparent;
    border: 1px solid transparent;
    text-align: center;
  }

  .settings-sidebar__item--active {
    background: var(--color-primary-50);
    border-color: var(--color-primary-200);
  }
  
  .settings-sidebar__label {
    font-size: 11px;
    white-space: normal;
    text-overflow: clip;
    flex: none;
    line-height: 1.2;
  }

  .settings-sidebar__icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: transparent !important;
    box-shadow: none !important;
  }
  
  .settings-sidebar__icon--active {
    background: transparent !important;
    color: var(--bg-brand) !important;
    box-shadow: none !important;
  }
  
  .settings-sidebar__icon :deep(svg) {
    width: 20px;
    height: 20px;
  }
}
</style>
