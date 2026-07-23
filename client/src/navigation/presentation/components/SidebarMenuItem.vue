<!-- English description: Renders one authenticated sidebar navigation item with active state handling. -->
<template>
  <NuxtLink
    :to="to"
    class="sidebar-item"
    :class="{ 'sidebar-item--active': isActive }"
  >
    <span class="sidebar-item__icon" :class="{ 'sidebar-item__icon--active': isActive }">
      <Icon :name="icon.replace('-fill', '-bold')" class="h-4.5 w-4.5" />
    </span>
    
    <span class="sidebar-item__label">{{ label }}</span>
    
    <span
      v-if="badge"
      class="sidebar-item__badge"
      :class="{ 'sidebar-item__badge--active': isActive }"
    >
      {{ badge }}
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
const route = useRoute()

const props = defineProps<{
  label: string
  icon: string
  to: string
  badge?: number
  active?: boolean
}>()

const isActive = computed(() => {
  if (props.active !== undefined) return props.active
  
  if (props.to === "/") {
    return route.path === "/" || route.path === "/home"
  }

  return route.path === props.to
})
</script>

<style scoped>
.sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.15s ease;
  position: relative;
}

.sidebar-item:hover {
  background: color-mix(in srgb, var(--bg-brand) 3%, transparent);
}

.sidebar-item--active {
  background: color-mix(in srgb, var(--bg-brand) 5%, transparent);
}

/* Active left accent bar */
.sidebar-item--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: var(--bg-brand);
}

.sidebar-item__icon {
  display: flex;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: transparent;
  color: var(--icon-primary);
  transition: all 0.15s ease;
}

.sidebar-item:hover .sidebar-item__icon {
  background: color-mix(in srgb, var(--bg-brand) 6%, transparent);
  color: var(--bg-brand);
}

.sidebar-item__icon--active {
  background: var(--bg-brand) !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--bg-brand) 20%, transparent);
}

.sidebar-item__label {
  font-size: 16px;
  font-weight: 600;
  color: var(--icon-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-item--active .sidebar-item__label {
  color: var(--bg-brand);
  font-weight: 700;
}

.sidebar-item:hover .sidebar-item__label {
  color: var(--bg-brand);
}

.sidebar-item__badge {
  margin-left: auto;
  display: inline-flex;
  min-width: 20px;
  height: 20px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  padding: 0 6px;
  font-size: 10px;
  font-weight: 700;
  background: color-mix(in srgb, var(--bg-brand) 8%, transparent);
  color: var(--bg-brand);
}

.sidebar-item__badge--active {
  background: var(--bg-brand);
  color: #ffffff;
}
</style>
