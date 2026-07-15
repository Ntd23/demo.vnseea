<!-- English description: Renders the compact mobile feed navigation strip for authenticated content routes. -->
<template>
  <nav class="icon-nav">
    <NuxtLink
      v-for="item in items"
      :key="item.label"
      :to="item.to"
      class="icon-nav__item"
      :class="{ 'icon-nav__item--active': item.active }"
      :aria-label="$t(item.label)"
    >
      <Icon :name="item.active ? item.icon : item.icon.replace('-fill', '-duotone')" class="icon-nav__icon" />
      <span
        v-if="item.logoBadge"
        class="icon-nav__logo-badge"
      >
       
      </span>
      <div v-if="item.active" class="icon-nav__indicator" />
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"

const route = useRoute()

const items = computed(() => [
  {
    label: "navigation.headerIconNav.home",
    to: appRoutes.feed,
    icon: "i-ph-newspaper-clipping-fill",
    active: route.path === appRoutes.home || route.path === appRoutes.feed,
  },
  {
    label: "navigation.headerIconNav.nearby",
    to: appRoutes.searchNearby,
    icon: "i-ph-map-pin-fill",
    active: route.path === appRoutes.searchNearby,
  },
  {
    label: "navigation.headerIconNav.photos",
    to: appRoutes.photos,
    icon: "i-ph-image-fill",
    active: route.path === appRoutes.photos,
  },
  {
    label: "navigation.headerIconNav.reels",
    to: appRoutes.reels,
    icon: "i-ph-video-camera-fill",
    active: route.path === appRoutes.reels,
  },
  {
    label: "navigation.headerIconNav.products",
    to: appRoutes.products,
    icon: "i-ph-storefront-fill",
    active: route.path === appRoutes.products,
  },
])
</script>

<style scoped>
.icon-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 6px;
  overflow-x: auto;
  scrollbar-width: none;
}

.icon-nav::-webkit-scrollbar {
  display: none;
}

.icon-nav__item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  flex: 1;
  max-width: 80px;
  padding: 8px 4px 10px;
  border-radius: 12px;
  text-decoration: none;
  color: #64748b;
  transition: all 0.15s ease;
}

.icon-nav__item:hover {
  background: rgba(0, 0, 255, 0.03);
  color: #0000ff;
}

.icon-nav__item--active {
  color: #0000ff;
}

.icon-nav__icon {
  width: 22px;
  height: 22px;
  transition: transform 0.15s ease;
}

.icon-nav__item:hover .icon-nav__icon {
  transform: scale(1.08);
}

.icon-nav__label {
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.icon-nav__item--active .icon-nav__label {
  font-weight: 700;
}

.icon-nav__logo-badge {
  position: absolute;
  right: 26px;
  top: 6px;
  display: inline-flex;
  height: 8px;
  width: 8px;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: #0000ff;
  padding: 0 3px;
  font-size: 9px;
  font-weight: 800;
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 255, 0.25);
}

.icon-nav__indicator {
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 2.5px;
  border-radius: 999px;
  background: #0000ff;
}
</style>
