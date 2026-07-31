<!-- English description: Renders the original post embedded inside a shared feed post. -->
<template>
  <article class="shared-post-card">
    <div class="shared-post-card__header">
      <img
        v-if="post.authorAvatarUrl"
        :src="post.authorAvatarUrl"
        :alt="post.author"
        class="shared-post-card__avatar"
      >
      <div v-else class="shared-post-card__avatar shared-post-card__avatar--fallback">
        {{ authorInitials }}
      </div>
      <div class="shared-post-card__meta">
        <NuxtLink :to="post.authorPath || '/home'" class="shared-post-card__author">
          {{ post.author }}
        </NuxtLink>
        <p class="shared-post-card__time">{{ post.time || post.audience }}</p>
      </div>
    </div>

    <NuxtLink
      v-if="post.isLive"
      :to="postHref"
      class="shared-post-card__live"
      @click.stop
    >
      <span class="shared-post-card__live-stage">
        <img
          v-if="livePosterUrl"
          :src="livePosterUrl"
          :alt="liveTitle"
          class="shared-post-card__live-poster"
        >
        <span class="shared-post-card__live-shade" />
        <span
          class="shared-post-card__live-badge"
          :class="{ 'shared-post-card__live-badge--ended': post.liveState === 'offline' }"
        >
          <Icon :name="post.liveState === 'offline' ? 'i-ph-video-camera-slash-fill' : 'i-ph-broadcast-fill'" />
          {{ liveStateLabel }}
        </span>
        <span class="shared-post-card__live-play">
          <Icon name="i-ph-play-fill" />
        </span>
        <span class="shared-post-card__live-viewers">
          <Icon name="i-ph-eye-fill" />
          {{ $t("pages.livePage.viewerCountShort", { count: post.liveViewerCount || 0 }) }}
        </span>
      </span>
      <span class="shared-post-card__live-copy">
        <strong>{{ liveTitle }}</strong>
        <span>{{ post.author }}</span>
      </span>
    </NuxtLink>

    <p v-else-if="post.text" class="shared-post-card__text">
      <template v-for="segment in postTextSegments" :key="segment.key">
        <NuxtLink
          v-if="segment.isHashtag"
          :to="createHashtagPath(segment.hashtag)"
          class="shared-post-card__hashtag"
          @click.stop
        >
          {{ segment.text }}
        </NuxtLink>
        <span v-else :class="{ 'shared-post-card__mention': segment.isMention }">
          {{ segment.text }}
        </span>
      </template>
    </p>
    <FeedPostMediaGrid
      v-if="!post.isLive && post.mediaItems.length"
      class="shared-post-card__media"
      :items="post.mediaItems"
      :post="post"
    />
  </article>
</template>

<script setup lang="ts">
import { createHashtagPath } from "../../application/composables/useHashtagData"
import { createPostTextMentionSegments } from "../../application/utils/feed-mentions"
import type { FeedPostRecord } from "../../domain/types/feed.types"
import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"
import FeedPostMediaGrid from "./PostMediaGrid.vue"

const props = defineProps<{
  post: FeedPostRecord
}>()

const { t } = useI18n()
const postHref = computed(() => appRoutes.postDetail(props.post.id))
const livePosterUrl = computed(() => {
  const video = props.post.mediaItems.find(item => item.type === "video")
  const image = props.post.mediaItems.find(item => item.type === "image")

  return video?.thumb || image?.src || ""
})
const liveStateLabel = computed(() =>
  props.post.liveState === "offline"
    ? t("pages.livePage.statusEndedUpper")
    : t("pages.livePage.statusLiveUpper"),
)
const liveTitle = computed(() =>
  props.post.videoTitle
  || props.post.text
  || (props.post.liveState === "offline"
    ? t("pages.livePage.viewer.offlineTitle")
    : t("pages.livePage.viewer.liveTitle")),
)

const postTextSegments = computed(() =>
  createPostTextMentionSegments(props.post.text, props.post.mentions ?? []),
)

const authorInitials = computed(() => {
  const initials = props.post.author
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.slice(0, 1).toUpperCase())
    .join("")

  return initials || "VN"
})
</script>

<style scoped>
.shared-post-card {
  margin-top: 14px;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 14px;
  background: var(--bg-surface);
}

.shared-post-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 12px 0;
}

.shared-post-card__avatar {
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  border-radius: 999px;
  object-fit: cover;
}

.shared-post-card__avatar--fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-brand), #4f46e5);
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
}

.shared-post-card__meta {
  min-width: 0;
}

.shared-post-card__author {
  display: block;
  overflow: hidden;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shared-post-card__time {
  margin-top: 2px;
  color: var(--text-tertiary);
  font-size: 12px;
  font-weight: 600;
}

.shared-post-card__text {
  padding: 10px 12px 0;
  color: var(--text-primary);
  font-size: 13.5px;
  line-height: 1.65;
  white-space: pre-line;
}

.shared-post-card__mention,
.shared-post-card__hashtag {
  color: var(--bg-brand);
  font-weight: 600;
}

.shared-post-card__hashtag {
  text-decoration: none;
}

.shared-post-card__hashtag:hover {
  text-decoration: underline;
}

.shared-post-card__media {
  margin-top: 12px;
}

.shared-post-card__live {
  display: block;
  margin: 12px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--bg-brand) 18%, var(--border-light));
  border-radius: 13px;
  background: var(--bg-muted);
  color: inherit;
  text-decoration: none;
}

.shared-post-card__live-stage {
  position: relative;
  display: flex;
  min-height: 190px;
  aspect-ratio: 16 / 9;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 30%, rgba(239, 68, 68, 0.28), transparent 44%),
    #111827;
}

.shared-post-card__live-poster,
.shared-post-card__live-shade {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.shared-post-card__live-poster {
  object-fit: cover;
}

.shared-post-card__live-shade {
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.08), rgba(15, 23, 42, 0.58));
}

.shared-post-card__live-badge,
.shared-post-card__live-viewers {
  position: absolute;
  top: 12px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border-radius: 999px;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
}

.shared-post-card__live-badge {
  left: 12px;
  padding: 6px 9px;
  background: #e11d48;
}

.shared-post-card__live-badge--ended {
  background: rgba(15, 23, 42, 0.78);
}

.shared-post-card__live-viewers {
  right: 12px;
  padding: 6px 9px;
  background: rgba(15, 23, 42, 0.72);
  backdrop-filter: blur(8px);
}

.shared-post-card__live-badge :deep(svg),
.shared-post-card__live-viewers :deep(svg) {
  width: 13px;
  height: 13px;
}

.shared-post-card__live-play {
  position: relative;
  z-index: 1;
  display: inline-flex;
  width: 52px;
  height: 52px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.42);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.52);
  color: #fff;
  backdrop-filter: blur(8px);
  transition: transform 0.16s ease, background 0.16s ease;
}

.shared-post-card__live:hover .shared-post-card__live-play {
  background: rgba(225, 29, 72, 0.88);
  transform: scale(1.06);
}

.shared-post-card__live-play :deep(svg) {
  width: 22px;
  height: 22px;
}

.shared-post-card__live-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
  padding: 11px 12px 12px;
}

.shared-post-card__live-copy strong,
.shared-post-card__live-copy span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shared-post-card__live-copy strong {
  color: var(--text-primary);
  font-size: 14px;
}

.shared-post-card__live-copy span {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 650;
}

@media (max-width: 520px) {
  .shared-post-card__live-stage {
    min-height: 150px;
  }
}
</style>
