<template>
  <div class="mx-auto max-w-[1440px] space-y-5 px-3 pb-16 sm:px-5 lg:px-6">
    <PopularHero
      :eyebrow="t('pages.popularPage.heroEyebrow')"
      :title="t('pages.popularPage.heroTitle')"
      :description="t('pages.popularPage.heroDescription')"
      :primary-label="t('pages.popularPage.primaryCta')"
      primary-to="/home"
      :secondary-label="t('pages.popularPage.secondaryCta')"
      secondary-to="/search"
      :stats="summaryCards"
    />

    <PopularFilters
      v-model:search="search"
      v-model:selected-category="selectedCategory"
      :categories="categories"
      :placeholder="t('pages.popularPage.searchPlaceholder')"
    />

    <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <section class="min-w-0 space-y-5">
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <NuxtLink
            v-for="item in quickLinks"
            :key="item.title"
            :to="item.to"
            class="group flex min-h-[112px] items-start gap-3 rounded-[18px] border border-[#dbe3f2] bg-white p-4 shadow-[0_8px_22px_rgba(15,35,110,0.04)] transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-[0_14px_30px_rgba(15,35,110,0.08)]"
          >
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] text-white shadow-[0_10px_18px_rgba(37,99,235,0.14)] transition-transform group-hover:scale-105" :style="{ background: item.accent }">
              <Icon :name="item.icon.includes('duotone') ? item.icon : item.icon.replace('-bold', '-duotone').replace('-fill', '-duotone')" class="h-5 w-5" />
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-[14px] font-extrabold leading-snug text-[var(--text-primary)] transition-colors group-hover:text-primary-700">{{ item.title }}</h3>
              <p class="mt-1 line-clamp-2 text-[12px] font-medium leading-5 text-slate-500">{{ item.description }}</p>
              <div class="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-primary-600">
                {{ t("pages.popularPage.openLink") }}
                <Icon name="i-ph-arrow-up-right-duotone" class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </NuxtLink>
        </div>

        <section class="overflow-hidden rounded-[24px] border border-[#dbe3f2] bg-white shadow-[0_12px_32px_rgba(15,35,110,0.06)]">
          <div class="flex flex-col gap-4 border-b border-secondary-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div class="space-y-1">
              <p class="text-[11px] font-extrabold uppercase text-slate-500">
                {{ t("pages.popularPage.resultEyebrow") }}
              </p>
              <h2 class="text-[22px] font-black leading-tight text-[var(--text-primary)] sm:text-[26px]">
                {{ resultHeading }}
              </h2>
              <p class="max-w-2xl text-[13px] font-medium leading-6 text-slate-500">
                {{ t("pages.popularPage.resultCount", { count: rankedPosts.length }) }}
              </p>
            </div>

            <button
              class="inline-flex h-10 items-center justify-center rounded-[14px] border border-secondary-200 bg-secondary-50 px-4 text-[12px] font-extrabold text-[var(--text-primary)] transition hover:border-primary-200 hover:bg-white hover:text-primary-700 active:scale-95"
              type="button"
              @click="resetFilters"
            >
              <Icon name="i-ph-arrow-counter-clockwise-duotone" class="mr-2 h-4 w-4 shrink-0" />
              {{ t("pages.popularPage.resetFilters") }}
            </button>
          </div>

          <div v-if="rankedPosts.length === 0" class="px-4 py-12">
            <FoundationEmptyState
              icon="i-ph-fire-duotone"
              :title="t('pages.popularPage.emptyTitle')"
              :description="t('pages.popularPage.emptyDescription')"
            />
          </div>

          <div v-else class="divide-y divide-secondary-100">
            <article v-for="(post, index) in rankedPosts" :key="post.id" class="space-y-3 bg-white px-3 py-4 sm:px-5 sm:py-5">
              <div class="grid gap-3 rounded-[18px] border border-secondary-100 bg-secondary-50/60 p-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
                <div
                  class="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-[16px] text-white shadow-lg"
                  :class="rankClass(index)"
                >
                  <span class="text-[10px] font-bold leading-none opacity-80">#</span>
                  <span class="text-[20px] font-black leading-none">{{ formatRank(index + 1) }}</span>
                </div>

                <div class="min-w-0 space-y-2">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="inline-flex h-7 items-center rounded-full bg-white px-3 text-[12px] font-extrabold text-[var(--text-primary)] ring-1 ring-secondary-100">
                      {{ categoryLabelMap[post.category] }}
                    </span>
                    <span class="inline-flex h-7 items-center rounded-full bg-orange-50 px-3 text-[12px] font-extrabold text-orange-700 ring-1 ring-orange-100">
                      {{ post.trendLabel }}
                    </span>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-white ring-1 ring-secondary-100">
                      <div class="h-full rounded-full bg-primary-600" :style="{ width: `${postScorePercent(post)}%` }" />
                    </div>
                    <div class="inline-flex items-center gap-1.5 text-[12px] font-black text-[var(--text-primary)]">
                      <Icon name="i-ph-chart-line-up-duotone" class="h-4 w-4 text-primary-600" />
                      {{ t("pages.popularPage.scoreCount", { count: formatPopularNumber(getPopularPostScore(post), locale.value) }) }}
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-2 sm:w-[178px]">
                  <div class="rounded-[14px] bg-white px-2.5 py-2 text-center ring-1 ring-secondary-100">
                    <Icon name="i-ph-thumbs-up-duotone" class="mx-auto h-4 w-4 text-primary-600" />
                    <p class="mt-1 text-[12px] font-black leading-none text-[var(--text-primary)]">{{ formatPopularNumber(post.stats.likes, locale.value) }}</p>
                  </div>
                  <div class="rounded-[14px] bg-white px-2.5 py-2 text-center ring-1 ring-secondary-100">
                    <Icon name="i-ph-chat-circle-text-duotone" class="mx-auto h-4 w-4 text-emerald-600" />
                    <p class="mt-1 text-[12px] font-black leading-none text-[var(--text-primary)]">{{ formatPopularNumber(post.stats.comments, locale.value) }}</p>
                  </div>
                  <div class="rounded-[14px] bg-white px-2.5 py-2 text-center ring-1 ring-secondary-100">
                    <Icon name="i-ph-share-network-duotone" class="mx-auto h-4 w-4 text-orange-600" />
                    <p class="mt-1 text-[12px] font-black leading-none text-[var(--text-primary)]">{{ formatPopularNumber(post.stats.shares, locale.value) }}</p>
                  </div>
                </div>
              </div>

              <FeedPostCard :post="post" />
            </article>
          </div>
        </section>
      </section>

      <PopularSidebar
        :hashtags="topHashtags"
        :hashtags-eyebrow="t('pages.popularPage.sidebarHashtagsEyebrow')"
        :hashtags-title="t('pages.popularPage.sidebarHashtagsTitle')"
        :creators="topCreators"
        :creators-eyebrow="t('pages.popularPage.sidebarCreatorsEyebrow')"
        :creators-title="t('pages.popularPage.sidebarCreatorsTitle')"
        :quick-links="quickLinks"
        :links-eyebrow="t('pages.popularPage.sidebarLinksEyebrow')"
        :links-title="t('pages.popularPage.sidebarLinksTitle')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePopularPage } from "../../application/composables/usePopularPage"
import FeedPostCard from "../../../feed/presentation/components/PostCard.vue"
import PopularFilters from "../components/Filters.vue"
import PopularHero from "../components/Hero.vue"
import PopularSidebar from "../components/Sidebar.vue"

const { t } = useI18n()

const {
  categories,
  categoryLabelMap,
  quickLinks,
  rankedPosts,
  resultHeading,
  search,
  selectedCategory,
  summaryCards,
  topCreators,
  topHashtags,
  formatPopularNumber,
  formatRank,
  getPopularPostScore,
  postScorePercent,
  rankClass,
  resetFilters,
  locale,
} = usePopularPage()
</script>
