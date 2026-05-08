<template>
  <section class="page-tabs-bar">
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
  </section>
</template>

<script setup lang="ts">
import type { CommunityPageTab } from "../../domain/types/community.types"

defineProps<{
  tabs: Array<{ label: string; value: CommunityPageTab; count: number; to: string }>
  activeTab: CommunityPageTab
  createTo: string
}>()
</script>

<style scoped>
.page-tabs-bar {
  display: flex;
  flex-direction: column;
  gap: 14px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  padding: 16px 18px;
  box-shadow: var(--shadow-sm);
}

.page-tabs-bar__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
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
  align-self: flex-start;
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

@media (min-width: 768px) {
  .page-tabs-bar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .page-tabs-bar__create {
    align-self: auto;
  }
}
</style>
