<template>
  <div class="mx-auto max-w-[1440px] space-y-5 px-3 pb-10 sm:px-5 lg:px-6">
    <BlogsPresentationHero
      :article-count="articles.length"
      :mine-only="mineOnly"
      :stats="heroStats"
      @toggle-mine="mineOnly = !mineOnly"
    />

    <BlogsPresentationFilters
      v-model:search="search"
      v-model:selected-category="selectedCategory"
      v-model:sort-by="sortBy"
      v-model:mine-only="mineOnly"
      :categories="categoryOptions"
      :sort-options="sortOptions"
      :article-count="filteredArticles.length"
    />

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
      <section class="space-y-4">
        <BlogsPresentationResultsHeader
          :heading="resultHeading"
          :count="filteredArticles.length"
          :sort-label="currentSortLabel"
          @reset="resetFilters"
        />

        <div v-if="pageArticles.length > 0" class="grid gap-4 md:grid-cols-2">
          <BlogsPresentationArticleCard
            v-for="article in pageArticles"
            :key="article.id"
            :article="article"
            :format-compact="formatCompact"
          />
        </div>

        <BlogsPresentationEmptyState v-else @reset="resetFilters" />

        <BlogsPresentationPagination
          v-if="filteredArticles.length > pageSize"
          v-model:current-page="currentPage"
          :total-pages="totalPages"
          :pages="visiblePageNumbers"
        />
      </section>

      <BlogsPresentationSidebar
        :trending-topics="trendingTopics"
        :featured-authors="featuredAuthors"
        @select-category="selectCategory"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBlogsPage } from "../../application/composables/useBlogsPage"
import BlogsPresentationArticleCard from "../components/BlogArticleCard.vue"
import BlogsPresentationEmptyState from "../components/BlogsEmptyState.vue"
import BlogsPresentationFilters from "../components/BlogsFilters.vue"
import BlogsPresentationHero from "../components/BlogsHero.vue"
import BlogsPresentationPagination from "../components/BlogsPagination.vue"
import BlogsPresentationResultsHeader from "../components/BlogsResultsHeader.vue"
import BlogsPresentationSidebar from "../components/BlogsSidebar.vue"

const {
  articles,
  search,
  selectedCategory,
  sortBy,
  currentPage,
  mineOnly,
  pageSize,
  categoryOptions,
  sortOptions,
  heroStats,
  currentSortLabel,
  resultHeading,
  filteredArticles,
  totalPages,
  pageArticles,
  visiblePageNumbers,
  trendingTopics,
  featuredAuthors,
  formatCompact,
  resetFilters,
  selectCategory,
} = useBlogsPage()
</script>
