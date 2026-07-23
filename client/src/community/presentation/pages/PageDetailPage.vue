<!-- Description: Community page detail with a Facebook-style hero, direct feed, page actions, and profile sidebar. -->
<template>
  <div class="page-detail">
    <!-- ── Loading skeleton ──────────────────────────────── -->
    <template v-if="status === 'pending' && !page">
      <div class="page-detail__hero-skeleton">
        <USkeleton class="page-detail__cover-skeleton" />
        <div class="page-detail__identity-skeleton">
          <USkeleton class="page-detail__avatar-skeleton" />
          <div class="page-detail__identity-lines">
            <USkeleton class="h-8 w-56 max-w-full rounded-full" />
            <USkeleton class="h-5 w-72 max-w-full rounded-full" />
            <USkeleton class="h-5 w-44 max-w-full rounded-full" />
          </div>
          <div class="page-detail__action-skeletons">
            <USkeleton class="h-10 w-36 rounded-full" />
            <USkeleton class="h-10 w-32 rounded-full" />
          </div>
        </div>
      </div>
      <div class="page-detail__body page-detail__skeleton-body">
        <main class="page-detail__feed">
          <USkeleton class="h-[82px] w-full rounded-[20px]" />
          <USkeleton class="h-[340px] w-full rounded-[20px]" />
          <USkeleton class="h-[300px] w-full rounded-[20px]" />
        </main>
        <aside class="page-detail__sidebar">
          <USkeleton class="h-[180px] w-full rounded-[20px]" />
          <USkeleton class="h-[220px] w-full rounded-[20px]" />
        </aside>
      </div>
    </template>

    <!-- ── Empty / not found ─────────────────────────────── -->
    <template v-else-if="!page">
      <div class="page-detail__empty">
        <FoundationEmptyState
          icon="i-ph-megaphone-simple-duotone"
          :title="t('pages.pageDetailPage.emptyTitle')"
          :description="t('pages.pageDetailPage.emptyDescription')"
        />
        <div class="mt-6 flex justify-center">
          <UButton
            :to="appRoutes.createPage"
            color="primary"
            variant="solid"
            size="xl"
            class="rounded-[16px] px-5 text-[14px] font-extrabold"
          >
            {{ t('pages.pageDetailPage.createNewPage') }}
          </UButton>
        </div>
      </div>
    </template>

    <!-- ── Main content ──────────────────────────────────── -->
    <template v-else>
      <!-- HERO -->
      <div class="page-detail__hero" :class="{ 'opacity-60 pointer-events-none': status === 'pending' }">
        <!-- Cover -->
        <div class="page-detail__cover relative group">
          <div class="page-detail__cover-backdrop" :style="{ background: page.banner }" />
          <div class="page-detail__cover-shade" />
          <div v-if="bannerUploading" class="absolute inset-0 flex items-center justify-center bg-black/40 z-[4]">
            <Icon name="i-ph-spinner-gap-bold" class="h-10 w-10 text-white animate-spin" />
          </div>
          <!-- Camera Button Overlay for Cover -->
          <button
            v-if="page.canManage"
            type="button"
            class="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-900/80 text-white px-3 py-1.5 text-xs font-bold transition-all shadow-sm border border-white/20 backdrop-blur-sm cursor-pointer z-[5]"
            @click="triggerBannerUpload"
          >
            <Icon name="i-ph-camera-bold" class="h-4 w-4" />
            <span>Thay đổi ảnh bìa</span>
          </button>
          <input
            ref="bannerInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onBannerFileChange"
          />
        </div>

        <!-- Identity bar -->
        <div class="page-detail__identity-bar">
          <!-- Avatar -->
          <div class="page-detail__avatar-wrap relative group">
            <div class="page-detail__avatar relative" :style="{ background: page.accent }">
              <img
                v-if="page.avatarUrl"
                :src="page.avatarUrl"
                :alt="pageName"
                class="page-detail__avatar-img"
              >
              <span v-else class="page-detail__avatar-initials">{{ avatarLabel }}</span>
              <div v-if="avatarUploading" class="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 z-20">
                <Icon name="i-ph-spinner-gap-bold" class="h-8 w-8 text-white animate-spin" />
              </div>
            </div>
            <!-- Camera Button Overlay -->
            <button
              v-if="page.canManage"
              type="button"
              class="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white hover:bg-slate-100 text-[var(--text-primary)] transition-all shadow-md border border-slate-200 cursor-pointer z-10"
              @click="triggerAvatarUpload"
            >
              <Icon name="i-ph-camera-bold" class="h-4 w-4" />
            </button>
            <input
              ref="avatarInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onAvatarFileChange"
            />
          </div>

          <!-- Name + stats -->
          <div class="page-detail__identity-meta">
            <div class="page-detail__name-row">
              <h1 class="page-detail__display-name">{{ pageName }}</h1>
              <UBadge v-if="page.canManage" color="primary" variant="soft" class="rounded-full px-2.5 py-0.5 text-xs font-bold">
                <Icon name="i-ph-flag-fill" class="mr-1 h-3 w-3" />
                Owner
              </UBadge>
            </div>
            <div class="page-detail__stats-row">
              <span class="page-detail__stat-chip">
                <strong>{{ page.followers }}</strong>
                <span class="page-detail__stat-label">{{ t('pages.pageDetailPage.followStat') }}</span>
              </span>
              <span class="page-detail__stat-chip">
                <strong>{{ page.likes }}</strong>
                <span class="page-detail__stat-label">{{ t('pages.pageDetailPage.likeStat') }}</span>
              </span>
              <span v-if="locationLabel" class="page-detail__stat-chip">
                <Icon name="i-ph-map-pin-duotone" class="h-3.5 w-3.5" />
                <span class="page-detail__stat-label">{{ locationLabel }}</span>
              </span>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="page-detail__hero-actions">
            <!-- Owner actions -->
            <template v-if="page.canManage">
              <UButton
                color="white"
                variant="solid"
                class="rounded-full shadow-sm"
                @click="inviteVM.openModal()"
              >
                <Icon name="i-ph-envelope-simple-duotone" class="mr-1.5 h-4 w-4" />
                Mời bạn bè
              </UButton>
              <UButton
                color="primary"
                variant="soft"
                class="rounded-full"
                @click="openCreateOffer"
              >
                <Icon name="i-ph-tag-chevron-duotone" class="mr-1.5 h-4 w-4" />
                {{ t('pages.pageDetailPage.createOffer') }}
              </UButton>
              <UButton
                color="neutral"
                variant="soft"
                class="rounded-full"
                :to="createJobTo"
              >
                <Icon name="i-ph-briefcase-duotone" class="mr-1.5 h-4 w-4" />
                Create job
              </UButton>
              <UButton
                :to="pageSettingsTo"
                color="primary"
                variant="solid"
                class="rounded-full"
              >
                <Icon name="i-ph-gear-six-duotone" class="mr-1.5 h-4 w-4" />
                {{ t('pages.pageDetailPage.settingsButton') }}
              </UButton>
            </template>

            <!-- Visitor actions -->
            <template v-else>
              <UButton
                color="primary"
                :variant="isFollowing ? 'soft' : 'solid'"
                class="rounded-full"
                :loading="followPending"
                @click="handleFollowPage"
              >
                <Icon
                  :name="isFollowing ? 'i-ph-bell-ringing-fill' : 'i-ph-bell-simple-ringing-bold'"
                  class="mr-1.5 h-4 w-4"
                  :class="isFollowing ? 'text-primary-500' : ''"
                />
                {{ isFollowing ? t('pages.pageDetailPage.followingButton') : t('pages.pageDetailPage.followFallback') }}
              </UButton>
              <UButton
                color="primary"
                :variant="isLiked ? 'soft' : 'outline'"
                class="rounded-full"
                :loading="likePending"
                @click="handleLikePage"
              >
                <Icon
                  :name="isLiked ? 'i-ph-thumbs-up-fill' : 'i-ph-thumbs-up-bold'"
                  class="mr-1.5 h-4 w-4"
                  :class="isLiked ? 'text-primary-500' : ''"
                />
                {{ isLiked ? t('pages.pageDetailPage.likedButton') : t('pages.pageDetailPage.likeButton') }}
              </UButton>
              <UButton
                color="neutral"
                variant="soft"
                class="rounded-full"
                :to="createJobTo"
              >
                <Icon name="i-ph-briefcase-duotone" class="mr-1.5 h-4 w-4" />
                Create job
              </UButton>
            </template>
          </div>
        </div>
      </div>

      <!-- BODY -->
      <div class="page-detail__body" :class="{ 'mt-8': inviteVM.isOpen.value }">
        <!-- Main feed -->
        <main class="page-detail__feed">
          <PageInviteModal
            v-if="inviteVM.isOpen.value"
            :is-open="inviteVM.isOpen.value"
            :is-pending="inviteVM.isPending.value"
            :search-query="inviteVM.searchQuery.value"
            :visible-candidates="inviteVM.visibleCandidates.value"
            :invited-ids="inviteVM.invitedIds.value"
            @update:search-query="inviteVM.searchQuery.value = $event"
            @close="inviteVM.closeModal()"
            @invite="inviteVM.sendInvite"
          />
          <template v-else>
            <FeedPublisherBox
              :page-id="page.id"
              @created="handlePostCreated"
            />
            <ClientOnly>
              <div class="page-detail__icon-nav">
                <NavigationHeaderIconNav />
              </div>
            </ClientOnly>
          </template>
          <div v-if="!inviteVM.isOpen.value">
            <div v-if="pagePosts.length">
              <div v-if="filteredPosts.length" class="page-detail__post-stack">
                <FeedPostCard
                  v-for="post in filteredPosts"
                  :key="post.id"
                  :post="post"
                />
              </div>
              <div v-else class="rounded-[20px] bg-white p-8 text-center text-[var(--text-secondary)] shadow-sm border border-slate-200">
                <Icon name="i-ph-magnifying-glass-duotone" class="mx-auto h-12 w-12 text-[var(--text-tertiary)] mb-2" />
                <p class="font-semibold text-[var(--text-primary)]">Không tìm thấy bài viết nào phù hợp</p>
                <p class="text-sm text-[var(--text-tertiary)] mt-1">Thử lại với từ khóa khác</p>
              </div>
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
          </div>
        </main>

        <!-- Sidebar -->
        <aside class="page-detail__sidebar">
          <section class="profile-card profile-card--search">
            <div class="profile-card__head">
              <h2 class="profile-card__title">Tìm kiếm bài viết</h2>
            </div>
            <div class="mt-2">
              <UInput
                v-model="postSearchQuery"
                icon="i-ph-magnifying-glass-bold"
                placeholder=""
                size="xl"
                class="w-full"
                :ui="{ base: 'h-12 rounded-xl bg-white' }"
                clearable
              />
            </div>
          </section>

          <section class="profile-card profile-card--flush">
            <div class="profile-card__head profile-card__head--bordered">
              <span class="profile-card__section-icon">
                <Icon name="i-ph-info-fill" class="h-4.5 w-4.5" />
              </span>
              <h2 class="profile-card__title">Thông tin</h2>
            </div>

            <div class="profile-card__rows">
              <div class="profile-card__info-row">
                <Icon name="i-ph-thumbs-up-fill" class="profile-card__row-icon" />
                <span class="profile-card__row-value">{{ likeInfoLabel }}</span>
                <span class="profile-card__weekly">+0 Tuần này</span>
              </div>
              <div class="profile-card__info-row">
                <Icon name="i-ph-list-bullets-fill" class="profile-card__row-icon" />
                <span class="profile-card__row-value"></span>
                <span class="profile-card__row-tail">{{ pagePostCountLabel }}</span>
              </div>
              <div class="profile-card__info-row">
                <Icon name="i-ph-briefcase-fill" class="profile-card__row-icon" />
                <span class="profile-card__row-value">Việc làm</span>
              </div>
              <div class="profile-card__info-row">
                <Icon name="i-ph-cube-fill" class="profile-card__row-icon" />
                <span class="profile-card__row-value">Lời đề nghị</span>
              </div>
              <div class="profile-card__info-row">
                <Icon name="i-ph-tag-fill" class="profile-card__row-icon" />
                <span class="profile-card__row-value"></span>
                <span class="profile-card__row-tail">{{ categoryLabel }}</span>
              </div>
            </div>
          </section>

          <section class="profile-card profile-card--flush">
            <div class="profile-card__head profile-card__head--bordered">
              <span class="profile-card__section-icon">
                <Icon name="i-ph-text-align-left-bold" class="h-4.5 w-4.5" />
              </span>
              <h2 class="profile-card__title">Về</h2>
            </div>
            <p class="profile-card__about-text">
              {{ pageSummary || "Chưa có mô tả." }}
            </p>
          </section>

          <section v-if="suggestedPages.length" class="profile-card profile-card--suggestions">
            <div class="profile-card__head profile-card__head--bordered">
              <span class="profile-card__section-icon">
                <Icon name="i-ph-flag-fill" class="h-4.5 w-4.5" />
              </span>
              <h2 class="profile-card__title">Các trang bạn có thể thích</h2>
            </div>

            <NuxtLink
              v-for="suggestedPage in suggestedPages"
              :key="suggestedPage.id"
              :to="getCommunityPagePath(suggestedPage.slug)"
              class="suggested-page"
            >
              <div class="suggested-page__cover" :style="{ background: suggestedPage.banner }"></div>
              <div class="suggested-page__body">
                <div class="suggested-page__avatar" :style="{ background: suggestedPage.accent }">
                  <img
                    v-if="suggestedPage.avatarUrl"
                    :src="suggestedPage.avatarUrl"
                    :alt="suggestedPage.name"
                    class="suggested-page__avatar-img"
                  >
                  <span v-else>{{ suggestedPage.name.slice(0, 2).toUpperCase() }}</span>
                </div>
                <div class="suggested-page__copy">
                  <p class="suggested-page__name">{{ suggestedPage.name }}</p>
                  <p class="suggested-page__meta">{{ suggestedPage.likes }} likes</p>
                </div>
              </div>
            </NuxtLink>
          </section>
        </aside>
      </div>
    </template>
  </div>

  <OfferFormModal
    v-if="page"
    v-model:open="offerModalOpen"
    :mode="offerFormMode"
    :page-id="page.id"
    :offer="editingOffer"
    @saved="handleOfferSaved"
  />
</template>

<script setup lang="ts">
import FoundationEmptyState from "../../../foundation/presentation/components/EmptyState.vue"
import FeedPostCard from "../../../feed/presentation/components/PostCard.vue"
import FeedPublisherBox from "../../../feed/presentation/components/FeedPublisherBox.vue"
import NavigationHeaderIconNav from "../../../navigation/presentation/components/HeaderIconNav.vue"
import OfferFormModal from "../../../offer/presentation/components/OfferFormModal.vue"
import PageInviteModal from "../components/PageInviteModal.vue"
import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"
import { getCommunityPagePath, getCommunityPageSettingsPath } from "../../domain/services/community-helpers.service"
import type { Offer } from "../../../offer/domain/types/offer.types"
import type { CommunityPageRecord } from "../../domain/types/community.types"
import { useCommunityPageDetailPageVM } from "../../application/view-models/useCommunityPageDetailPageVM"
import { useCommunityPageInviteVM } from "../../application/view-models/useCommunityPageInviteVM"
import { createApiCommunityRepository } from "../../infrastructure/repositories/ApiCommunityRepository"

const { t } = useI18n()
const {
  followPending,
  likePending,
  page,
  status,
  pageName,
  pageSummary,
  isFollowing,
  isLiked,
  avatarLabel,
  responseLabel,
  foundedLabel,
  locationLabel,
  categoryLabel,
  pagePosts,
  handleFollowPage,
  handleLikePage,
  refreshPagePosts,
} = useCommunityPageDetailPageVM()

const inviteVM = useCommunityPageInviteVM(() => page.value?.slug || '')
const editingOffer = ref<Offer | null>(null)
const offerModalOpen = ref(false)
const offerFormMode = computed(() => editingOffer.value ? 'edit' : 'create')

const pageSettingsTo = computed(() => page.value ? getCommunityPageSettingsPath(page.value.slug) : '')
const createJobTo = computed(() => ({
  path: appRoutes.jobs,
  query: page.value?.id
    ? { create: "1", pageId: String(page.value.id) }
    : { create: "1" },
}))

const avatarInput = ref<HTMLInputElement | null>(null)
const bannerInput = ref<HTMLInputElement | null>(null)
const avatarUploading = ref(false)
const bannerUploading = ref(false)
const postSearchQuery = ref("")

const repository = createApiCommunityRepository()
const toast = useToast()
const { data: suggestedPagesData } = await useAsyncData<CommunityPageRecord[]>(
  "page-detail:suggested-pages",
  () => repository.getPages("suggested"),
  {
    default: () => [],
  },
)

const suggestedPages = computed(() =>
  (suggestedPagesData.value || [])
    .filter(item => item.slug !== page.value?.slug)
    .slice(0, 3),
)

const likeInfoLabel = computed(() =>
  `${page.value?.likes || 0} những người như thế này`,
)

const pagePostCountLabel = computed(() => {
  const count = page.value?.postCount ?? pagePosts.value.length
  return `${count} bài viết`
})

function triggerAvatarUpload() {
  avatarInput.value?.click()
}

function triggerBannerUpload() {
  bannerInput.value?.click()
}

async function onAvatarFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !page.value) return

  avatarUploading.value = true
  try {
    const updatedPage = await repository.updatePage(page.value.slug, {
      avatarFile: file
    } as any)
    page.value.avatarUrl = updatedPage.avatarUrl
    toast.add({
      title: "Thành công",
      description: "Cập nhật ảnh đại diện thành công",
      color: "success"
    })
  } catch (err) {
    toast.add({
      title: "Lỗi",
      description: err instanceof Error ? err.message : "Không thể cập nhật ảnh đại diện",
      color: "error"
    })
  } finally {
    avatarUploading.value = false
  }
}

async function onBannerFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !page.value) return

  bannerUploading.value = true
  try {
    const updatedPage = await repository.updatePage(page.value.slug, {
      bannerFile: file
    } as any)
    page.value.banner = updatedPage.banner
    toast.add({
      title: "Thành công",
      description: "Cập nhật ảnh bìa thành công",
      color: "success"
    })
  } catch (err) {
    toast.add({
      title: "Lỗi",
      description: err instanceof Error ? err.message : "Không thể cập nhật ảnh bìa",
      color: "error"
    })
  } finally {
    bannerUploading.value = false
  }
}

const filteredPosts = computed(() => {
  const query = postSearchQuery.value.trim().toLowerCase()
  if (!query) return pagePosts.value
  return pagePosts.value.filter(post =>
    (post.text || "").toLowerCase().includes(query) ||
    (post.authorName || "").toLowerCase().includes(query)
  )
})

function handlePostCreated() {
  refreshPagePosts()
}

function openCreateOffer() {
  editingOffer.value = null
  offerModalOpen.value = true
}

async function handleOfferSaved() {
  await refreshPagePosts()
}
</script>

<style scoped>
/* ── Root ────────────────────────────────────────────── */
.page-detail {
  min-height: 100vh;
  background: #f0f2f5;
}

/* ── Hero ────────────────────────────────────────────── */
.page-detail__hero {
  background: var(--bg-surface);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  margin-bottom: 12px;
  border-bottom-left-radius: 18px;
  border-bottom-right-radius: 18px;
}

/* Cover */
.page-detail__cover {
  position: relative;
  height: 280px;
  overflow: hidden;
  background: linear-gradient(135deg, #0f172a 0%, var(--bg-brand-hover) 56%, var(--color-primary-200) 100%);
}

@media (min-width: 640px) { .page-detail__cover { height: 350px; } }
@media (min-width: 1024px) { .page-detail__cover { height: 400px; } }

.page-detail__cover-backdrop {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
}

.page-detail__cover-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.18) 0%, transparent 42%);
}

.page-detail__cover-actions {
  position: absolute;
  right: 14px;
  bottom: 14px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  z-index: 2;
}

.page-detail__manage-link {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0 14px;
  height: 32px;
  font-size: 12px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.9);
  color: var(--text-primary);
  text-decoration: none;
  backdrop-filter: blur(4px);
  transition: background 0.15s;
}

.page-detail__manage-link:hover { background: var(--bg-surface); }

/* Identity bar */
.page-detail__identity-bar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px 0;
  margin-top: -44px;
  position: relative;
  z-index: 1;
}

@media (min-width: 768px) {
  .page-detail__identity-bar {
    flex-direction: row;
    align-items: flex-end;
    margin-top: -28px;
    padding: 0 24px;
    gap: 16px;
  }
}

/* Avatar */
.page-detail__avatar-wrap {
  position: relative;
  flex-shrink: 0;
  width: 168px;
  height: 168px;
}

@media (max-width: 767px) {
  .page-detail__avatar-wrap { width: 120px; height: 120px; }
}

.page-detail__avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 4px solid #ffffff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.page-detail__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.page-detail__avatar-initials {
  color: #ffffff;
  font-size: 2.5rem;
  font-weight: 900;
}

/* Name + meta */
.page-detail__identity-meta {
  flex: 1;
  min-width: 0;
  padding-bottom: 8px;
}

.page-detail__name-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;}

.page-detail__display-name {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  border-radius: 999px;
  padding: 6px 2px 0 2px;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  color: var(--text-primary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-detail__stats-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 6px;
  margin-left: 2px;
}

.page-detail__stat-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--text-secondary);
}

.page-detail__stat-chip strong {
  font-weight: 800;
  color: var(--text-primary);
}

.page-detail__stat-label { color: var(--text-secondary); }

/* Hero actions */
.page-detail__hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding-bottom: 8px;
  margin-top: 4px;
}

@media (min-width: 768px) { .page-detail__hero-actions { margin-top: 0; } }

/* ── Body ────────────────────────────────────────────── */
.page-detail__body {
  display: grid;
  gap: 12px;
}

@media (min-width: 1024px) {
  .page-detail__body {
    grid-template-columns: minmax(0, 1fr) 360px;
    align-items: start;
  }
}

@media (min-width: 1280px) {
  .page-detail__body { grid-template-columns: minmax(0, 1fr) 380px; }
}

.page-detail__sidebar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  width: 100%;
  order: 2;
}

@media (min-width: 1024px) {
  .page-detail__sidebar {
    position: sticky;
    top: 68px;
  }
}

.page-detail__feed {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  width: 100%;
  order: 1;
}

.page-detail__post-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-detail__icon-nav {
  overflow: hidden;
  border: 1px solid #dbe3f2;
  border-radius: 18px;
  background: var(--bg-surface);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
}

/* ── Shared profile-card styles (mirrors ProfilePage) ── */
.profile-card {
  overflow: hidden;
  border: 1px solid #dbe3f2;
  background: var(--bg-surface);
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  padding: 16px;
}

.profile-card--flush,
.profile-card--suggestions {
  padding: 0;
}

.profile-card--search {
  border-radius: 10px;
}

.profile-card__head {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  margin-bottom: 4px;
}

.profile-card__head--bordered {
  min-height: 52px;
  border-bottom: 1px solid #e5e7eb;
  padding: 12px 16px;
}

.profile-card__title {
  margin: 0;
  font-size: 16px;
  font-weight: 900;
  color: var(--text-primary);
}

.profile-card__section-icon {
  display: inline-flex;
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--bg-brand);
  color: #ffffff;
}

.profile-card__rows {
  padding: 8px 0;
}

.profile-card__info-row {
  display: flex;
  min-height: 32px;
  align-items: center;
  gap: 14px;
  border-bottom: 1px solid #eef2f7;
  padding: 5px 16px;
  color: #374151;
  font-size: 14px;
  line-height: 1.3;
}

.profile-card__info-row:last-child {
  border-bottom: 0;
}

.profile-card__row-icon {
  width: 17px;
  height: 17px;
  flex: 0 0 auto;
  color: #7b8190;
}

.profile-card__row-value {
  min-width: 0;
  flex: 1;
}

.profile-card__row-tail {
  margin-left: auto;
  color: #374151;
  white-space: nowrap;
}

.profile-card__weekly {
  margin-left: auto;
  color: #31a24c;
  white-space: nowrap;
}

.profile-card__about-text {
  margin: 0;
  padding: 18px 16px 22px;
  color: #374151;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.suggested-page {
  display: block;
  color: inherit;
  text-decoration: none;
}

.suggested-page + .suggested-page {
  border-top: 1px solid #e5e7eb;
}

.suggested-page__cover {
  height: 128px;
  background-position: center;
  background-size: cover;
}

.suggested-page__body {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px 14px;
}

.suggested-page__avatar {
  display: flex;
  width: 48px;
  height: 48px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 999px;
  border: 2px solid #ffffff;
  color: #ffffff;
  font-size: 13px;
  font-weight: 900;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.16);
}

.suggested-page__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.suggested-page__copy {
  min-width: 0;
}

.suggested-page__name {
  margin: 0;
  overflow: hidden;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.suggested-page__meta {
  margin: 3px 0 0;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 700;
}

/* ── Empty ───────────────────────────────────────────── */
.page-detail__empty {
  max-width: 960px;
  margin: 0 auto;
  padding: 40px 16px;
  text-align: center;
}

/* ── Skeleton ────────────────────────────────────────── */
.page-detail__hero-skeleton {
  background: var(--bg-surface);
  margin-bottom: 12px;
  border-bottom-left-radius: 18px;
  border-bottom-right-radius: 18px;
}

.page-detail__cover-skeleton {
  width: 100%;
  height: 280px;
}

@media (min-width: 640px) { .page-detail__cover-skeleton { height: 350px; } }

.page-detail__identity-skeleton {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px;
  margin-top: -44px;
}

@media (min-width: 768px) {
  .page-detail__identity-skeleton {
    flex-direction: row;
    align-items: flex-end;
    margin-top: -28px;
  }
}

.page-detail__avatar-skeleton {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid #ffffff;
}

@media (min-width: 768px) {
  .page-detail__avatar-skeleton { width: 168px; height: 168px; }
}

.page-detail__identity-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 8px;
}

.page-detail__action-skeletons {
  display: flex;
  gap: 8px;
  padding-bottom: 8px;
}

.page-detail__skeleton-body {
  display: grid;
  gap: 12px;
  padding: 0 8px;
}

@media (min-width: 1024px) {
  .page-detail__skeleton-body {
    grid-template-columns: minmax(0, 1fr) 360px;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 16px;
  }
}
</style>
