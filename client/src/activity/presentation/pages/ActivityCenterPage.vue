<!-- English description: Renders the authenticated saved, reaction, comment, and share activity center. -->
<template>
  <main class="activity-center">
    <header class="activity-center__header">
      <div>
        <p class="activity-center__eyebrow">{{ t("pages.activityCenter.eyebrow") }}</p>
        <h1>{{ t("pages.activityCenter.title") }}</h1>
        <p>{{ t("pages.activityCenter.description") }}</p>
      </div>
      <UButton color="neutral" variant="soft" icon="i-ph-arrow-clockwise-bold"
        :loading="current.refreshing" @click="refresh(activeTab)">
        {{ t("pages.activityCenter.refresh") }}
      </UButton>
    </header>

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
.activity-center { max-width: 900px; margin: 0 auto; padding: 16px 12px 72px; }
.activity-center__header { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 22px; border: 1px solid var(--border-default); border-radius: 18px; background: var(--bg-surface); }
.activity-center__header h1 { margin: 2px 0 4px; font-size: clamp(1.4rem, 3vw, 2rem); font-weight: 900; color: var(--text-primary); }
.activity-center__header p { margin: 0; color: var(--text-secondary); }
.activity-center__eyebrow { color: var(--bg-brand) !important; font-size: .75rem; font-weight: 900; text-transform: uppercase; }
.activity-center__tabs { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); margin-top: 14px; border: 1px solid var(--border-default); border-radius: 14px; overflow: hidden; background: var(--bg-surface); }
.activity-center__tab { min-height: 48px; padding: 0 10px; color: var(--text-secondary); font-size: .84rem; font-weight: 800; border: 0; border-bottom: 3px solid transparent; background: transparent; cursor: pointer; }
.activity-center__tab--active { color: var(--bg-brand); border-bottom-color: var(--bg-brand); background: color-mix(in srgb, var(--bg-brand) 4%, transparent); }
.activity-center__state { min-height: 340px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 28px; text-align: center; color: var(--text-secondary); }
.activity-center__list { display: flex; flex-direction: column; gap: 10px; padding-top: 14px; }
.activity-card { display: flex; align-items: center; gap: 14px; min-height: 116px; padding: 13px; border: 1px solid var(--border-default); border-radius: 16px; background: var(--bg-surface); color: inherit; text-decoration: none; transition: transform .15s ease, border-color .15s ease; }
.activity-card:hover { transform: translateY(-1px); border-color: color-mix(in srgb, var(--bg-brand) 28%, transparent); }
.activity-card__media { position: relative; width: 90px; height: 90px; flex: 0 0 90px; display: grid; place-items: center; overflow: hidden; border-radius: 12px; background: color-mix(in srgb, var(--bg-brand) 6%, transparent); }
.activity-card__media img { width: 100%; height: 100%; object-fit: cover; }
.activity-card__play { position: absolute; inset: 0; display: grid; place-items: center; color: #fff; background: rgba(0, 0, 0, .18); }
.activity-card__body { flex: 1; min-width: 0; }
.activity-card__author { display: flex; align-items: center; gap: 7px; color: var(--text-secondary); font-size: .78rem; font-weight: 700; }
.activity-card__author img { width: 22px; height: 22px; border-radius: 50%; object-fit: cover; }
.activity-card h2 { margin: 7px 0 0; font-size: .95rem; line-height: 1.35; font-weight: 850; color: var(--text-primary); display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.activity-card__metadata { margin: 7px 0 0; color: var(--bg-brand); font-size: .78rem; font-weight: 800; }
.activity-card__comment { margin: 4px 0 0; color: var(--text-secondary); font-size: .78rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
@media (max-width: 640px) { .activity-center__header { align-items: flex-start; padding: 17px; } .activity-center__header > :last-child { flex: 0 0 auto; } .activity-center__tab { padding: 0 4px; font-size: .72rem; } .activity-card__media { width: 78px; height: 78px; flex-basis: 78px; } }
</style>
