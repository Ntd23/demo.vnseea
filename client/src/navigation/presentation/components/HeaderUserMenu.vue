<!-- English description: Header user menu with current account shortcuts and locale-aware wallet formatting. -->
<template>
  <div ref="menuRef" class="user-menu-root">
    <button class="user-menu__trigger" type="button" @click="open = !open">
      <div class="user-menu__avatar">
        <NuxtImg
          v-if="avatarUrl"
          :src="avatarUrl"
          :alt="currentUser.name"
          class="h-full w-full rounded-full object-cover"
          width="34"
          height="34"
          loading="lazy"
        />
        <span v-else>{{ userInitials }}</span>
      </div>
      <Icon name="i-ph-caret-down-bold" class="user-menu__caret" :class="{ 'user-menu__caret--open': open }" />
    </button>

    <Transition
      enter-active-class="transition duration-200 ease-out origin-top-right"
      enter-from-class="opacity-0 scale-95 translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in origin-top-right"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="open" class="user-menu__dropdown">
        <div class="user-menu__summary">
          <div class="user-menu__summary-card">
            <div class="user-menu__summary-head">
              <NuxtLink
                v-if="currentUser"
                :to="profilePath"
                class="user-menu__summary-name"
                @click="open = false"
              >
                <span class="user-menu__summary-avatar">
                  <NuxtImg
                    v-if="avatarUrl"
                    :src="avatarUrl"
                    :alt="currentUser.name"
                    width="40"
                    height="40"
                    loading="lazy"
                  />
                  <span v-else>{{ userInitials }}</span>
                </span>
                <span class="user-menu__summary-name-text">{{ currentUser.name }}</span>
              </NuxtLink>
              <p v-else class="user-menu__summary-name">User</p>
              <Icon name="i-ph-hand-heart-fill" class="user-menu__summary-icon" />
            </div>

            <div v-if="showStats" class="user-menu__stats">
              <NuxtLink v-if="formattedWalletPoints" :to="appRoutes.wallet" class="user-menu__stat" @click="open = false">
                <Icon name="i-ph-wallet-fill" class="user-menu__stat-icon" />
                <span>{{ $t("navigation.mobileMenu.walletLabel") || "Wallet" }}: {{ formattedWalletPoints }}</span>
              </NuxtLink>
              <!-- <NuxtLink v-if="formattedPoints" :to="appRoutes.settingsPage('myPoints')" class="user-menu__stat" @click="open = false">
                <Icon name="i-ph-circle-half-fill" class="user-menu__stat-icon" />
                <span>{{ $t("navigation.mobileMenu.pointsLabel") || "VNSEEA" }}: {{ formattedPoints }}</span>
              </NuxtLink> -->
            </div>
          </div>
        </div>

        <div class="user-menu__section">
          <button
            v-for="item in quickActions"
            :key="item.label"
            type="button"
            class="user-menu__item"
            @click="closeAndNavigate(item.to)"
          >
            <Icon :name="item.icon" class="user-menu__item-icon" />
            <span class="user-menu__item-label">{{ $t(item.label) }}</span>
          </button>
        </div>

        <div class="user-menu__divider" />

        <div class="user-menu__section">
          <template v-for="item in systemActions" :key="item.label">
            <a
              v-if="item.external"
              :href="item.to"
              class="user-menu__item"
              :class="{ 'user-menu__item--danger': item.danger }"
              @click="open = false"
            >
              <Icon :name="item.icon" class="user-menu__item-icon" />
              <span class="user-menu__item-label">{{ $t(item.label) }}</span>
            </a>
            <NuxtLink
              v-else
              :to="item.to"
              class="user-menu__item"
              :class="{ 'user-menu__item--danger': item.danger }"
              @click="open = false"
            >
              <Icon :name="item.icon" class="user-menu__item-icon" />
              <span class="user-menu__item-label">{{ $t(item.label) }}</span>
            </NuxtLink>
          </template>

          <div class="user-menu__item user-menu__item--theme">
            <Icon name="i-ph-moon-bold" class="user-menu__item-icon h-5 w-5" />
            <UColorModeSwitch color="primary" size="md" />
          </div>

          <NavigationLocaleSwitcher />

          <NuxtLink
            :to="logoutAction.to"
            class="user-menu__item user-menu__item--danger"
            @click="open = false"
          >
            <Icon :name="logoutAction.icon" class="user-menu__item-icon" />
            <span class="user-menu__item-label">{{ $t(logoutAction.label) }}</span>
          </NuxtLink>
        </div>

        <!-- <div class="user-menu__divider" />

        <button class="user-menu__switch" type="button">
          <span>{{ $t("navigation.mobileMenu.bottomActions.switchAccount") }}</span>
          <Icon name="i-ph-arrows-clockwise" class="h-4 w-4" />
        </button> -->
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside } from "@vueuse/core"
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import { useBackendWebUrl } from "#shared-kernel/application/utils/backend-web-url"
import { useCurrentAuthUserStore } from "../../../auth/application/stores/useCurrentAuthUserStore"
import NavigationLocaleSwitcher from "./LocaleSwitcher.vue"

const { t, locale } = useI18n()
const currentAuthUserStore = useCurrentAuthUserStore()
const open = ref(false)
const menuRef = ref<HTMLElement | null>(null)

onClickOutside(menuRef, () => { open.value = false })

const currentUser = computed(() => currentAuthUserStore.user)
const avatarUrl = computed(() =>
  typeof currentUser.value?.avatarUrl === "string" && currentUser.value.avatarUrl.length > 0
    ? currentUser.value.avatarUrl
    : "",
)
const userInitials = computed(() =>
  currentUser.value?.name
    ?.split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? "")
    .join("")
  || "U",
)
const secondaryLabel = computed(() => {
  if (!currentUser.value) return ""
  if (currentUser.value.isAdmin) return t("navigation.mobileMenu.adminTitle")
  if (currentUser.value.isModerator) return t("navigation.mobileMenu.moderatorTitle")
  if (currentUser.value.username) return `@${currentUser.value.username}`
  return ""
})

const profilePath = computed(() => currentUser.value?.username ? `/@${currentUser.value.username}` : "#")

const numberFormatter = computed(() => new Intl.NumberFormat(locale.value === "vi" ? "vi-VN" : "en-US"))
const formattedPoints = computed(() => {
  const value = currentUser.value?.points

  if (value === undefined || value === null || Number.isNaN(value)) {
    return ""
  }

  return numberFormatter.value.format(value)
})
const formattedWalletPoints = computed(() =>
  formattedPoints.value ? `${formattedPoints.value} VNSEEA` : "",
)
const showStats = computed(() => Boolean(formattedPoints.value))

function closeAndNavigate(to: string) {
  open.value = false
  void navigateTo(to)
}

const quickActions = computed(() => {
  const items = [
    { label: "navigation.mobileMenu.mainNav.advertising", icon: "i-ph-megaphone-fill", to: appRoutes.ads },
    { label: "navigation.mobileMenu.mainNav.offers", icon: "i-ph-tag-chevron-fill", to: appRoutes.offers },
  ]

  if (currentUser.value?.isPro && currentUser.value?.canBoostPosts) {
    items.push({
      label: "navigation.mobileMenu.settingsNav.boostedPosts",
      icon: "i-ph-lightning-fill",
      to: appRoutes.boostedPosts,
    })
  }

  if (currentUser.value?.isPro && currentUser.value?.canBoostPages) {
    items.push({
      label: "navigation.mobileMenu.settingsNav.boostedPages",
      icon: "i-ph-lightning-fill",
      to: appRoutes.boostedPages,
    })
  }

  items.push(
    { label: "navigation.mobileMenu.settingsNav.editProfile", icon: "i-ph-pencil-simple-fill", to: appRoutes.settingsPage("general") },
    { label: "navigation.mobileMenu.settingsNav.generalSettings", icon: "i-ph-users-fill", to: appRoutes.settings },
    { label: "navigation.mobileMenu.settingsNav.registration", icon: "i-ph-clipboard-text-fill", to: appRoutes.register },
  )

  return items
})

const adminCpUrl = useBackendWebUrl(appRoutes.adminCp)
const systemActions = computed(() => {
  const items: Array<{ label: string; icon: string; to: string; danger?: boolean; external?: boolean }> = []

  if (currentUser.value?.isAdmin) {
    items.push({
      label: "navigation.mobileMenu.settingsNav.adminArea",
      icon: "i-ph-squares-four-fill",
      to: adminCpUrl,
      external: true,
    })
  }

  return items
})

const logoutAction = {
  label: "navigation.mobileMenu.settingsNav.logout",
  icon: "i-ph-sign-out-fill",
  to: appRoutes.logout,
}
</script>

<style scoped>
.user-menu-root {
  position: relative;
}

.user-menu__trigger {
  display: flex;
  width: 82px;
  height: 46px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 4px;
  border-radius: 16px;
  border: 1px solid var(--border-default);
  background: var(--bg-surface);
  cursor: pointer;
  transition: all 0.15s ease;
}

.user-menu__trigger:hover {
  border-color: color-mix(in srgb, var(--bg-brand) 18%, transparent);
}

.user-menu__avatar {
  display: flex;
  width: 34px;
  height: 34px;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(145deg, var(--bg-brand-hover) 0%, var(--bg-brand) 100%);
  font-size: 11px;
  font-weight: 800;
  color: #ffffff;
}

.user-menu__caret {
  width: 14px;
  height: 14px;
  color: var(--text-tertiary);
  transition: transform 0.2s ease;
}

.user-menu__caret--open {
  transform: rotate(180deg);
}

.user-menu__dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 110;
  margin-top: 8px;
  width: 318px;
  max-height: min(720px, calc(100dvh - 84px));
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  border-radius: 22px;
  border: 1px solid var(--border-default);
  background: var(--bg-surface);
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.16);
}

.user-menu__summary {
  padding: 14px 14px 10px;
}

.user-menu__summary-card {
  border-radius: 16px;
  background: var(--bg-muted);
  padding: 16px;
}

.user-menu__summary-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.user-menu__summary-name {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
  font-size: 17px;
  font-weight: 800;
  line-height: 1.25;
  color: var(--text-primary);
  text-decoration: none;
  transition: color 0.15s ease;
}

.user-menu__summary-avatar {
  display: inline-flex;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 2px solid #ffffff;
  border-radius: 50%;
  background: linear-gradient(145deg, var(--bg-brand-hover) 0%, var(--bg-brand) 100%);
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.1);
}

.user-menu__summary-avatar :deep(img) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-menu__summary-name-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-menu__summary-name:hover {
  color: var(--bg-brand);
}

.user-menu__summary-name:hover .user-menu__summary-name-text {
  text-decoration: underline;
}

.user-menu__summary-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: #f59e0b;
}

.user-menu__stats {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-menu__stat {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 6px;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 500;
   color: var(--text-primary);
  text-decoration: none;
  transition: color 0.15s ease, background 0.15s ease;
}

a.user-menu__stat:hover {
  background: var(--bg-surface-hover);
  color: var(--text-brand);
}

.user-menu__stat-icon {
  width: 18px;
  height: 18px;
  color: var(--text-primary);
}

.user-menu__divider {
  height: 1px;
  background: var(--border-light);
}

.user-menu__section {
  padding: 6px 0;
}

.user-menu__item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border: 0;
  background: transparent;
  text-decoration: none;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 600;
  text-align: left;
  transition: background 0.12s ease;
  cursor: pointer;
}

.user-menu__item:hover {
  background: var(--bg-surface-hover);
  color: var(--text-brand);
}
.user-menu__item:hover .user-menu__item-icon {
  color: var(--text-brand);
}

.user-menu__item--danger {
  color: #dc2626;
}

.user-menu__item--danger:hover {
  background: #fef2f2;
}

.user-menu__item-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: var(--text-primary);
}

.user-menu__item--danger .user-menu__item-icon {
  color: #dc2626;
}

.user-menu__item-label {
  font-size: 16px;
  min-width: 0;
}

.user-menu__switch {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.12s ease;
}

.user-menu__switch:hover {
  background: var(--bg-surface-hover);
}
</style>
