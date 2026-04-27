<template>
  <div class="mx-auto max-w-[1320px] space-y-8 pb-16 pt-8 px-4 sm:px-6">
    <SearchPresentationFiltersPanel
      v-model:keyword="searchText"
      v-model:type="selectedType"
      v-model:sort="selectedSort"
      :type-options="searchTypeOptions"
      :sort-options="searchSortOptions"
      :tabs="tabItems"
      :quick-keywords="quickKeywords"
      @submit="commitSearch"
      @quick-search="applyQuickKeyword"
    />

    <section
      v-if="hasKeyword"
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <article
        v-for="item in summaryCards"
        :key="item.label"
        class="surface-card p-6 border-secondary-100 flex flex-col justify-center"
      >
        <p class="text-micro font-bold uppercase tracking-[0.2em] text-[var(--text-primary)]">
          {{ item.label }}
        </p>
        <div class="mt-2 flex items-baseline gap-2">
          <p class="text-3xl font-black text-[var(--text-primary)] leading-none">
            {{ item.value }}
          </p>
          <span class="text-xs font-bold text-[var(--text-primary)]">results</span>
        </div>
        <p class="mt-3 text-xs font-medium text-[var(--text-primary)] leading-relaxed">
          {{ item.description }}
        </p>
      </article>
    </section>

    <section
      v-if="!hasKeyword"
      class="surface-card p-12 sm:p-20 border-secondary-100"
    >
      <div class="flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
        <div class="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary-50 text-3xl font-black text-[var(--text-primary)] border border-primary-100 shadow-sm mb-8">
          {{ idleMonogram }}
        </div>
        <h2 class="text-2xl font-black text-[var(--text-primary)] tracking-tight">
          {{ $t('community.search.emptyState.title') }}
        </h2>
        <p class="mt-3 text-body-secondary text-base leading-relaxed">
          {{ $t('community.search.emptyState.desc') }}
        </p>
      </div>
    </section>

    <section
      v-else-if="totalResults === 0"
      class="surface-card p-12 sm:p-20 border-secondary-100"
    >
      <div class="mx-auto max-w-2xl text-center">
        <FoundationEmptyState
          icon="i-ph-magnifying-glass-duotone"
          :title="$t('community.search.emptyValue.title')"
          :description="$t('community.search.emptyValue.desc', { keyword: searchText.trim() })"
        />

        <div class="mt-10 flex flex-wrap justify-center gap-3">
          <UButton
            color="primary"
            size="lg"
            class="rounded-full font-black px-8 shadow-lg shadow-primary-500/20"
            @click="clearFilters"
          >
            {{ $t('community.search.clearFilters') }}
          </UButton>

          <UButton
            v-for="item in quickKeywords.slice(0, 3)"
            :key="item"
            variant="soft"
            color="gray"
            size="lg"
            class="rounded-full px-6 font-bold"
            @click="applyQuickKeyword(item)"
          >
            {{ $t('community.search.tryKeyword', { keyword: item }) }}
          </UButton>
        </div>
      </div>
    </section>

    <div v-else class="space-y-8">
      <section class="surface-card p-6 sm:p-8 border-secondary-100/50">
        <div class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div class="space-y-1">
            <p class="text-micro font-bold uppercase tracking-widest text-[var(--text-primary)]">
              {{ $t('community.search.results.label') }}
            </p>
            <h2 class="text-2xl font-black text-[var(--text-primary)] leading-tight">
              {{ resultHeading }}
            </h2>
            <p class="text-body-secondary text-sm">
              {{ resultDescription }}
            </p>
          </div>

          <UButton
            v-if="selectedType !== 'all'"
            variant="soft"
            color="primary"
            size="md"
            class="rounded-full font-black px-6"
            @click="showAllResults"
          >
            {{ $t('community.search.results.showAllTypes') }}
          </UButton>
        </div>
      </section>

      <section
        v-for="section in visibleSections"
        :key="section.kind"
        class="space-y-6 surface-card p-6 sm:p-8 border-secondary-100/30"
      >
        <div class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-secondary-100/50 pb-6">
          <div class="space-y-1">
            <p class="text-label-primary text-[var(--text-primary)] uppercase tracking-widest text-xs font-black">
              {{ $t(`community.search.tabs.${section.kind}.label`) }}
            </p>
            <p class="text-body-secondary text-sm">
              {{ $t(`community.search.tabs.${section.kind}.desc`) }}
            </p>
          </div>

          <UButton
            v-if="selectedType === 'all' && section.items.length > section.visibleItems.length"
            variant="ghost"
            color="primary"
            size="sm"
            class="rounded-full font-black px-4"
            @click="selectOnlyType(section.kind)"
          >
            {{ $t('community.search.results.viewAllOfSpecific', { count: section.items.length }) }}
          </UButton>
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <SearchPresentationResultCard
            v-for="item in section.visibleItems"
            :key="item.id"
            :result="item"
          />
        </div>
      </section>
    </div>

    <footer class="surface-card p-6 sm:p-8 border-secondary-100/50">
      <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div class="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm font-bold text-[var(--text-primary)]">
          <span class="text-[var(--text-primary)]">© 2026 VNSEEA</span>
          <NuxtLink
            v-for="link in primaryFooterLinks"
            :key="link.label"
            :to="link.to || '/home'"
            class="transition hover:text-secondary-900"
          >
            {{ $t(link.label) }}
          </NuxtLink>
        </div>

        <UButton
          variant="ghost"
          color="gray"
          size="sm"
          class="rounded-full font-black text-[var(--text-primary)] hover:text-secondary-900"
        >
          <template #leading>
            <Icon name="i-ph-globe-hemisphere-west-fill" class="h-4 w-4" />
          </template>
          {{ $t('community.search.footer.language') }}
        </UButton>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useSearchPage } from "../../application/composables/useSearchPage"
import SearchPresentationFiltersPanel from "../components/FiltersPanel.vue"
import SearchPresentationResultCard from "../components/ResultCard.vue"

const {
  hasKeyword,
  idleMonogram,
  primaryFooterLinks,
  quickKeywords,
  resultDescription,
  resultHeading,
  searchSortOptions,
  searchText,
  searchTypeOptions,
  selectedSort,
  selectedType,
  summaryCards,
  tabItems,
  totalResults,
  visibleSections,
  applyQuickKeyword,
  clearFilters,
  commitSearch,
  selectOnlyType,
  showAllResults,
} = useSearchPage()
</script>
