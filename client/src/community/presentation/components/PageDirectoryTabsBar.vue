<template>
  <section class="page-tabs-bar mt-2">
    <div class="page-tabs-bar__top">
      <div class="page-tabs-bar__tabs" role="tablist" :aria-label="$t('community.pagesDirectory.title')">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.value"
          :to="tab.to"
          class="page-tabs-bar__tab"
          :class="{ 'page-tabs-bar__tab--active': activeTab === tab.value }"
          :aria-current="activeTab === tab.value ? 'page' : undefined"
        >
          <span>{{ $t(tab.label) }}</span>
          <span v-if="tab.count > 0" class="page-tabs-bar__count">
            {{ tab.count }}
          </span>
        </NuxtLink>
      </div>

      <NuxtLink
        :to="createTo"
        class="page-tabs-bar__create"
      >
        <Icon name="i-ph-plus-bold" class="h-4 w-4" />
        <span>{{ $t("community.pagesDirectory.createAction") }}</span>
      </NuxtLink>
    </div>

  </section>
</template>

<script setup lang="ts">
import type { CommunityPageTab } from "../../domain/types/community.types"

defineProps<{
  tabs: Array<{ label: string; value: CommunityPageTab; count: number; to: string }>
  activeTab: CommunityPageTab
  createTo: string
  statusLabel?: string
}>()

const search = defineModel<string>("search", { default: "" })
</script>

<style scoped>
.page-tabs-bar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  padding: 16px 18px;
  box-shadow: var(--shadow-sm);
}

.page-tabs-bar__top {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  overflow-x: scroll;
  scrollbar-width: thin;
  scrollbar-color: #64748b #f1f5f9;
  padding-bottom: 8px; /* Room for scrollbar */
}

.page-tabs-bar__tabs {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  flex-shrink: 0;
}

.page-tabs-bar__tab {
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  border-radius: var(--radius-full);
  padding: 8px 14px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  transition: all var(--duration-fast) var(--ease-default);
}

.page-tabs-bar__tab:hover {
  color: var(--text-brand);
  background: var(--bg-surface-hover);
}

.page-tabs-bar__tab--active {
  color: var(--text-brand);
  background: var(--bg-surface-active);
}

.page-tabs-bar__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 18px;
  margin-left: 8px;
  border-radius: 999px;
  padding: 0 6px;
  background: var(--bg-surface-active);
  color: var(--text-brand);
  font-size: 10px;
  font-weight: 800;
}

.page-tabs-bar__tab--active .page-tabs-bar__count {
  background: var(--bg-brand);
  color: var(--text-inverse);
}

.page-tabs-bar__create {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 38px;
  flex-shrink: 0;
  border-radius: 12px;
  background: var(--bg-brand);
  padding: 0 14px;
  color: var(--text-inverse);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  box-shadow: var(--shadow-brand);
  transition: transform var(--duration-fast) var(--ease-default), background-color var(--duration-fast) var(--ease-default);
}

.page-tabs-bar__create:hover {
  transform: translateY(-1px);
  background: var(--bg-brand-hover);
}

.page-tabs-bar__filters {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--border-subtle);
}

.page-tabs-bar__search {
  position: relative;
  flex: 1;
}

.page-tabs-bar__search-input {
  width: 100%;
  height: 40px;
  border: 1px solid var(--border-default);
  border-radius: 10px;
  background: var(--bg-surface-hover);
  padding: 0 40px;
  color: var(--text-primary);
  font-size: 14px;
  transition: all var(--duration-fast) var(--ease-default);
}

.page-tabs-bar__search-input:focus {
  outline: none;
  border-color: var(--border-brand);
  background: var(--bg-surface);
  box-shadow: 0 0 0 3px var(--bg-brand-subtle);
}

.page-tabs-bar__search-icon {
  position: absolute;
  top: 50%;
  left: 14px;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  font-size: 18px;
}

.page-tabs-bar__search-clear {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-default);
}

.page-tabs-bar__search-clear:hover {
  background: var(--bg-surface-active);
  color: var(--text-secondary);
}

.page-tabs-bar__status {
  color: var(--text-tertiary);
  font-size: 12px;
  font-weight: 500;
}

@media (min-width: 768px) {
  .page-tabs-bar__top {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    overflow-x: visible;
    padding-bottom: 0;
  }

  .page-tabs-bar__tabs {
    flex-wrap: wrap;
  }

  .page-tabs-bar__create {
    align-self: auto;
  }

  .page-tabs-bar__filters {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
</style>

<style>
/* Global CSS block to style the webkit scrollbar for Page Directory Tabs Bar */
.page-tabs-bar__top::-webkit-scrollbar {
  height: 6px !important;
  background-color: #e2e8f0 !important;
  display: block !important;
}

.page-tabs-bar__top::-webkit-scrollbar-track {
  background-color: #e2e8f0 !important;
  border-radius: 999px !important;
}

.page-tabs-bar__top::-webkit-scrollbar-thumb {
  background-color: #475569 !important; /* Higher contrast slate-600 */
  border-radius: 999px !important;
}

.page-tabs-bar__top::-webkit-scrollbar-thumb:hover {
  background-color: #1e293b !important;
}
</style>
