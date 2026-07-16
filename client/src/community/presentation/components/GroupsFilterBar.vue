<!-- Description: Renders the legacy-style group directory tab row with only tab navigation and the create-group action. -->
<template>
  <section class="groups-filter-bar">
    <div class="groups-filter-bar__tabs" role="tablist" :aria-label="$t('community.groups.hub')">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.value"
        :to="tab.to"
        class="groups-filter-bar__tab"
        :class="{ 'groups-filter-bar__tab--active': activeTab === tab.value }"
        :aria-current="activeTab === tab.value ? 'page' : undefined"
      >
        {{ $t(tab.label) }}
      </NuxtLink>
    </div>

    <NuxtLink
      :to="createTo"
      class="groups-filter-bar__create"
    >
      <Icon name="i-ph-plus-bold" class="h-4 w-4" />
      <span>{{ $t("community.groups.action.createNew") }}</span>
    </NuxtLink>
  </section>
</template>

<script setup lang="ts">
import type { CommunityGroupTab } from "../../domain/types/community.types"

defineProps<{
  tabs: Array<{ label: string; value: CommunityGroupTab; to: string }>
  activeTab: CommunityGroupTab
  createTo: string
}>()
</script>

<style scoped>
.groups-filter-bar {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  padding: 12px 14px 16px; /* Increased bottom padding to host the scrollbar */
  box-shadow: var(--shadow-sm);
  overflow-x: scroll; /* Force scrollbar state to be active */
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: #94a3b8 #f1f5f9; /* Firefox */
}

.groups-filter-bar__tabs {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  flex-shrink: 0;
}

.groups-filter-bar__tab {
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  border-radius: var(--radius-full);
  padding: 8px 14px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  transition: color var(--duration-fast) var(--ease-default), background-color var(--duration-fast) var(--ease-default);
}

.groups-filter-bar__tab:hover {
  color: var(--text-brand);
  background: var(--bg-surface-hover);
}

.groups-filter-bar__tab--active {
  color: var(--text-brand);
  background: var(--bg-surface-active);
}

.groups-filter-bar__create {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 36px;
  border-radius: 12px;
  background: var(--bg-brand);
  padding: 0 14px;
  color: var(--text-inverse);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  box-shadow: var(--shadow-brand);
  white-space: nowrap;
  flex-shrink: 0;
  transition: transform var(--duration-fast) var(--ease-default), background-color var(--duration-fast) var(--ease-default);
}

.groups-filter-bar__create:hover {
  transform: translateY(-1px);
  background: var(--bg-brand-hover);
}

@media (min-width: 768px) {
  .groups-filter-bar {
    justify-content: space-between;
    overflow-x: visible;
    padding: 16px 18px;
  }
}
</style>

<style>
/* Global CSS block to style the webkit scrollbar without Vue scoped attribute restriction */
.groups-filter-bar::-webkit-scrollbar {
  height: 6px !important;
  background-color: #e2e8f0 !important;
  display: block !important;
}

.groups-filter-bar::-webkit-scrollbar-track {
  background-color: #e2e8f0 !important;
  border-radius: 999px !important;
}

.page-tabs-bar__top::-webkit-scrollbar-thumb,
.groups-filter-bar::-webkit-scrollbar-thumb {
  background-color: #475569 !important; /* Higher contrast slate-600 */
  border-radius: 999px !important;
}

.page-tabs-bar__top::-webkit-scrollbar-thumb:hover,
.groups-filter-bar::-webkit-scrollbar-thumb:hover {
  background-color: #1e293b !important;
}
</style>
