<!-- English description: Renders a theme-aware blog article card with category, author, and engagement details. -->
<template>
  <article class="blog-card">
    <NuxtLink :to="article.href" class="blog-card__media">
      <div class="blog-card__fallback" :style="{ background: article.imageFallback }" aria-hidden="true" />
      <img
        v-if="showCoverImage"
        :src="article.image"
        :alt="article.title"
        class="blog-card__image"
        loading="lazy"
        decoding="async"
        referrerpolicy="no-referrer"
        @error="handleImageError"
      />

      <div class="blog-card__badges">
        <span class="blog-card__category">
          <span class="blog-card__dot" :style="{ background: categoryAccentColor }" />
          {{ article.categoryLabel }}
        </span>
        <span v-if="article.mine" class="blog-card__mine">
          <Icon name="i-ph-user-fill" class="h-3 w-3" />
          {{ $t("pages.blogsPage.mineBadge") }}
        </span>
      </div>
    </NuxtLink>
    <a
      v-if="article.mine"
      :href="appRoutes.editBlog(article.id)"
      class="blog-card__edit"
      title="Chỉnh sửa bài viết"
      aria-label="Chỉnh sửa bài viết"
    >
      <Icon name="i-ph-pencil-simple-fill" class="h-3.5 w-3.5" />
    </a>

    <div class="blog-card__body">
      <NuxtLink :to="article.href" class="blog-card__title-link">
        <h3 class="blog-card__title">{{ article.title }}</h3>
      </NuxtLink>

      <p class="blog-card__excerpt">{{ article.excerpt }}</p>

      <div class="blog-card__footer">
        <div class="blog-card__author">
          <span class="blog-card__avatar">
            <NuxtImg
              v-if="article.authorAvatarUrl"
              :src="article.authorAvatarUrl"
              :alt="article.author"
              class="blog-card__avatar-image"
              width="64"
              height="64"
              sizes="32px"
              loading="lazy"
            />
            <Icon v-else name="i-ph-user-circle-fill" class="h-5 w-5" />
          </span>
          <span class="blog-card__author-copy">
            <span class="blog-card__author-name">{{ article.author }}</span>
            <span class="blog-card__date">{{ article.publishedAt }}</span>
          </span>
        </div>

        <div class="blog-card__stats">
          <span class="blog-card__read">
            <Icon name="i-ph-eye-fill" class="h-3.5 w-3.5" />
            {{ formatCompact(article.views) }}
          </span>
          <span class="blog-card__read">
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
    category?: string
    author: string
    authorAvatarUrl: string
    publishedAt: string
    views: number
    commentsCount: number
    excerpt: string
    tags: string[]
    mine?: boolean
  }
  formatCompact: (value: number) => string
}>()

const hasImageError = ref(false)

watch(() => props.article.image, (value) => {
  hasImageError.value = !value.trim()
}, { immediate: true })

const showCoverImage = computed(() => Boolean(props.article.image.trim()) && !hasImageError.value)

const handleImageError = () => {
  hasImageError.value = true
}

const categoryColorMap: Record<string, string> = {
  business: "linear-gradient(90deg,var(--bg-brand),var(--color-success))",
  vehicles: "linear-gradient(90deg,var(--color-secondary-500),var(--color-secondary-700))",
  education: "linear-gradient(90deg,var(--color-primary-300),var(--color-primary-500))",
  movies: "linear-gradient(90deg,var(--color-warning),var(--color-error))",
  gaming: "linear-gradient(90deg,var(--color-primary-400),var(--color-primary-700))",
  history: "linear-gradient(90deg,var(--color-accent-700),var(--color-accent-500))",
  lifestyle: "linear-gradient(90deg,var(--color-success),var(--bg-brand))",
  pets: "linear-gradient(90deg,var(--color-primary-200),var(--color-primary-400))",
  science: "linear-gradient(90deg,var(--color-info),var(--color-primary-300))",
  sports: "linear-gradient(90deg,var(--color-success),var(--color-info))",
  travel: "linear-gradient(90deg,var(--color-success),var(--color-secondary-400))",
  people: "linear-gradient(90deg,var(--color-accent-600),var(--color-accent-500))",
  other: "linear-gradient(90deg,var(--color-secondary-400),var(--color-secondary-600))",
}

const categoryAccentColor = computed(() =>
  categoryColorMap[props.article.category ?? ""] ?? "linear-gradient(90deg,var(--color-primary-400),var(--bg-brand))",
)
</script>

<style scoped>
.blog-card {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
  transition: transform var(--duration-fast) var(--ease-default), box-shadow var(--duration-fast) var(--ease-default), border-color var(--duration-fast) var(--ease-default);
}

.blog-card:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.blog-card__media {
  position: relative;
  display: block;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--bg-muted);
}

.blog-card__fallback,
.blog-card__image {
  position: absolute;
  inset: 0;
  height: 100%;
  width: 100%;
}

.blog-card__image {
  object-fit: cover;
  transition: transform var(--duration-slow) var(--ease-default);
}

.blog-card__media:hover .blog-card__image {
  transform: scale(1.04);
}

.blog-card__badges {
  position: absolute;
  left: var(--space-3);
  right: var(--space-3);
  top: var(--space-3);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.blog-card__category,
.blog-card__mine,
.blog-card__read {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--text-label);
  font-weight: var(--weight-extrabold);
}

.blog-card__edit {
  position: absolute;
  right: var(--space-3);
  top: var(--space-3);
  z-index: 2;
  display: inline-flex;
  height: 28px;
  width: 28px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-full);
  background: var(--bg-surface);
  color: var(--text-brand);
  box-shadow: var(--shadow-md);
  text-decoration: none;
  transition: background var(--duration-fast) var(--ease-default), transform var(--duration-fast) var(--ease-default);
}

.blog-card__edit:hover {
  background: var(--bg-surface-hover);
  transform: translateY(-1px);
}

.blog-card__category,
.blog-card__mine {
  background: var(--bg-surface);
  color: var(--text-primary);
  padding: var(--space-2) var(--space-3);
  box-shadow: var(--shadow-md);
}

.blog-card__dot {
  height: 7px;
  width: 7px;
  flex: 0 0 7px;
  border-radius: var(--radius-full);
}

.blog-card__body {
  padding: var(--space-4);
}

.blog-card__title-link {
  color: inherit;
  text-decoration: none;
}

.blog-card__title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  margin: 0;
  color: var(--text-primary);
  font-size: var(--text-title);
  font-weight: var(--weight-extrabold);
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.blog-card__excerpt {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  min-height: 42px;
  margin: var(--space-2) 0 0;
  color: var(--text-secondary);
  font-size: var(--text-body);
  font-weight: var(--weight-medium);
  line-height: 1.55;
}

.blog-card__footer,
.blog-card__stats,
.blog-card__author {
  display: flex;
  align-items: center;
}

.blog-card__footer {
  justify-content: space-between;
  gap: var(--space-3);
  margin-top: var(--space-3);
}

.blog-card__author {
  min-width: 0;
  gap: var(--space-2);
}

.blog-card__stats {
  flex: 0 0 auto;
  gap: var(--space-2);
}

.blog-card__avatar {
  display: flex;
  overflow: hidden;
  height: 32px;
  width: 32px;
  flex: 0 0 32px;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background: var(--bg-muted);
  color: var(--text-secondary);
}

.blog-card__avatar-image {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.blog-card__author-copy {
  min-width: 0;
}

.blog-card__author-name,
.blog-card__date {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.blog-card__author-name {
  color: var(--text-primary);
  font-size: var(--text-caption);
  font-weight: var(--weight-extrabold);
}

.blog-card__date {
  margin-top: 1px;
  color: var(--text-tertiary);
  font-size: var(--text-label);
  font-weight: var(--weight-semibold);
}

.blog-card__read {
  flex: 0 0 auto;
  background: var(--bg-muted);
  color: var(--text-secondary);
  padding: var(--space-2) var(--space-3);
}
</style>
