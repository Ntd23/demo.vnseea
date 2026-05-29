<!-- English description: Full-screen map-first nearby search page for users and pages. -->

<template>
  <section class="nearby-map-page">
    <ClientOnly>
      <NearbySearchMap
        class="nearby-map-page__map"
        :origin="origin"
        :items="items"
        :selected-item-id="selectedItemId"
        :origin-focus-key="originFocusKey"
        :route-target-item="routeTargetItem"
        @select="selectItem"
        @route-error="handleRouteError"
      />
      <template #fallback>
        <div class="nearby-map-page__fallback" />
      </template>
    </ClientOnly>

    <div class="nearby-map-page__topbar">
      <div class="nearby-map-page__search">
        <USelectMenu
          :model-value="selectedSuggestionOption"
          v-model:search-term="searchText"
          :items="suggestionOptions"
          :loading="suggestionsLoading"
          :search-input="searchInput"
          :placeholder="searchPlaceholder"
          :reset-search-term-on-blur="false"
          :reset-search-term-on-select="false"
          :content="{ sideOffset: 8 }"
          by="id"
          ignore-filter
          icon="i-ph-magnifying-glass-duotone"
          class="w-full min-w-0"
          :ui="suggestSelectUi"
          @update:model-value="handleSuggestionSelect"
          @update:open="handleSuggestionOpen"
        >
          <template #item="{ item }">
            <div class="nearby-map-page__suggestion">
              <span class="nearby-map-page__suggestion-avatar">
                <img v-if="item.raw?.avatarUrl" :src="item.raw.avatarUrl" :alt="item.label">
                <Icon v-else :name="item.raw?.type === 'page' ? 'i-ph-flag-fill' : 'i-ph-user-circle-fill'" />
              </span>
              <span class="nearby-map-page__suggestion-copy">
                <span class="nearby-map-page__suggestion-title">{{ item.label }}</span>
                <span class="nearby-map-page__suggestion-meta">
                  {{ item.raw?.type === "page" ? "Trang" : "Người dùng" }} · {{ item.distanceLabel }}
                </span>
              </span>
            </div>
          </template>
          <template #empty>
            <span class="nearby-map-page__suggestion-empty">{{ suggestionEmptyText }}</span>
          </template>
        </USelectMenu>
      </div>

      <button class="nearby-map-page__location-button" type="button" @click="focusOrigin">
        <Icon name="i-ph-crosshair-fill" />
        <span>Vị trí của tôi</span>
      </button>
    </div>

    <div class="nearby-map-page__bottom">
      <div class="nearby-map-page__panel">
        <div class="nearby-map-page__filters">
          <div class="nearby-map-page__tabs" role="tablist" aria-label="Nearby result type">
            <button
              v-for="tab in tabs"
              :key="tab.value"
              class="nearby-map-page__tab"
              :class="{ 'nearby-map-page__tab--active': selectedType === tab.value }"
              type="button"
              @click="selectType(tab.value)"
            >
              <Icon :name="tab.icon" />
              <span>{{ tab.label }}</span>
            </button>
          </div>

          <label class="nearby-map-page__distance">
            <span>{{ distanceKm }} km</span>
            <input v-model.number="distanceKm" type="range" min="1" max="1000" step="1">
          </label>

          <span class="nearby-map-page__count">{{ resultCountLabel }}</span>
        </div>

        <div v-if="routeErrorMessage" class="nearby-map-page__route-error">
          <Icon name="i-ph-warning-circle-duotone" />
          <span>{{ routeErrorMessage }}</span>
          <button type="button" @click="clearRoute">Ẩn</button>
        </div>

        <div v-if="displayLoading" class="nearby-map-page__state">
          <Icon name="i-ph-spinner-gap-duotone" class="nearby-map-page__spin" />
          <span>Đang tải kết quả gần bạn...</span>
        </div>

        <div v-else-if="errorMessage" class="nearby-map-page__state nearby-map-page__state--error">
          <Icon name="i-ph-warning-circle-duotone" />
          <span>{{ errorMessage }}</span>
          <button type="button" @click="refresh">Thử lại</button>
        </div>

        <div v-else-if="!hasResults" class="nearby-map-page__empty">
          <Icon name="i-ph-map-pin-duotone" />
          <div>
            <h2>{{ emptyTitle }}</h2>
            <p>{{ emptyDescription }}</p>
          </div>
          <NuxtLink v-if="needsLocation" :to="appRoutes.settingsPage('profile')" class="nearby-map-page__empty-action">
            Cập nhật địa chỉ
          </NuxtLink>
          <button v-else type="button" class="nearby-map-page__empty-action" @click="clearSearch">
            Xóa bộ lọc
          </button>
        </div>

        <div v-else class="nearby-map-page__cards" aria-label="Nearby results">
          <NearbyResultCard
            v-for="item in items"
            :key="item.id"
            :item="item"
            :active="selectedItemId === item.id || (!selectedItemId && item.id === items[0]?.id)"
            @select="selectItem"
            @directions="requestDirections"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import NearbyResultCard from "../components/NearbyResultCard.vue"
import NearbySearchMap from "../components/NearbySearchMap.vue"
import { useSearchNearbyPageVM } from "../../application/view-models/useSearchNearbyPageVM"
import type { NearbySearchItem } from "../../domain/types/search-nearby.types"

type NearbySuggestionOption = {
  id: string
  label: string
  raw: NearbySearchItem
  distanceLabel: string
}

const {
  appRoutes,
  searchText,
  selectedType,
  distanceKm,
  selectedItemId,
  selectedSuggestionItem,
  routeTargetItem,
  routeErrorMessage,
  originFocusKey,
  tabs,
  origin,
  items,
  suggestions,
  suggestionsLoading,
  displayLoading,
  errorMessage,
  needsLocation,
  hasResults,
  emptyTitle,
  emptyDescription,
  resultCountLabel,
  refresh,
  refreshSuggestions,
  selectType,
  selectItem,
  selectSuggestion,
  requestDirections,
  clearRoute,
  handleRouteError,
  focusOrigin,
  clearSearch,
} = useSearchNearbyPageVM()

const searchPlaceholder = "Từ khóa / address / users / pages..."

const suggestSelectUi = {
  base: "h-[58px] w-full min-w-0 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[color-mix(in_srgb,var(--bg-surface)_94%,transparent)] px-4 text-[var(--text-primary)] shadow-[var(--shadow-lg)]",
  leading: "shrink-0 text-[var(--text-secondary)]",
  value: "min-w-0 truncate text-[var(--text-primary)] text-[var(--text-body)] font-[var(--weight-extrabold)]",
  input: "min-w-0 text-[var(--text-primary)] text-[var(--text-body)] font-[var(--weight-extrabold)] placeholder:text-[var(--text-secondary)]",
  item: "rounded-[var(--radius-md)]",
  itemLabel: "min-w-0 truncate",
}

const searchInput = computed(() => ({
  placeholder: searchPlaceholder,
  icon: "i-ph-magnifying-glass-duotone",
  loading: suggestionsLoading.value,
}))

const suggestionOptions = computed<NearbySuggestionOption[]>(() =>
  suggestions.value.map(item => ({
    id: item.id,
    label: item.title,
    raw: item,
    distanceLabel: formatDistance(item.distanceMeters),
  })),
)

const selectedSuggestionOption = computed(() => {
  if (!selectedSuggestionItem.value) {
    return null
  }

  const item = selectedSuggestionItem.value

  return {
    id: item.id,
    label: item.title,
    raw: item,
    distanceLabel: formatDistance(item.distanceMeters),
  }
})

const suggestionEmptyText = computed(() => {
  if (suggestionsLoading.value) return "Đang tìm gợi ý..."
  if (searchText.value.trim().length < 3) return "Nhập tối thiểu 3 ký tự."

  return "Không có user/page gần bạn."
})

function formatDistance(meters: number | null) {
  if (meters === null) return "-- km"
  if (meters < 1000) return `${meters} m`

  return `${(meters / 1000).toFixed(meters < 10000 ? 1 : 0)} km`
}

function handleSuggestionSelect(option: NearbySuggestionOption | null) {
  if (!option) {
    return
  }

  selectSuggestion(option.raw)
}

function handleSuggestionOpen(open: boolean) {
  if (open) {
    void refreshSuggestions()
  }
}
</script>

<style scoped>
.nearby-map-page {
  position: relative;
  min-height: calc(100dvh - 64px);
  overflow: hidden;
  background: var(--color-secondary-200);
}

.nearby-map-page__map,
.nearby-map-page__fallback {
  position: absolute;
  inset: 0;
}

.nearby-map-page__fallback {
  background:
    linear-gradient(color-mix(in srgb, var(--color-secondary-400) 18%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--color-secondary-400) 18%, transparent) 1px, transparent 1px),
    var(--bg-base);
  background-size: 44px 44px;
}

.nearby-map-page__topbar {
  position: absolute;
  left: 50%;
  top: 18px;
  z-index: 8;
  display: flex;
  width: min(100% - 32px, 720px);
  transform: translateX(-50%);
  gap: 12px;
}

.nearby-map-page__search {
  min-width: 0;
  flex: 1;
}

.nearby-map-page__search :deep([data-slot="base"]) {
  width: 100%;
  min-width: 0;
}

.nearby-map-page__suggestion {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 2px 0;
}

.nearby-map-page__suggestion-avatar {
  display: inline-flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 999px;
  background: var(--bg-surface-active);
  color: var(--text-link);
}

.nearby-map-page__suggestion-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nearby-map-page__suggestion-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.nearby-map-page__suggestion-title,
.nearby-map-page__suggestion-meta {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nearby-map-page__suggestion-title {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: var(--weight-extrabold);
}

.nearby-map-page__suggestion-meta {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: var(--weight-semibold);
}

.nearby-map-page__suggestion-empty {
  display: inline-flex;
  padding: 8px 10px;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: var(--weight-semibold);
}

.nearby-map-page__location-button {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--bg-surface) 94%, transparent);
  box-shadow: var(--shadow-lg);
  color: var(--text-link);
  cursor: pointer;
  font-size: var(--text-body);
  font-weight: var(--weight-extrabold);
  padding: 0 20px;
}

.nearby-map-page__bottom {
  position: absolute;
  bottom: 20px;
  left: 50%;
  z-index: 8;
  width: min(100% - 32px, 1320px);
  transform: translateX(-50%);
}

.nearby-map-page__panel {
  overflow: hidden;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  background: color-mix(in srgb, var(--bg-muted) 88%, transparent);
  box-shadow: var(--shadow-xl);
  padding: 18px;
}

.nearby-map-page__filters {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(180px, 260px) auto;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.nearby-map-page__tabs {
  display: flex;
  min-width: 0;
  gap: 8px;
  overflow-x: auto;
}

.nearby-map-page__tab,
.nearby-map-page__count,
.nearby-map-page__distance {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--bg-surface) 90%, transparent);
  color: var(--color-secondary-600);
  font-size: var(--text-caption);
  font-weight: var(--weight-extrabold);
}

.nearby-map-page__tab {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  padding: 9px 12px;
  white-space: nowrap;
}

.nearby-map-page__tab--active {
  border-color: var(--border-strong);
  background: var(--bg-surface-active);
  color: var(--text-link);
}

.nearby-map-page__distance {
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
}

.nearby-map-page__distance input {
  min-width: 0;
  accent-color: var(--bg-brand);
}

.nearby-map-page__count {
  padding: 10px 14px;
  white-space: nowrap;
}

.nearby-map-page__cards {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding: 2px;
  scroll-snap-type: x proximity;
}

.nearby-map-page__cards > * {
  flex: 0 0 min(100%, 560px);
  scroll-snap-align: center;
}

.nearby-map-page__state,
.nearby-map-page__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 130px;
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--bg-surface) 86%, transparent);
  color: var(--color-secondary-600);
  font-size: var(--text-body);
  font-weight: var(--weight-extrabold);
  padding: 18px;
  text-align: center;
}

.nearby-map-page__route-error {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  border: 1px solid color-mix(in srgb, var(--text-danger) 22%, transparent);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--bg-surface) 92%, transparent);
  color: var(--text-danger);
  font-size: 13px;
  font-weight: var(--weight-bold);
  padding: 10px 12px;
}

.nearby-map-page__route-error button {
  margin-left: auto;
  border: 0;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--text-danger) 8%, transparent);
  color: var(--text-danger);
  cursor: pointer;
  font-size: 12px;
  font-weight: var(--weight-extrabold);
  padding: 6px 10px;
}

.nearby-map-page__state--error {
  color: var(--text-danger);
}

.nearby-map-page__state button,
.nearby-map-page__empty-action {
  border: 0;
  border-radius: var(--radius-full);
  background: var(--bg-brand);
  color: var(--text-inverse);
  cursor: pointer;
  font-size: 13px;
  font-weight: var(--weight-extrabold);
  padding: 10px 14px;
  text-decoration: none;
}

.nearby-map-page__empty h2 {
  color: var(--text-primary);
  font-size: 16px;
  font-weight: var(--weight-extrabold);
}

.nearby-map-page__empty p {
  margin-top: 4px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: var(--weight-semibold);
}

.nearby-map-page__spin {
  animation: nearby-spin 1s linear infinite;
}

@keyframes nearby-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 760px) {
  .nearby-map-page {
    min-height: calc(100dvh - 58px);
  }

  .nearby-map-page__topbar {
    top: 12px;
    flex-direction: column;
    width: calc(100% - 20px);
    gap: 8px;
  }

  .nearby-map-page__location-button {
    min-height: 44px;
  }

  .nearby-map-page__bottom {
    bottom: 10px;
    width: calc(100% - 16px);
  }

  .nearby-map-page__panel {
    border-radius: 22px;
    padding: 12px;
  }

  .nearby-map-page__filters {
    grid-template-columns: 1fr;
  }

  .nearby-map-page__distance {
    grid-template-columns: 54px minmax(0, 1fr);
  }

  .nearby-map-page__count {
    justify-self: start;
  }
}
</style>
