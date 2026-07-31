<template>
  <article class="blogs-featured">
    <NuxtLink :to="article.href" class="blogs-featured__media group">
      <div class="blogs-featured__fallback" :style="{ background: article.imageFallback }" />
      <img
        v-if="showCoverImage"
        :src="article.image"
        :alt="article.title"
        class="blogs-featured__image"
        loading="lazy"
        decoding="async"
        referrerpolicy="no-referrer"
        @error="handleImageError"
      />
      <span class="blogs-featured__read">
        <Icon name="i-ph-arrow-up-right-bold" class="h-4 w-4" />
      </span>
    </NuxtLink>

    <div class="blogs-featured__body">
      <div class="blogs-featured__meta">
        <span class="blogs-featured__category">
          <Icon name="i-ph-book-open-text-fill" class="h-3.5 w-3.5" />
          {{ article.categoryLabel }}
        </span>
        <span v-if="article.mine" class="blogs-featured__mine">
          <Icon name="i-ph-user-fill" class="h-3.5 w-3.5" />
          {{ $t("pages.blogsPage.mineBadge") }}
        </span>
        <a
          v-if="article.mine"
          :href="appRoutes.editBlog(article.id)"
          class="blogs-featured__edit"
          title="Chỉnh sửa bài viết"
          aria-label="Chỉnh sửa bài viết"
        >
          <Icon name="i-ph-pencil-simple-fill" class="h-3.5 w-3.5" />
        </a>
      </div>

      <NuxtLink :to="article.href" class="blogs-featured__title-link">
        <h3 class="blogs-featured__title">{{ article.title }}</h3>
      </NuxtLink>

      <p class="blogs-featured__excerpt">{{ article.excerpt }}</p>

      <div class="blogs-featured__footer">
        <div class="blogs-featured__author">
          <span class="blogs-featured__avatar">
            <NuxtImg
              v-if="showAuthorAvatar"
              :src="article.authorAvatarUrl"
              :alt="article.author"
              class="blogs-featured__avatar-image"
              width="76"
              height="76"
              sizes="38px"
              loading="lazy"
              @error="handleAvatarError"
            />
            <Icon v-else name="i-ph-user-circle-fill" class="h-6 w-6" />
          </span>
          <span class="min-w-0">
            <span class="blogs-featured__author-name">{{ article.author }}</span>
            <span class="blogs-featured__date">{{ article.publishedAt }}</span>
          </span>
        </div>

        <div class="blogs-featured__stats" aria-hidden="true">
          <span>
            <Icon name="i-ph-eye-fill" class="h-3.5 w-3.5" />
            {{ formatCompact(article.views) }}
          </span>
          <span>
            <Icon name="i-ph-chat-circle-dots-fill" class="h-3.5 w-3.5" />
            {{ formatCompact(article.commentsCount) }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"

const props = defineProps<{
  article: {
    id: number
    href: string
    image: string
    imageFallback: string
    title: string
    categoryLabel: string
    author: string
    authorAvatarUrl: string
    publishedAt: string
    views: number
    commentsCount: number
    readMinutes: number
    excerpt: string
    mine?: boolean
  }
  formatCompact: (value: number) => string
}>()

const hasImageError = ref(false)
const hasAvatarError = ref(false)

watch(() => props.article.image, (value) => {
  hasImageError.value = !value.trim()
}, { immediate: true })

const showCoverImage = computed(() => Boolean(props.article.image.trim()) && !hasImageError.value)
const showAuthorAvatar = computed(() => Boolean(props.article.authorAvatarUrl.trim()) && !hasAvatarError.value)

const handleImageError = () => {
  hasImageError.value = true
}

const handleAvatarError = () => {
  hasAvatarError.value = true
}

watch(() => props.article.authorAvatarUrl, () => {
  hasAvatarError.value = false
}, { immediate: true })
</script>

<style scoped>
.blogs-featured {
  display: grid;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 18px;
  background: var(--bg-surface);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.blogs-featured__media {
  position: relative;
  display: block;
  min-height: 260px;
  overflow: hidden;
  background: var(--bg-muted);
}

.blogs-featured__fallback,
.blogs-featured__image {
  position: absolute;
  inset: 0;
  height: 100%;
  width: 100%;
}

.blogs-featured__image {
  object-fit: cover;
  transition: transform 0.4s ease;
}

.blogs-featured__media:hover .blogs-featured__image {
  transform: scale(1.04);
}

.blogs-featured__read {
  position: absolute;
  z-index: 2;
  right: 14px;
  top: 14px;
  display: flex;
  height: 40px;
  width: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.92);
  color: var(--bg-brand);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.16);
}

.blogs-featured__body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 18px;
}

.blogs-featured__meta,
.blogs-featured__footer,
.blogs-featured__stats,
.blogs-featured__author {
  display: flex;
  align-items: center;
}

.blogs-featured__meta {
  flex-wrap: wrap;
  gap: 8px;
}

.blogs-featured__category,
.blogs-featured__mine,
.blogs-featured__stats > span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.blogs-featured__edit {
  display: inline-flex;
  height: 30px;
  width: 30px;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, var(--bg-brand) 14%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--bg-brand) 6%, transparent);
  color: var(--bg-brand);
  text-decoration: none;
  transition: background 0.15s ease, transform 0.15s ease;
}

.blogs-featured__edit:hover {
  background: color-mix(in srgb, var(--bg-brand) 12%, transparent);
  transform: translateY(-1px);
}

.blogs-featured__category {
  background: color-mix(in srgb, var(--bg-brand) 6%, transparent);
  color: var(--bg-brand);
  padding: 7px 11px;
}

.blogs-featured__mine {
  background: var(--bg-muted);
  color: var(--text-primary);
  padding: 7px 11px;
}

.blogs-featured__title-link {
  margin-top: 14px;
  color: inherit;
  text-decoration: none;
}

.blogs-featured__title {
  margin: 0;
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1.18;
}

.blogs-featured__excerpt {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  margin: 10px 0 0;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.65;
}

.blogs-featured__footer {
  justify-content: space-between;
  gap: 12px;
  margin-top: 18px;
}

.blogs-featured__author {
  min-width: 0;
  gap: 10px;
}

.blogs-featured__avatar {
  display: flex;
  overflow: hidden;
  height: 38px;
  width: 38px;
  flex: 0 0 38px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--bg-muted);
  color: var(--text-secondary);
}

.blogs-featured__avatar-image {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.blogs-featured__author-name,
.blogs-featured__date {
  display: block;
}

.blogs-featured__author-name {
  overflow: hidden;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.blogs-featured__date {
  margin-top: 2px;
  color: var(--text-tertiary);
  font-size: 12px;
  font-weight: 600;
}

.blogs-featured__stats {
  flex: 0 0 auto;
  gap: 8px;
}

.blogs-featured__stats > span {
  background: var(--bg-muted);
  color: var(--text-secondary);
  padding: 7px 9px;
}

@media (min-width: 768px) {
  .blogs-featured {
    grid-template-columns: minmax(0, 1.18fr) minmax(320px, 0.82fr);
  }

  .blogs-featured__media {
    min-height: 360px;
  }

  .blogs-featured__body {
    padding: 24px;
  }
}
</style>
