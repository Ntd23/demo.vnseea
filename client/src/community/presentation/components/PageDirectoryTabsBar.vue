<!-- Description: Renders the legacy-style page directory tab row with only tab navigation and the create-page action. -->
<template>
  <section class="page-tabs-bar">
    <div class="page-tabs-bar__row">
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
          <span class="page-tabs-bar__count">
            {{ tab.count }}
          </span>
        </NuxtLink>
      </div>
       <span class="page-tabs-bar__label">
        {{ $t("community.pagesDirectory.searchLabel") }}
      </span>
    </div>

    <div class="page-tabs-bar__footer">
      <div class="page-tabs-bar__left">
        <p v-if="statusLabel" class="page-tabs-bar__status">
          {{ statusLabel }}
        </p>
        <div class="page-tabs-bar__search">
          <div class="page-tabs-bar__input">
            <UInput
              v-model="search"
              :placeholder="$t('community.pagesDirectory.search')"
              leading-icon="i-ph-magnifying-glass-bold"
              color="primary"
              size="lg"
              class="w-full"
              :ui="searchInputUi"
            />
          </div>

          <UButton
            v-if="search.trim()"
            type="button"
            color="neutral"
            variant="outline"
            size="md"
            class="rounded-full w-40"
            @click="search = ''"
          >
            {{ $t("community.pagesDirectory.clearSearch") }}
          </UButton>
        </div>
      </div>

      <NuxtLink
        to="/create-page"
        class="page-tabs-bar__create-btn"
      >
        <Icon name="i-ph-plus-bold" class="page-tabs-bar__create-icon" />
        <span>{{ $t("community.pagesDirectory.createAction") }}</span>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CommunityPageTab } from "../../domain/types/community.types"

defineProps<{
  tabs: Array<{ label: string; value: CommunityPageTab; to: string }>
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
  transition: color var(--duration-fast) var(--ease-default), background-color var(--duration-fast) var(--ease-default);
}

.page-tabs-bar__tab:hover {
  color: var(--text-brand);
  background: var(--bg-surface-hover);
}

.page-tabs-bar__tab--active {
  color: var(--text-brand);
  background: var(--bg-surface-active);
}

.page-tabs-bar__create {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 11px;
  font-weight: 900;
}

.page-tabs-bar__tab:not(.page-tabs-bar__tab--active) .page-tabs-bar__count {
  background: #f1f5f9;
  color: #64748b;
}

.page-tabs-bar__search {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.page-tabs-bar__input {
  width: 100%;
}

.page-tabs-bar__footer {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 16px;
  border-top: 1px solid #f1f5f9;
  padding-top: 16px;
}

.page-tabs-bar__left {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.page-tabs-bar__status {
  margin: 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
  font-weight: 500;
}

.page-tabs-bar__create-btn {
  display: inline-flex;
  height: 44px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 14px;
  background: #1d4ed8;
  padding: 0 20px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.page-tabs-bar__create-btn:hover {
  transform: translateY(-2px);
  background: #2563eb;
  box-shadow: 0 8px 20px rgba(29, 78, 216, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.page-tabs-bar__create-btn:active {
  transform: translateY(0);
  filter: brightness(0.95);
}

.page-tabs-bar__create-icon {
  width: 16px;
  height: 16px;
}

.page-tabs-bar__label {
  display: inline-flex;
  align-items: center;
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

  .page-tabs-bar__search {
    width: min(420px, 42vw);
    flex-direction: row;
    align-items: center;
  }

  .page-tabs-bar__footer {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    gap: 32px;
  }

  .page-tabs-bar__create-btn {
    margin-bottom: 2px; /* Visual alignment with search input */
  }
}
</style>
