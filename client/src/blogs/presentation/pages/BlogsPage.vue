<!-- English description: Renders the searchable and paginated blog directory. -->
<template>
  <div class="blogs-page mx-auto max-w-[1440px] space-y-5 pb-10 mt-2">
    <BlogsFilters
      v-model:search="search"
      v-model:selected-category="selectedCategory"
      v-model:sort-by="sortBy"
      v-model:mine-only="mineOnly"
      :categories="categoryOptions"
      :sort-options="sortOptions"
      :article-count="filteredArticles.length"
    />

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)]">
      <section class="space-y-4">
        <BlogsFeaturedArticle
          v-if="featuredArticle && currentPage === 1"
          :article="featuredArticle"
          :format-compact="formatCompact"
        />

        <div v-if="visibleArticles.length > 0" class="grid gap-4 sm:grid-cols-2">
          <BlogsBlogArticleCard
            v-for="article in visibleArticles"
            :key="article.id"
            :article="article"
            :format-compact="formatCompact"
          />
        </div>

        <BlogsEmptyState v-else-if="!featuredArticle" @reset="resetFilters" />

        <BlogsPagination
          v-if="filteredArticles.length > pageSize"
          v-model:current-page="currentPage"
          :total-pages="totalPages"
          :pages="visiblePageNumbers"
        />
      </section>

      <!-- <BlogsSidebar
        :trending-topics="trendingTopics"
        :featured-authors="featuredAuthors"
        @select-category="selectCategory"
      /> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import BlogsBlogArticleCard from "../components/BlogArticleCard.vue"
import BlogsEmptyState from "../components/BlogsEmptyState.vue"
import BlogsFeaturedArticle from "../components/BlogsFeaturedArticle.vue"
import BlogsFilters from "../components/BlogsFilters.vue"
import BlogsHero from "../components/BlogsHero.vue"
import BlogsPagination from "../components/BlogsPagination.vue"
import BlogsResultsHeader from "../components/BlogsResultsHeader.vue"
import BlogsSidebar from "../components/BlogsSidebar.vue"
import { useBlogsPageVM } from "../../application/view-models/useBlogsPageVM"

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
  featuredArticle,
  visibleArticles,
  visiblePageNumbers,
  trendingTopics,
  featuredAuthors,
  formatCompact,
  resetFilters,
  selectCategory,
} = useBlogsPageVM()
</script>

<style scoped>
.blogs-page {
  --blogs-card-border: var(--border-light);
  --blogs-soft-bg: var(--bg-muted);
}
</style>
