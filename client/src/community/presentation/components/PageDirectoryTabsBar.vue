<!-- Description: Renders the light-theme page directory filters and search controls for community pages. -->
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

const search = defineModel<string>("search", { default: "" })

defineProps<{
  tabs: Array<{ label: string; value: CommunityPageTab; count: number; to: string }>
  activeTab: CommunityPageTab
  statusLabel: string
}>()

const searchInputUi = {
  base: "h-11 rounded-full px-4 text-[14px]",
}
</script>

<style scoped>
.page-tabs-bar {
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #ffffff;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.page-tabs-bar__row {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.page-tabs-bar__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.page-tabs-bar__tab {
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  padding: 8px 14px;
  color: #475569;
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.page-tabs-bar__tab:hover {
  background: #f8fafc;
  color: #0000ff;
}

.page-tabs-bar__tab--active {
  background: rgba(0, 0, 255, 0.07);
  color: #1d4ed8;
}

.page-tabs-bar__count {
  display: inline-flex;
  min-width: 24px;
  height: 22px;
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
  border: 1px solid #bfdbfe;
  border-radius: 999px;
  background: #eff6ff;
  color: #2563eb;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 700;
}

.page-tabs-bar__input :deep(input) {
  border: 1px solid #cbd5e1;
  background: #ffffff !important;
  color: #0f172a !important;
  box-shadow: none;
}

.page-tabs-bar__input :deep(input::placeholder) {
  color: #94a3b8 !important;
}

.page-tabs-bar__input :deep(svg) {
  color: #64748b !important;
}

@media (min-width: 768px) {
  .page-tabs-bar__row {
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
