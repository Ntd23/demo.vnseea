<template>
  <aside class="read-blog-sidebar">
    <section class="read-blog-sidebar__card read-blog-sidebar__search-card" aria-labelledby="read-blog-search-title">
      <div class="read-blog-sidebar__search-heading">
        <div>
          <h2 id="read-blog-search-title">{{ $t("pages.readBlogPage.searchArticles") }}</h2>
        </div>
      </div>
      <form class="read-blog-sidebar__search" role="search" @submit.prevent="openBlogsSearch">
        <Icon name="i-ph-magnifying-glass" class="read-blog-sidebar__search-icon" />
        <input
          v-model="search"
          type="search"
          :placeholder="$t('pages.readBlogPage.searchPlaceholder')"
          :aria-label="$t('pages.readBlogPage.searchArticles')"
        >
        <button
          type="submit"
          :disabled="!search.trim()"
          :aria-label="$t('pages.readBlogPage.viewSearchResults')"
        >
          <Icon name="i-ph-arrow-right-bold" class="h-3.5 w-3.5" />
        </button>
      </form>
    </section>

    <section class="read-blog-sidebar__card" aria-labelledby="read-blog-popular-title">
      <div class="read-blog-sidebar__header">
        <span class="read-blog-sidebar__header-icon">
          <Icon name="i-ph-fire-fill" />
        </span>
        <h2 id="read-blog-popular-title" class="read-blog-sidebar__title">
          {{ $t("pages.readBlogPage.popularArticles") }}
        </h2>
      </div>

      <div v-if="popularArticles.length > 0" class="read-blog-sidebar__related-list" role="list">
        <NuxtLink
          v-for="item in popularArticles"
          :key="item.slug"
          :to="appRoutes.readBlog(item.slug)"
          class="read-blog-sidebar__related"
          role="listitem"
        >
          <span class="read-blog-sidebar__thumb">
            <span class="read-blog-sidebar__thumb-fallback" :style="{ background: item.imageFallback ?? 'linear-gradient(135deg,#1e3a8a,#38bdf8)' }" />
            <NuxtImg
              v-if="item.image"
              :src="item.image"
              :alt="item.title"
              class="read-blog-sidebar__thumb-image"
              width="180"
              height="120"
              sizes="90px"
              loading="lazy"
            />
          </span>

          <span class="read-blog-sidebar__related-copy">
            <span class="read-blog-sidebar__related-category">{{ item.categoryLabel }}</span>
            <span class="read-blog-sidebar__related-title">{{ item.title }}</span>
            <span class="read-blog-sidebar__related-meta">
              <Icon name="i-ph-eye-fill" />
              {{ formatCompact(item.views) }}
              <span class="read-blog-sidebar__related-author">{{ item.author }}</span>
            </span>
          </span>
        </NuxtLink>
      </div>
      <p v-else class="read-blog-sidebar__empty">
        {{ $t("pages.readBlogPage.noPopularArticles") }}
      </p>
    </section>

    <section class="read-blog-sidebar__card" aria-labelledby="read-blog-categories-title">
      <div class="read-blog-sidebar__header">
        <span class="read-blog-sidebar__header-icon"><Icon name="i-ph-squares-four-fill" /></span>
        <h2 id="read-blog-categories-title" class="read-blog-sidebar__title">
          {{ $t("pages.readBlogPage.categories") }}
        </h2>
      </div>
      <div class="read-blog-sidebar__categories">
        <button
          v-for="category in categories"
          :key="category.value"
          class="read-blog-sidebar__category-filter"
          type="button"
          @click="openBlogCategory(category.value)"
        >
          <Icon :name="category.icon" class="read-blog-sidebar__category-icon" />
          <span>{{ category.label }}</span>
        </button>
      </div>
    </section>
  </aside>
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"

const props = defineProps<{
  article: {
    author: string
    authorAvatarUrl: string
    categoryLabel: string
  }
  popularArticles: ReadonlyArray<{
    slug: string
    category: string
    categoryLabel: string
    title: string
    views: number
    author: string
    image?: string
    imageFallback?: string
  }>
}>()

const search = ref("")
const { t, locale } = useI18n()
const numberFormatter = computed(() => new Intl.NumberFormat(locale.value === "vi" ? "vi-VN" : "en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
}))

const formatCompact = (value: number) => numberFormatter.value.format(value)

const categories = computed(() => {
  const values = [
    ["all", t("pages.blogsPage.categoryAll"), "i-ph-squares-four-fill"], ["vehicles", t("pages.blogsPage.categoryVehicles"), "i-ph-car-profile"],
    ["business", t("pages.blogsPage.categoryBusiness"), "i-ph-trend-up"], ["education", t("pages.blogsPage.categoryEducation"), "i-ph-graduation-cap"],
    ["movies", t("pages.blogsPage.categoryMovies"), "i-ph-film-slate"], ["gaming", t("pages.blogsPage.categoryGaming"), "i-ph-game-controller"],
    ["history", t("pages.blogsPage.categoryHistory"), "i-ph-landmark"], ["lifestyle", t("pages.blogsPage.categoryLifestyle"), "i-ph-house-line"],
    ["pets", t("pages.blogsPage.categoryPets"), "i-ph-paw-print"], ["science", t("pages.blogsPage.categoryScience"), "i-ph-microscope"],
    ["sports", t("pages.blogsPage.categorySports"), "i-ph-soccer-ball"], ["travel", t("pages.blogsPage.categoryTravel"), "i-ph-airplane-tilt"],
    ["people", t("pages.blogsPage.categoryPeople"), "i-ph-globe-hemisphere-east"], ["other", t("pages.blogsPage.categoryOther"), "i-ph-dots-three-circle"],
  ] as const

  return values.map(([value, label, icon]) => ({
    value,
    label,
    icon,
  }))
})

const blogsQuery = (category?: string) => ({
  ...(search.value.trim() ? { search: search.value.trim() } : {}),
  ...(category && category !== "all" ? { category } : {}),
})

const openBlogsSearch = () => navigateTo({
  path: appRoutes.blogs,
  query: blogsQuery(),
})

const openBlogCategory = (category: string) => navigateTo({
  path: appRoutes.blogs,
  query: blogsQuery(category),
})
</script>

<style scoped>
.read-blog-sidebar {
  display: grid;
  min-width: 0;
  gap: 16px;
}

.read-blog-sidebar__card {
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.read-blog-sidebar__author-band {
  height: 62px;
  background: linear-gradient(180deg, #2233ff 0%, #0000ff 100%);
}

.read-blog-sidebar__author-body {
  padding: 0 16px 16px;
}

.read-blog-sidebar__avatar {
  display: flex;
  overflow: hidden;
  height: 58px;
  width: 58px;
  align-items: center;
  justify-content: center;
  margin-top: -29px;
  border: 4px solid #ffffff;
  border-radius: 50%;
  background: #f1f5f9;
  color: #64748b;
}

.read-blog-sidebar__avatar-image {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.read-blog-sidebar__eyebrow {
  margin: 12px 0 0;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.read-blog-sidebar__author-name {
  margin: 3px 0 0;
  color: #0f172a;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: 0;
}

.read-blog-sidebar__category {
  display: inline-flex;
  margin-top: 8px;
  border-radius: 999px;
  background: rgba(0, 0, 255, 0.06);
  color: #0000ff;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 10px;
}

.read-blog-sidebar__description {
  margin: 12px 0 0;
  color: #475569;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.65;
}

.read-blog-sidebar__header {
  display: flex;
  align-items: center;
  gap: 9px;
  border-bottom: 1px solid #f1f5f9;
  padding: 14px 16px;
}

.read-blog-sidebar__header-icon {
  display: flex;
  height: 32px;
  width: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #f1f5f9;
  color: #475569;
}

.read-blog-sidebar__title {
  margin: 0;
  color: #0f172a;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0;
}

.read-blog-sidebar__search {
  position: relative;
  margin-top: 14px;
}

.read-blog-sidebar__search-card {
  padding: 16px;
  background: #ffffff;
}

.read-blog-sidebar__search-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.read-blog-sidebar__search-heading h2 {
  margin: 0;
  color: #0f172a;
  font-size: 16px;
  font-weight: 850;
  letter-spacing: -0.01em;
}

.read-blog-sidebar__search-icon {
  position: absolute;
  z-index: 1;
  left: 14px;
  top: 50%;
  height: 17px;
  width: 17px;
  color: #64748b;
  pointer-events: none;
  transform: translateY(-50%);
}

.read-blog-sidebar__search input {
  width: 100%;
  min-height: 44px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.94);
  color: #0f172a;
  outline: none;
  padding: 11px 42px;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.2;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.read-blog-sidebar__search input::placeholder {
  color: #94a3b8;
}

.read-blog-sidebar__search input::-webkit-search-cancel-button {
  display: none;
}

.read-blog-sidebar__search input:focus {
  border-color: rgba(0, 0, 255, 0.28);
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(0, 0, 255, 0.07), 0 10px 24px rgba(15, 23, 42, 0.08);
}

.read-blog-sidebar__search button {
  position: absolute;
  right: 9px;
  top: 50%;
  display: flex;
  height: 27px;
  width: 27px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 8px;
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
  transform: translateY(-50%);
}

.read-blog-sidebar__search button:hover {
  background: rgba(0, 0, 255, 0.07);
  color: #0000ff;
}

.read-blog-sidebar__search button:not(:disabled) {
  background: #0000ff;
  color: #ffffff;
}

.read-blog-sidebar__search button:disabled {
  cursor: default;
  opacity: 0.55;
}

.read-blog-sidebar__related-list {
  display: grid;
}

.read-blog-sidebar__empty {
  margin: 0;
  padding: 16px;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
}

.read-blog-sidebar__categories {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
  padding: 12px;
}

.read-blog-sidebar__category-filter {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  color: #334155;
  gap: 5px;
  min-height: 66px;
  padding: 8px 5px;
  font-size: 10px;
  font-weight: 750;
  cursor: pointer;
  text-align: center;
  transition: all 0.15s ease;
}

.read-blog-sidebar__category-icon {
  height: 17px;
  width: 17px;
}

.read-blog-sidebar__category-filter:hover {
  border-color: rgba(0, 0, 255, 0.18);
  background: rgba(0, 0, 255, 0.06);
  color: #0000ff;
}

.read-blog-sidebar__related {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr);
  gap: 10px;
  border-top: 1px solid #f1f5f9;
  padding: 12px 14px;
  color: inherit;
  text-decoration: none;
  transition: background 0.15s ease;
}

.read-blog-sidebar__related:first-child {
  border-top: 0;
}

.read-blog-sidebar__related:hover {
  background: rgba(0, 0, 255, 0.03);
}

.read-blog-sidebar__thumb {
  position: relative;
  display: block;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: 12px;
  background: #f1f5f9;
}

.read-blog-sidebar__thumb-fallback,
.read-blog-sidebar__thumb-image {
  position: absolute;
  inset: 0;
  height: 100%;
  width: 100%;
}

.read-blog-sidebar__thumb-image {
  object-fit: cover;
}

.read-blog-sidebar__related-copy {
  min-width: 0;
}

.read-blog-sidebar__related-category {
  display: inline-flex;
  max-width: 100%;
  overflow: hidden;
  border-radius: 999px;
  background: #f8fafc;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.read-blog-sidebar__related-title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  margin-top: 6px;
  color: #0f172a;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.4;
}

.read-blog-sidebar__related-meta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
}

.read-blog-sidebar__related-meta :deep(svg) {
  height: 13px;
  width: 13px;
}

.read-blog-sidebar__related-author {
  display: inline-block;
  max-width: 110px;
  overflow: hidden;
  margin-left: 3px;
  color: #64748b;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.read-blog-sidebar__related-author::before {
  content: "\2022";
  margin-right: 6px;
  color: #cbd5e1;
}

</style>
