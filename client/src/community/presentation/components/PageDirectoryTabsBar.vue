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
          class="rounded-full"
          @click="search = ''"
        >
          {{ $t("community.pagesDirectory.clearSearch") }}
        </UButton>
      </div>
    </div>

    <div class="page-tabs-bar__footer">
      <p class="page-tabs-bar__status">
        {{ statusLabel }}
      </p>

      <span class="page-tabs-bar__label">
        {{ $t("community.pagesDirectory.searchLabel") }}
      </span>
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
  gap: 10px;
  margin-top: 14px;
  border-top: 1px solid #f1f5f9;
  padding-top: 14px;
}

.page-tabs-bar__status {
  margin: 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
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
    align-items: center;
    justify-content: space-between;
  }
}
</style>
