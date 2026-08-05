<!-- English description: Renders the authenticated saved, reaction, comment, and share activity center. -->
<template>
  <main class="activity-center">
    <nav class="activity-center__tabs" :aria-label="t('pages.activityCenter.title')">
      <button v-for="tab in tabs" :key="tab" type="button" class="activity-center__tab"
        :class="{ 'activity-center__tab--active': activeTab === tab }" @click="selectTab(tab)">
        {{ t(`pages.activityCenter.tabs.${tab}`) }}
      </button>
    </nav>

    <section v-if="current.loading" class="activity-center__state">
      <Icon name="i-lucide-loader-2" class="h-7 w-7 animate-spin text-primary" />
      <span>{{ t("pages.activityCenter.loading") }}</span>
    </section>
    <section v-else-if="current.error && current.items.length === 0" class="activity-center__state">
      <Icon name="i-ph-warning-circle-duotone" class="h-10 w-10 text-warning" />
      <p>{{ current.error }}</p>
      <UButton color="primary" @click="refresh(activeTab)">{{ t("pages.activityCenter.retry") }}</UButton>
    </section>
    <section v-else-if="current.items.length === 0" class="activity-center__state">
      <Icon :name="emptyIcon" class="h-12 w-12 text-primary/70" />
      <p>{{ t(`pages.activityCenter.empty.${activeTab}`) }}</p>
    </section>

    <section v-else class="activity-center__list">
      <NuxtLink v-for="item in current.items" :key="item.id" :to="postPath(item)" class="activity-card">
        <div class="activity-card__media">
          <img v-if="previewImage(item)" :src="previewImage(item)" :alt="item.post.author" loading="lazy">
          <Icon v-else name="i-ph-article-duotone" class="h-9 w-9 text-primary" />
          <span v-if="item.post.primaryMediaType === 'video'" class="activity-card__play">
            <Icon name="i-ph-play-fill" class="h-4 w-4" />
          </span>
        </div>
        <div class="activity-card__body">
          <div class="activity-card__author">
            <img :src="item.post.authorAvatarUrl" :alt="item.post.author">
            <span>{{ item.post.author }}</span>
          </div>
          <h2>{{ item.post.text || t("pages.activityCenter.postFallback") }}</h2>
          <p class="activity-card__metadata">{{ metadata(item) }}</p>
          <p v-if="item.latestCommentText" class="activity-card__comment">“{{ item.latestCommentText }}”</p>
        </div>
        <Icon name="i-ph-caret-right-bold" class="h-5 w-5 shrink-0 text-muted" />
      </NuxtLink>

      <UAlert v-if="current.error" color="warning" variant="subtle" :description="current.error" />
      <UButton v-if="current.hasMore" class="mx-auto" color="neutral" variant="soft"
        :loading="current.loadingMore" @click="loadMore(activeTab)">
        {{ t("pages.activityCenter.loadMore") }}
      </UButton>
    </section>
  </main>
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import type { ActivityCenterTab, PostActivityItem } from "../../domain/types/activity.types"
import { useActivityCenterPageVM } from "../../application/view-models/useActivityCenterPageVM"

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const validTabs: ActivityCenterTab[] = ["saved", "reaction", "comment", "share"]
const normalizeTab = (value: unknown): ActivityCenterTab =>
  validTabs.includes(String(value) as ActivityCenterTab) ? String(value) as ActivityCenterTab : "saved"
const activeTab = computed(() => normalizeTab(route.query.tab))
const { tabs, state, refresh, loadMore } = useActivityCenterPageVM(activeTab)
const current = computed(() => state[activeTab.value])
const emptyIcon = computed(() => ({
  saved: "i-ph-bookmark-simple-duotone", reaction: "i-ph-heart-duotone",
  comment: "i-ph-chat-circle-duotone", share: "i-ph-share-fat-duotone",
}[activeTab.value]))

function selectTab(tab: ActivityCenterTab) {
  void router.replace({ query: { ...route.query, tab } })
}
function previewImage(item: PostActivityItem) {
  const media = item.post.mediaItems[0]
  return media?.thumb || media?.src || item.post.attachmentCard?.imageUrl || ""
}
function postPath(item: PostActivityItem) {
  return item.post.primaryMediaType === "video"
    ? `${appRoutes.reels}?postId=${item.postId}`
    : appRoutes.postDetail(item.postId)
}
function metadata(item: PostActivityItem) {
  if (item.category === "saved") return t("pages.activityCenter.metadata.saved")
  if (item.category === "reaction") return t(`pages.activityCenter.reactions.${item.reactionType || "default"}`)
  if (item.category === "comment") {
    return t("pages.activityCenter.metadata.comments", { count: item.interactionCount || 0 })
  }
  const destination = item.shareDestination ? t(`pages.activityCenter.destinations.${item.shareDestination}`) : ""
  return destination ? `${t("pages.activityCenter.metadata.shared")} · ${destination}` : t("pages.activityCenter.metadata.shared")
}
</script>

<style scoped>
.activity-center__tabs { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); margin-top: var(--space-3); border: 1px solid var(--border-light); border-radius: var(--radius-md); overflow: hidden; background: var(--bg-surface); }
.activity-center__tab { min-height: 48px; padding: 0 var(--space-2); color: var(--text-secondary); font-size: var(--text-body); font-weight: var(--weight-bold); border: 0; border-bottom: 3px solid transparent; background: transparent; cursor: pointer; }
.activity-center__tab--active { color: var(--text-brand); border-bottom-color: var(--bg-brand); background: var(--bg-surface-active); }
.activity-center__state { min-height: 340px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--space-3); padding: var(--space-6); text-align: center; color: var(--text-secondary); }
.activity-center__list { display: flex; flex-direction: column; gap: var(--space-3); padding-top: var(--space-3); }
.activity-card { display: flex; align-items: center; gap: var(--space-3); min-height: 116px; padding: var(--space-3); border: 1px solid var(--border-light); border-radius: var(--radius-lg); background: var(--bg-surface); color: inherit; text-decoration: none; transition: transform var(--duration-fast) var(--ease-default), border-color var(--duration-fast) var(--ease-default); }
.activity-card:hover { transform: translateY(-1px); border-color: var(--border-strong); }
.activity-card__media { position: relative; width: 90px; height: 90px; flex: 0 0 90px; display: grid; place-items: center; overflow: hidden; border-radius: var(--radius-md); background: var(--bg-muted); }
.activity-card__media img { width: 100%; height: 100%; object-fit: cover; }
.activity-card__play { position: absolute; inset: 0; display: grid; place-items: center; color: var(--text-media); background: color-mix(in srgb, var(--bg-media) 18%, transparent); }
.activity-card__body { flex: 1; min-width: 0; }
.activity-card__author { display: flex; align-items: center; gap: var(--space-2); color: var(--text-secondary); font-size: var(--text-caption); font-weight: var(--weight-bold); }
.activity-card__author img { width: 22px; height: 22px; border-radius: 50%; object-fit: cover; }
.activity-card h2 { margin: var(--space-2) 0 0; font-size: var(--text-title); line-height: 1.35; font-weight: var(--weight-extrabold); color: var(--text-primary); display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.activity-card__metadata { margin: var(--space-2) 0 0; color: var(--text-brand); font-size: var(--text-caption); font-weight: var(--weight-extrabold); }
.activity-card__comment { margin: var(--space-1) 0 0; color: var(--text-secondary); font-size: var(--text-caption); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
@media (max-width: 640px) { .activity-center__tab { padding: 0 var(--space-1); font-size: var(--text-caption); } .activity-card__media { width: 78px; height: 78px; flex-basis: 78px; } }
</style>
