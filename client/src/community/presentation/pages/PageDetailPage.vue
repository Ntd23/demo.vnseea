<!-- Description: Renders the page-directory style community surface with a profile-like hero, tab nav, feed, and side cards. -->
<template>
  <div v-if="page" class="page-detail">
    <div class="page-detail__hero">
      <div class="page-detail__cover">
        <div class="page-detail__cover-backdrop" :style="{ background: page.banner }" />
        <div class="page-detail__cover-shade" />
        <div class="page-detail__cover-actions">
          <UButton
            color="neutral"
            variant="solid"
            size="xs"
            class="rounded-full bg-white/90 text-slate-800 backdrop-blur-sm"
            @click="handleSharePage"
          >
            <Icon name="i-ph-paper-plane-tilt-bold" class="mr-1.5 h-4 w-4" />
            {{ t('pages.pageDetailPage.shareButton') }}
          </UButton>
          <UButton
            color="neutral"
            variant="solid"
            size="xs"
            class="rounded-full bg-white/90 text-slate-800 backdrop-blur-sm"
            @click="handleFollowPage"
          >
            <Icon name="i-ph-bell-simple-ringing-bold" class="mr-1.5 h-4 w-4" />
            {{ isFollowing ? t('pages.pageDetailPage.followingButton') : translateText(page.ctaLabel, t('pages.pageDetailPage.followFallback')) }}
          </UButton>
        </div>
      </div>

      <div class="page-detail__identity">
        <div class="page-detail__avatar-wrap">
          <div class="page-detail__avatar" :style="{ background: page.banner }">
            {{ avatarLabel }}
          </div>
        </div>
        <div class="page-detail__meta">
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="page-detail__title">{{ pageName }}</h1>
            <UBadge v-if="page.canManage" color="primary" variant="soft" class="rounded-full px-2.5 py-0.5 text-xs font-bold">Owner</UBadge>
          </div>
          <p class="page-detail__summary">{{ pageSummary }}</p>
          <div class="page-detail__stats">
            <span>{{ followerCountLabel }}</span>
            <span class="text-slate-300">•</span>
            <span>{{ likeCountLabel }}</span>
            <template v-if="locationLabel">
              <span class="text-slate-300">•</span>
              <span>{{ locationLabel }}</span>
            </template>
          </div>
        </div>
      </div>

      <div class="page-detail__tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="page-detail__tab"
          :class="{ 'page-detail__tab--active': activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div class="page-detail__body">
      <section class="page-detail__main">
        <template v-if="activeTab === 'posts'">
          <div class="space-y-3">
            <FeedPostCard v-for="post in pagePosts" :key="post.id" :post="post" />
          </div>
        </template>
        <template v-else>
          <section class="page-detail__card">
            <h2 class="page-detail__card-title">{{ categoryLabel }}</h2>
            <p class="page-detail__card-text">{{ pageSummary }}</p>
          </section>
          <section class="page-detail__card">
            <h2 class="page-detail__card-title">{{ t('pages.pageDetailPage.aboutTitle') }}</h2>
            <div class="space-y-2 text-sm text-slate-600">
              <p>{{ followerCountLabel }}</p>
              <p>{{ likeCountLabel }}</p>
              <p v-if="responseLabel">{{ responseLabel }}</p>
              <p v-if="foundedLabel">{{ foundedLabel }}</p>
            </div>
          </section>
        </template>
      </section>

      <aside class="page-detail__sidebar">
        <section class="page-detail__card">
          <h2 class="page-detail__card-title">{{ t('pages.pageDetailPage.aboutTitle') }}</h2>
          <p class="page-detail__card-text">{{ pageSummary }}</p>
        </section>

        <section class="page-detail__card">
          <h2 class="page-detail__card-title">{{ t('pages.pageDetailPage.followingButton') }}</h2>
          <div class="grid grid-cols-3 gap-2">
            <NuxtLink v-for="item in pageConnections" :key="item.slug" :to="`/p/${item.slug}`" class="rounded-[14px] bg-[#f6f8ff] p-2 text-center text-[12px] font-semibold text-slate-700">
              {{ item.name }}
            </NuxtLink>
          </div>
        </section>
      </aside>
    </div>
  </div>

  <div v-else class="mx-auto max-w-[960px] pb-10 pt-4">
    <section class="rounded-[30px] border border-[#dbe3f2] bg-white px-6 py-10 text-center shadow-[0_14px_34px_rgba(15,35,110,0.06)] sm:px-8 sm:py-16">
      <FoundationEmptyState
        icon="i-ph-megaphone-simple-fill"
        :title="t('pages.pageDetailPage.emptyTitle')"
        :description="t('pages.pageDetailPage.emptyDescription')"
      />

      <div class="mt-6 flex justify-center">
        <UButton
          to="/create-page"
          color="primary"
          variant="solid"
          size="xl"
          class="rounded-[16px] px-5 text-[14px] font-extrabold shadow-[0_12px_24px_rgba(0,0,255,0.24)]"
        >
          {{ t("pages.pageDetailPage.createNewPage") }}
        </UButton>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import FoundationEmptyState from "../../../foundation/presentation/components/EmptyState.vue"
import FeedPostCard from "../../../feed/presentation/components/PostCard.vue"
import { useCommunityPageDetail } from "../../application/composables/useCommunityPageDetail"

const { t } = useI18n()
const translateText = useMaybeTranslatedText()
const route = useRoute()
const username = computed(() => String(route.params.name || ""))
const { page, pagePosts } = useCommunityPageDetail(username)
const activeTab = ref<'posts' | 'about'>('posts')
const isFollowing = ref(false)
const avatarLabel = computed(() => translateText(page.value?.name || '').slice(0, 2).toUpperCase())
const pageName = computed(() => translateText(page.value?.name || ''))
const pageSummary = computed(() => translateText(page.value?.summary || ''))
const responseLabel = computed(() => translateText(page.value?.responseLabel || ''))
const foundedLabel = computed(() => translateText(page.value?.foundedLabel || ''))
const locationLabel = computed(() => translateText(page.value?.locationLabel || ''))
const categoryLabel = computed(() => translateText(page.value?.categoryLabel || ''))
const followerCountLabel = computed(() => page.value?.followersLabel || '')
const likeCountLabel = computed(() => page.value?.likesLabel || '')
const pageConnections = computed(() => page.value?.connections?.slice(0, 6) || [])
const tabs = computed(() => [
  { key: 'posts', label: t('pages.pageDetailPage.tabs.posts') },
  { key: 'about', label: t('pages.pageDetailPage.tabs.about') },
])

async function handleFollowPage() { isFollowing.value = !isFollowing.value }
async function handleSharePage() { await navigator.clipboard?.writeText(window.location.href) }
</script>

<style scoped>
.page-detail { min-height: 100vh; background: #f0f2f5; }
.page-detail__hero { background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,.1); margin-bottom: 12px; }
.page-detail__cover { position: relative; height: 280px; overflow: hidden; }
.page-detail__cover-backdrop { position: absolute; inset: 0; background: linear-gradient(135deg,#0f172a 0%,#1d4ed8 56%,#bfdbfe 100%); }
.page-detail__cover-shade { position:absolute; inset:0; background: linear-gradient(to top, rgba(0,0,0,.16) 0%, transparent 40%); }
.page-detail__cover-actions { position:absolute; right:14px; bottom:14px; display:flex; gap:8px; flex-wrap:wrap; }
.page-detail__identity { display:flex; gap:14px; align-items:flex-end; padding: 0 16px; margin-top:-44px; position:relative; z-index:1; }
.page-detail__avatar-wrap { width:120px; height:120px; flex-shrink:0; }
.page-detail__avatar { width:100%; height:100%; border-radius:50%; border:4px solid #fff; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:900; font-size:2rem; box-shadow:0 4px 20px rgba(0,0,0,.18); }
.page-detail__meta { min-width:0; padding-bottom:8px; }
.page-detail__title { margin:0; font-size: clamp(1.5rem, 3vw, 2rem); font-weight:900; color:#0f172a; background:#fff; padding: 6px 16px; border-radius:999px; display:inline-flex; }
.page-detail__summary { margin-top: 10px; color:#475569; line-height:1.7; }
.page-detail__stats { margin-top:8px; display:flex; gap:8px; flex-wrap:wrap; color:#475569; font-size:14px; }
.page-detail__tabs { display:flex; gap:8px; overflow:auto; padding: 0 16px 12px; }
.page-detail__tab { border:none; background:transparent; padding:14px 16px; font-weight:800; color:#65676b; border-bottom:3px solid transparent; white-space:nowrap; }
.page-detail__tab--active { color:#0000ff; border-bottom-color:#0000ff; }
.page-detail__body { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:minmax(0,1fr); gap:12px; }
@media (min-width: 1024px) { .page-detail__body { grid-template-columns:minmax(0,1fr) 360px; } }
.page-detail__main, .page-detail__sidebar { display:flex; flex-direction:column; gap:12px; }
.page-detail__card { background:#fff; border-radius:12px; box-shadow:0 1px 2px rgba(0,0,0,.1); padding:16px; }
.page-detail__card-title { margin:0; font-size:18px; font-weight:900; color:#0f172a; }
.page-detail__card-text { margin-top:8px; color:#475569; line-height:1.7; }
</style>
