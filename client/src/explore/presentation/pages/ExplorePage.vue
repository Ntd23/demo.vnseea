<!-- English description: Renders the media discovery grid with theme-aware loading, empty, and error states. -->
<template>
  <div class="mt-1.5 max-w-[1120px] space-y-4">
    <UAlert
      v-if="errorMessage"
      color="warning"
      variant="subtle"
      icon="i-ph-warning-circle-fill"
      class="rounded-[var(--radius-lg)]"
      :description="errorMessage"
    />

    <div v-if="loading" class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      <div
        v-for="item in 12"
        :key="item"
        class="explore-skeleton-tile"
      >
        <USkeleton class="aspect-square w-full rounded-t-[var(--radius-md)]" />
        <div class="space-y-2 p-3">
          <USkeleton class="h-4 w-[60%] rounded-lg" />
          <USkeleton class="h-3 w-[40%] rounded-lg" />
        </div>
      </div>
    </div>

    <section
      v-else-if="mediaPosts.length === 0"
      class="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--bg-surface)] px-6 py-14 text-center shadow-[var(--shadow-sm)]"
    >
      <FoundationEmptyState
        icon="i-ph-compass-duotone"
        :title="t('pages.explorePage.emptyTitle')"
        :description="t('pages.explorePage.emptyDescription')"
      />
    </section>

    <div v-else class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      <NuxtLink
        v-for="post in mediaPosts"
        :key="post.id"
        :to="post.sourcePath"
        class="explore-tile"
      >
        <div class="explore-tile__media">
          <NuxtImg
            v-if="post.mediaItems[0]?.type === 'image' && post.mediaItems[0]?.src && !hasImageError(post.id)"
            :src="post.mediaItems[0].src"
            :alt="post.mediaItems[0].alt || post.author"
            class="explore-tile__image"
            loading="lazy"
            @error="handleImageError(post.id)"
          />
          <div
            v-else-if="post.mediaItems[0]?.type === 'image'"
            class="explore-tile__fallback"
            aria-hidden="true"
          >
            <Icon name="i-ph-image-broken-duotone" class="icon-xl icon-secondary" />
          </div>
          <div
            v-else
            class="explore-tile__video"
            :style="post.mediaItems[0]?.thumb || post.mediaItems[0]?.src
              ? { backgroundImage: `url('${post.mediaItems[0]?.thumb || post.mediaItems[0]?.src}')` }
              : undefined"
          >
            <div class="explore-tile__play-overlay">
              <Icon name="i-ph-play-fill" class="h-8 w-8 text-[var(--text-media)]" />
            </div>
          </div>
        </div>

        <div class="explore-tile__meta">
          <p class="explore-tile__author">{{ post.author }}</p>
          <p class="explore-tile__time">{{ formatDisplayTime(post.time) }}</p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import FoundationEmptyState from "../../../foundation/presentation/components/EmptyState.vue"
import { formatUnixDateTime } from "../../../shared-kernel/application/utils/format-unix-date-time"
import { useExplorePageVM } from "../../application/view-models/useExplorePageVM"

const { t, locale } = useI18n()
const { loading, errorMessage, mediaPosts } = useExplorePageVM()
const failedImageIds = ref<Set<number>>(new Set())

const formatDisplayTime = (value: string | number | null | undefined) =>
  formatUnixDateTime(value, locale.value)

const hasImageError = (postId: number) => failedImageIds.value.has(postId)

const handleImageError = (postId: number) => {
  failedImageIds.value = new Set(failedImageIds.value).add(postId)
}
</script>

<style scoped>
.explore-tile,
.explore-skeleton-tile {
  display: block;
  overflow: hidden;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
  transition: transform var(--duration-fast) var(--ease-default), box-shadow var(--duration-fast) var(--ease-default);
  text-decoration: none;
}

.explore-tile:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.explore-tile__media {
  position: relative;
  aspect-ratio: 1 / 1;
  background: var(--bg-surface-hover);
  overflow: hidden;
}

.explore-tile__fallback {
  display: flex;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
  background: var(--bg-surface-hover);
}

.explore-tile__image,
.explore-tile__video {
  display: block;
  width: 100%;
  height: 100%;
}

.explore-tile__image {
  object-fit: cover;
}

.explore-tile__video {
  background-color: var(--bg-media);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.explore-tile__play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--bg-media) 20%, transparent);
  backdrop-filter: blur(2px);
  transition: background var(--duration-fast) var(--ease-default);
}

.explore-tile:hover .explore-tile__play-overlay {
  background: color-mix(in srgb, var(--bg-media) 40%, transparent);
}

.explore-tile__meta {
  padding: 10px 12px 12px;
}

.explore-tile__author {
  margin: 0;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.explore-tile__time {
  margin: 4px 0 0;
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 500;
}
</style>
