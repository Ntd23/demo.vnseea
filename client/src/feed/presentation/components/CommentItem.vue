<!-- Description: Renders one backend-provided feed comment with PHP-parity media attachment support. -->
<template>
  <article class="comment-item">
    <NuxtLink v-if="authorPath" :to="authorPath" class="comment-item__avatar" :aria-label="author">
      <img
        v-if="authorAvatarUrl"
        :src="authorAvatarUrl"
        :alt="author"
        class="comment-item__avatar-img"
      >
      <span v-else-if="initials">{{ initials }}</span>
      <Icon v-else name="i-ph-user-circle-fill" class="h-5 w-5" />
    </NuxtLink>
    <div v-else class="comment-item__avatar" aria-hidden="true">
      <img
        v-if="authorAvatarUrl"
        :src="authorAvatarUrl"
        :alt="author"
        class="comment-item__avatar-img"
      >
      <span v-else-if="initials">{{ initials }}</span>
      <Icon v-else name="i-ph-user-circle-fill" class="h-5 w-5" />
    </div>

    <div class="comment-item__body">
      <div class="comment-item__bubble">
        <div class="comment-item__meta">
          <NuxtLink v-if="authorPath" :to="authorPath" class="comment-item__author">
            {{ author }}
          </NuxtLink>
          <p v-else class="comment-item__author">{{ author }}</p>
          <span v-if="role && role !== author" class="comment-item__role">{{ role }}</span>
        </div>
        <p v-if="text" class="comment-item__text">{{ text }}</p>
        <NuxtImg
          v-if="attachment && attachment.type !== 'audio'"
          :src="attachment.url"
          :alt="attachment.name || text || author"
          class="comment-item__image"
          loading="lazy"
          sizes="240px"
        />
        <audio
          v-else-if="attachment"
          class="comment-item__audio"
          :src="attachment.url"
          controls
        />
      </div>
      <div v-if="time" class="comment-item__footer">
        <span>{{ time }}</span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { FeedCommentAttachment } from "../../domain/types/feed.types"

const props = defineProps<{
  author: string
  authorAvatarUrl?: string
  authorPath?: string
  role: string
  text: string
  time?: string
  attachment?: FeedCommentAttachment
}>()

const initials = computed(() => {
  const value = props.author
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || "")
    .join("")

  return value
})
</script>

<style scoped>
.comment-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.comment-item__avatar {
  display: inline-flex;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 999px;
  background: #e2e8f0;
  color: #475569;
  font-size: 11px;
  font-weight: 800;
  text-decoration: none;
}

.comment-item__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.comment-item__body {
  min-width: 0;
  flex: 1;
}

.comment-item__bubble {
  display: inline-block;
  max-width: min(100%, 720px);
  border-radius: 18px;
  background: #f0f2f5;
  padding: 9px 12px;
}

.comment-item__meta {
  display: flex;
  min-width: 0;
  align-items: baseline;
  gap: 7px;
}

.comment-item__author {
  margin: 0;
  min-width: 0;
  color: #0f172a;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.25;
  text-decoration: none;
}

.comment-item__author:hover {
  text-decoration: underline;
}

.comment-item__role {
  overflow: hidden;
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comment-item__text {
  margin: 3px 0 0;
  color: #1e293b;
  font-size: 13.5px;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-item__image {
  display: block;
  width: min(240px, 100%);
  max-height: 260px;
  margin-top: 8px;
  border-radius: 14px;
  object-fit: cover;
}

.comment-item__audio {
  display: block;
  width: min(280px, 100%);
  margin-top: 8px;
}

.comment-item__footer {
  margin: 4px 0 0 12px;
  color: #94a3b8;
  font-size: 11.5px;
  font-weight: 600;
}
</style>
