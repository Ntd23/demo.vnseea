<template>
  <article class="saved-post-card">
    <header class="saved-post-card__header">
      <div class="saved-post-card__author">
        <img
          :src="avatarUrl"
          :alt="entry.post.author"
          class="saved-post-card__avatar"
          loading="lazy"
        >
        <div class="saved-post-card__author-copy">
          <div class="saved-post-card__author-line">
            <h2 class="saved-post-card__author-name">
              {{ entry.post.author }}
            </h2>
            <NuxtLink
              :to="entry.sourceTo"
              class="saved-post-card__follow"
            >
              {{ t("pages.savedPostsPage.follow") }}
            </NuxtLink>
          </div>
          <p class="saved-post-card__meta">
            {{ entry.post.role }} • {{ entry.post.time }}
          </p>
        </div>
      </div>

      <button
        type="button"
        class="saved-post-card__menu"
        :aria-label="t('pages.savedPostsPage.moreActions')"
      >
        <Icon name="i-ph-dots-three-bold" class="saved-post-card__menu-icon" />
      </button>
    </header>

    <p class="saved-post-card__text">
      {{ entry.post.text }}
    </p>

    <div class="saved-post-card__tags">
      <NuxtLink
        v-for="tag in entry.post.tags"
        :key="tag"
        :to="createHashtagPath(tag)"
        class="saved-post-card__tag"
      >
        {{ formatTag(tag) }}
      </NuxtLink>
    </div>

    <div v-if="mediaImage" class="saved-post-card__media">
      <img
        :src="mediaImage"
        :alt="entry.post.text"
        class="saved-post-card__image"
        loading="lazy"
      >
    </div>

    <footer class="saved-post-card__footer">
      <div class="saved-post-card__actions">
        <button
          type="button"
          class="saved-post-card__action"
        >
          <Icon name="i-lucide-thumbs-up" class="saved-post-card__action-icon" />
          <span>{{ formatCount(entry.post.stats.likes) }}</span>
        </button>
        <button
          type="button"
          class="saved-post-card__action"
        >
          <Icon name="i-lucide-message-square" class="saved-post-card__action-icon" />
          <span>{{ formatCount(entry.post.stats.comments) }}</span>
        </button>
        <button
          type="button"
          class="saved-post-card__action"
        >
          <Icon name="i-lucide-share-2" class="saved-post-card__action-icon" />
          <span>{{ t("pages.savedPostsPage.shareAction") }}</span>
        </button>
      </div>

      <button
        type="button"
        class="saved-post-card__saved"
        :title="t('pages.savedPostsPage.remove')"
        @click="$emit('remove', entry.id)"
      >
        <Icon name="i-ph-bookmark-simple-fill" class="saved-post-card__saved-icon" />
        {{ t("pages.savedPostsPage.savedAction") }}
      </button>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { createHashtagPath } from "../../../feed/application/composables/useMockHashtagData"
import type { MockSavedPostEntry } from "../../application/composables/useMockSavedPostsData"

const props = defineProps<{
  entry: MockSavedPostEntry
}>()

const { t, locale } = useI18n()

defineEmits<{
  remove: [id: string]
}>()

const avatarUrl = computed(() =>
  `https://i.pravatar.cc/96?u=saved-${encodeURIComponent(props.entry.post.author)}`,
)

const mediaImage = computed(() => {
  if (!props.entry.post.media) return ""

  return props.entry.post.id === 1
    ? "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1400&q=80"
    : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80"
})

const formatCount = (value: number) =>
  value.toLocaleString(locale.value === "vi" ? "vi-VN" : "en-US")

function formatTag(tag: string) {
  return `#${tag.toUpperCase()}`
}
</script>

<style scoped>
.saved-post-card {
  overflow: hidden;
  border: 1px solid #ccd0d5;
  border-radius: 12px;
  background: #ffffff;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
  transition: box-shadow 160ms ease, border-color 160ms ease;
}

.saved-post-card:hover {
  border-color: #bec3c9;
  box-shadow: 0 3px 10px rgba(15, 23, 42, 0.1);
}

.saved-post-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.saved-post-card__author {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
}

.saved-post-card__avatar {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 999px;
  object-fit: cover;
  border: 1px solid #ccd0d5;
}

.saved-post-card__author-copy {
  min-width: 0;
}

.saved-post-card__author-line {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
}

.saved-post-card__author-name {
  margin: 0;
  overflow: hidden;
  color: #050505;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.saved-post-card__follow {
  color: #1877f2;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.35;
}

.saved-post-card__follow:hover {
  text-decoration: underline;
}

.saved-post-card__meta {
  margin: 2px 0 0;
  overflow: hidden;
  color: #65676b;
  font-size: 12px;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.saved-post-card__menu {
  display: flex;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #65676b;
  transition: background-color 160ms ease, color 160ms ease;
}

.saved-post-card__menu:hover {
  background: #f2f2f2;
  color: #050505;
}

.saved-post-card__menu-icon {
  width: 20px;
  height: 20px;
}

.saved-post-card__text {
  margin: 16px 0 0;
  color: #050505;
  font-size: 14px;
  line-height: 1.55;
}

.saved-post-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.saved-post-card__tag {
  border-radius: 999px;
  background: #e7f3ff;
  color: #1877f2;
  padding: 5px 10px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  text-transform: uppercase;
  transition: background-color 160ms ease;
}

.saved-post-card__tag:hover {
  background: #d7eaff;
}

.saved-post-card__media {
  overflow: hidden;
  margin-top: 16px;
  border: 1px solid #ccd0d5;
  border-radius: 8px;
  background: #f0f2f5;
}

.saved-post-card__image {
  display: block;
  width: 100%;
  height: 360px;
  object-fit: cover;
}

.saved-post-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
  border-top: 1px solid #ccd0d5;
  padding-top: 10px;
}

.saved-post-card__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.saved-post-card__action,
.saved-post-card__saved {
  display: inline-flex;
  height: 34px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  padding: 0 8px;
  color: #050505;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  transition: background-color 160ms ease;
}

.saved-post-card__action:hover,
.saved-post-card__saved:hover {
  background: #f2f2f2;
}

.saved-post-card__action-icon,
.saved-post-card__saved-icon {
  width: 20px;
  height: 20px;
}

.saved-post-card__saved {
  color: #1877f2;
}

@media (max-width: 640px) {
  .saved-post-card {
    padding: 14px;
  }

  .saved-post-card__image {
    height: 240px;
  }

  .saved-post-card__footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
