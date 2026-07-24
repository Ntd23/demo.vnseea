<!-- English description: Renders movie catalog sorting tabs backed by the shared movie tab domain type. -->
<template>
  <div class="movie-tabs">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="movie-tabs__button"
      :class="{ 'movie-tabs__button--active': modelValue === tab.id }"
      @click="$emit('update:modelValue', tab.id)"
    >
      <Icon :name="tab.icon" class="movie-tabs__icon" />
      <span>{{ tab.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { MovieTabId } from "../../domain/types/movies.types"

interface Tab {
  id: MovieTabId
  label: string
  icon: string
}

defineProps<{
  modelValue: MovieTabId
  tabs: Tab[]
}>()

defineEmits<{
  "update:modelValue": [value: MovieTabId]
}>()
</script>

<style scoped>
.movie-tabs {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  overflow-x: scroll;
  scrollbar-width: thin;
  scrollbar-color: var(--text-tertiary) var(--bg-muted);
  padding-bottom: 12px; /* Bottom padding for scrollbar on mobile */
}

@media (min-width: 640px) {
  .movie-tabs {
    overflow-x: visible;
    padding-bottom: 0;
  }
}

.movie-tabs__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 36px;
  border-radius: var(--radius-full);
  padding: 8px 14px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  background: transparent;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  transition: color var(--duration-fast) var(--ease-default), background-color var(--duration-fast) var(--ease-default);
}

.movie-tabs__button:hover {
  color: var(--text-brand);
  background: var(--bg-surface-hover);
}

.movie-tabs__button--active {
  color: var(--text-brand) !important;
  background: var(--bg-surface-active) !important;
  font-weight: 700 !important;
}

.movie-tabs__icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
</style>

<style>
/* Global CSS block to style the webkit scrollbar for Movie Tabs */
.movie-tabs::-webkit-scrollbar {
  height: 6px !important;
  background-color: var(--bg-muted) !important;
  display: block !important;
}

.movie-tabs::-webkit-scrollbar-track {
  background-color: var(--bg-muted) !important;
  border-radius: 999px !important;
}

.movie-tabs::-webkit-scrollbar-thumb {
  background-color: var(--text-tertiary) !important;
  border-radius: 999px !important;
}

.movie-tabs::-webkit-scrollbar-thumb:hover {
  background-color: var(--text-secondary) !important;
}
</style>
