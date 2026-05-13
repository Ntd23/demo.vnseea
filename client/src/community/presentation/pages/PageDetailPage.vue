<!-- Description: Renders the backend-backed community page detail route with a tabbed feed and sidebar layout. -->
<template>
  <div class="mx-auto max-w-[1280px] pb-10">
    <!-- ── Loading skeleton ──────────────────────────────── -->
    <template v-if="status === 'pending' && !page">
      <div class="space-y-5">
        <!-- Hero Skeleton -->
        <div class="overflow-hidden rounded-b-[26px] bg-white shadow-sm sm:rounded-[26px]">
          <USkeleton class="h-[280px] w-full" />
          <div class="px-6 pb-8 pt-0">
            <div class="relative flex items-end gap-5">
              <USkeleton class="-mt-12 h-32 w-32 rounded-full border-4 border-white shadow-lg" />
              <div class="flex-1 space-y-3 pb-2">
                <USkeleton class="h-8 w-48 rounded-full" />
                <USkeleton class="h-4 w-64 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <!-- Body Skeleton -->
        <div class="grid grid-cols-1 gap-4 px-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div class="space-y-4">
            <USkeleton class="h-[120px] w-full rounded-2xl" />
            <USkeleton v-for="i in 2" :key="i" class="h-[300px] w-full rounded-2xl" />
          </div>
          <div class="space-y-4">
            <USkeleton class="h-[180px] w-full rounded-2xl" />
            <USkeleton class="h-[220px] w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </template>

    <!-- ── Main Content ──────────────────────────────────── -->
    <div v-else-if="page" class="page-detail" :class="{ 'opacity-50 pointer-events-none': status === 'pending' }">
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
              :loading="sharePending"
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
              :loading="followPending"
              @click="handleFollowPage"
            >
              <Icon name="i-ph-bell-simple-ringing-bold" class="mr-1.5 h-4 w-4" />
              {{ isFollowing ? t('pages.pageDetailPage.followingButton') : t('pages.pageDetailPage.followFallback') }}
            </UButton>
          </div>
        </div>

        <div class="page-detail__identity">
          <div class="page-detail__avatar-wrap">
            <div class="page-detail__avatar" :style="{ background: page.banner }">
              <img
                v-if="page.avatarUrl"
                :src="page.avatarUrl"
                :alt="pageName"
                class="page-detail__avatar-img"
              >
              <span v-else>{{ avatarLabel }}</span>
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

        <UAlert
          v-if="actionMessage"
          class="mx-4 mb-3 rounded-2xl sm:mx-6"
          :color="actionState === 'error' ? 'warning' : 'success'"
          variant="subtle"
          :icon="actionState === 'error' ? 'i-ph-warning-circle-fill' : 'i-ph-check-circle-fill'"
          :description="actionMessage"
        />
      </div>

      <div class="page-detail__body">
        <section class="page-detail__main">
          <template v-if="activeTab === 'posts'">
            <div class="mb-4">
              <FeedPublisherBox :page-id="page.id" @created="handlePostCreated" />
            </div>

            <div v-if="pagePosts.length" class="space-y-3">
              <FeedPostCard v-for="post in pagePosts" :key="post.id" :post="post" />
            </div>
            <UAlert
              v-else
              color="neutral"
              variant="subtle"
              icon="i-ph-newspaper-clipping-duotone"
              :title="t('pages.pageDetailPage.feedEmptyTitle')"
              :description="t('pages.pageDetailPage.feedEmptyDescription')"
              class="rounded-[20px]"
            />
          </template>
          <template v-else>
            <section class="page-detail__card">
              <h2 class="page-detail__card-title">{{ categoryLabel }}</h2>
              <p class="page-detail__card-text">{{ pageSummary }}</p>
            </section>
            <section class="page-detail__card">
              <h2 class="page-detail__card-title">{{ t('pages.pageDetailPage.aboutEyebrow') }}</h2>
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
            <h2 class="page-detail__card-title">{{ t('pages.pageDetailPage.aboutEyebrow') }}</h2>
            <p class="page-detail__card-text">{{ pageSummary }}</p>
          </section>
          <section class="page-detail__card">
            <h2 class="page-detail__card-title">{{ t('pages.pageDetailPage.interactionTitle') }}</h2>
            <div class="mt-3 grid grid-cols-2 gap-3">
              <div class="page-detail__metric">
                <span>{{ t('pages.pageDetailPage.followStat') }}</span>
                <strong>{{ page.followers }}</strong>
              </div>
              <div class="page-detail__metric">
                <span>{{ t('pages.pageDetailPage.likeStat') }}</span>
                <strong>{{ page.likes }}</strong>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>

    <!-- ── Empty State ───────────────────────────────────── -->
    <div v-else class="mx-auto max-w-[960px] pt-4">
      <section class="rounded-[30px] border border-[#dbe3f2] bg-white px-6 py-10 text-center shadow-[0_14px_34px_rgba(15,35,110,0.06)] sm:px-8 sm:py-16">
        <FoundationEmptyState
          icon="i-ph-megaphone-simple-fill"
          :title="t('pages.pageDetailPage.emptyTitle')"
          :description="t('pages.pageDetailPage.emptyDescription')"
        />

        <div class="mt-6 flex justify-center">
          <UButton
            :to="appRoutes.createPage"
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
  </div>
</template>

<script setup lang="ts">
import FoundationEmptyState from "../../../foundation/presentation/components/EmptyState.vue"
import FeedPostCard from "../../../feed/presentation/components/PostCard.vue"
import FeedPublisherBox from "../../../feed/presentation/components/FeedPublisherBox.vue"
import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"
import { useCommunityPageDetailPageVM } from "../../application/view-models/useCommunityPageDetailPageVM"

const { t } = useI18n()
const {
  activeTab,
  followPending,
  sharePending,
  actionState,
  actionMessage,
  page,
  status,
  pageName,
  pageSummary,
  isFollowing,
  avatarLabel,
  responseLabel,
  foundedLabel,
  locationLabel,
  categoryLabel,
  followerCountLabel,
  likeCountLabel,
  pagePosts,
  tabs,
  handleFollowPage,
  handleSharePage,
  refreshPagePosts,
} = useCommunityPageDetailPageVM()

function handlePostCreated() {
  refreshPagePosts()
}
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
.page-detail__avatar-img { width:100%; height:100%; border-radius:50%; object-fit:cover; display:block; }
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
.page-detail__metric { border-radius:14px; background:#f6f8ff; padding:12px; }
.page-detail__metric span { display:block; color:#64748b; font-size:11px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; }
.page-detail__metric strong { display:block; margin-top:4px; color:#0f172a; font-size:20px; font-weight:900; }
</style>
