<template>
  <div ref="menuRef" class="user-menu-root">
    <button class="user-menu__trigger" type="button" @click="open = !open">
      <div class="user-menu__avatar">VN</div>
      <div class="user-menu__trigger-info">
        <p class="user-menu__trigger-name">Van Nguyen</p>
        <p class="user-menu__trigger-role">Mock User</p>
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
        <!-- Admin header card -->
        <div class="user-menu__admin-card">
          <div class="user-menu__admin-left">
            <p class="user-menu__admin-role">{{ $t("navigation.mobileMenu.adminTitle") }}</p>
          </div>
          <div class="user-menu__admin-icon">🤝</div>
        </div>

        <!-- Wallet + Points -->
        <div class="user-menu__stats">
          <div class="user-menu__stat">
            <Icon name="i-ph-wallet-fill" class="user-menu__stat-icon" />
            <span>{{ $t("navigation.mobileMenu.walletLabel") || 'Cái ví' }}: VND9.999.999.999</span>
          </div>
          <div class="user-menu__stat">
            <Icon name="i-ph-circle-half-fill" class="user-menu__stat-icon" />
            <span>{{ $t("navigation.mobileMenu.pointsLabel") || 'Điểm' }}: 0</span>
          </div>
        </div>

        <div class="user-menu__divider" />

        <!-- Quick admin actions -->
        <div class="user-menu__section">
          <NuxtLink
            v-for="item in adminActions"
            :key="item.label"
            :to="item.to"
            class="user-menu__item"
            @click="open = false"
          >
            <Icon :name="item.icon" class="user-menu__item-icon" />
            <span class="user-menu__item-label">{{ $t(item.label) }}</span>
          </NuxtLink>
        </div>

        <div class="user-menu__divider" />

        <!-- System actions -->
        <div class="user-menu__section">
          <NuxtLink
            v-for="item in systemActions"
            :key="item.label"
            :to="item.to"
            class="user-menu__item"
            :class="{ 'user-menu__item--danger': item.danger }"
            @click="open = false"
          >
            <Icon :name="item.icon" class="user-menu__item-icon" />
            <span class="user-menu__item-label">{{ $t(item.label) }}</span>
          </NuxtLink>
        </div>

        <div class="user-menu__divider" />

        <!-- Switch account -->
        <button class="user-menu__switch" type="button">
          <span>{{ $t("navigation.mobileMenu.bottomActions.switchAccount") }}</span>
          <Icon name="i-ph-arrows-clockwise" class="h-4 w-4" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside } from "@vueuse/core"

const open = ref(false)
const menuRef = ref<HTMLElement | null>(null)

onClickOutside(menuRef, () => { open.value = false })

const adminActions = [
  { label: "navigation.mobileMenu.mainNav.advertising", icon: "i-ph-megaphone-fill", to: "/ads" },
  { label: "navigation.mobileMenu.settingsNav.editProfile", icon: "i-ph-pencil-simple-fill", to: "/setting/general" },
  { label: "navigation.mobileMenu.settingsNav.generalSettings", icon: "i-ph-users-fill", to: "/setting" },
  { label: "navigation.mobileMenu.settingsNav.registration", icon: "i-ph-clipboard-text-fill", to: "/register" },
]

const systemActions = [
  { label: "navigation.mobileMenu.settingsNav.adminArea", icon: "i-ph-squares-four-fill", to: "/admin", danger: false },
  { label: "navigation.mobileMenu.settingsNav.logout", icon: "i-ph-sign-out-fill", to: "/welcome", danger: true },
]
</script>

<style scoped>
.user-menu-root {
  position: relative;
}

.user-menu__trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px 4px 4px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.15s ease;
}

.user-menu__trigger:hover {
  border-color: rgba(0, 0, 255, 0.2);
}

.user-menu__avatar {
  display: flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(145deg, #3333ff 0%, #0000ff 100%);
  font-size: 11px;
  font-weight: 800;
  color: #ffffff;
}

.user-menu__trigger-info {
  display: none;
  text-align: left;
}

@media (min-width: 1280px) {
  .user-menu__trigger-info {
    display: block;
  }
}

.user-menu__trigger-name {
  font-size: 12.5px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

.user-menu__trigger-role {
  font-size: 10.5px;
  font-weight: 500;
  color: #94a3b8;
  line-height: 1.2;
}

.user-menu__caret {
  width: 14px;
  height: 14px;
  color: #94a3b8;
  transition: transform 0.2s ease;
}

.user-menu__caret--open {
  transform: rotate(180deg);
}

/* Dropdown */
.user-menu__dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 50;
  margin-top: 8px;
  width: 280px;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 255, 0.06);
  box-shadow: 0 12px 44px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

/* Admin header card */
.user-menu__admin-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  background: linear-gradient(135deg, #0000ff 0%, #2233ff 100%);
  color: #ffffff;
}

.user-menu__admin-role {
  font-size: 15px;
  font-weight: 800;
}

.user-menu__admin-icon {
  font-size: 28px;
}

/* Stats */
.user-menu__stats {
  padding: 12px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-menu__stat {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 500;
  color: #475569;
}

.user-menu__stat-icon {
  width: 16px;
  height: 16px;
  color: #64748b;
}

.user-menu__divider {
  height: 1px;
  background: #f1f5f9;
}

/* Menu items */
.user-menu__section {
  padding: 6px;
}

.user-menu__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  text-decoration: none;
  color: #1e293b;
  font-size: 13px;
  font-weight: 600;
  transition: background 0.12s ease;
}

.user-menu__item:hover {
  background: rgba(0, 0, 255, 0.04);
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
  color: #64748b;
  flex-shrink: 0;
}

.user-menu__item--danger .user-menu__item-icon {
  color: #dc2626;
}

.user-menu__item-label {
  min-width: 0;
}

/* Switch account */
.user-menu__switch {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: background 0.12s ease;
}

.user-menu__switch:hover {
  background: #f8fafc;
}
</style>
