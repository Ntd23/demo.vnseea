<!-- Description: Renders a normalized shared-post attachment received from either web or native message links. -->
<template>
  <NuxtLink :to="post.href" class="message-shared-post" @click.stop>
    <span class="message-shared-post__media">
      <NuxtImg
        v-if="post.imageUrl && !imageFailed"
        :src="post.imageUrl"
        :alt="post.author || unavailableLabel"
        loading="lazy"
        class="message-shared-post__image"
        @error="imageFailed = true"
      />
      <Icon v-else name="i-ph-article-duotone" class="message-shared-post__fallback-icon" />
    </span>

    <span class="message-shared-post__body">
      <span class="message-shared-post__author-row">
        <img
          v-if="post.authorAvatarUrl && post.available"
          :src="post.authorAvatarUrl"
          :alt="post.author"
          class="message-shared-post__avatar"
        >
        <span v-else class="message-shared-post__avatar-fallback">
          <Icon name="i-ph-user-bold" />
        </span>
        <strong>{{ post.available ? post.author : unavailableLabel }}</strong>
      </span>
      <span v-if="post.available && post.text" class="message-shared-post__text">
        {{ post.text }}
      </span>
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { MessageSharedPostCard } from "../../domain/types/messages.types"

const props = defineProps<{
  post: MessageSharedPostCard
}>()

const { locale } = useI18n()
const imageFailed = ref(false)
const unavailableLabel = computed(() =>
  locale.value === "vi" ? "Bài viết không khả dụng" : "Post unavailable",
)

watch(() => props.post.imageUrl, () => {
  imageFailed.value = false
})
</script>

<style scoped>
.message-shared-post {
  display: flex;
  width: min(250px, 68vw);
  max-width: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border-light);
  border-radius: 18px;
  background: var(--bg-surface);
  color: var(--text-primary);
  text-decoration: none;
  box-shadow: 0 8px 24px color-mix(in srgb, var(--text-primary) 9%, transparent);
  transition: border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
}

.message-shared-post:hover {
  border-color: color-mix(in srgb, var(--bg-brand) 35%, var(--border-light));
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.message-shared-post__media {
  display: flex;
  width: 100%;
  aspect-ratio: 4 / 3;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--bg-muted);
}

.message-shared-post__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-shared-post__fallback-icon {
  width: 34px;
  height: 34px;
  color: var(--text-tertiary);
}

.message-shared-post__body {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px 12px;
}

.message-shared-post__author-row {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 7px;
}

.message-shared-post__author-row strong {
  min-width: 0;
  overflow: hidden;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-shared-post__avatar {
  width: 30px;
  height: 30px;
  flex: 0 0 30px;
  border-radius: 999px;
  object-fit: cover;
}

.message-shared-post__avatar-fallback {
  display: inline-flex;
  width: 30px;
  height: 30px;
  flex: 0 0 30px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--bg-muted);
  color: var(--text-tertiary);
}

.message-shared-post__text {
  display: -webkit-box;
  min-width: 0;
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 12.5px;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

@media (max-width: 480px) {
  .message-shared-post {
    width: min(235px, 68vw);
  }

  .message-shared-post__body {
    padding: 9px 11px 10px;
  }
}
</style>
