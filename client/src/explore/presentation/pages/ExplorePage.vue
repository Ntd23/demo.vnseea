<!-- Description: Renders explore as a compact media-first discovery grid aligned to the legacy PHP explore layout. -->
<template>
  <div class="mx-auto max-w-[1120px] space-y-4 px-3 pb-16 sm:px-5 lg:px-6">
    <section class="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface)] px-5 py-4 shadow-[var(--shadow-sm)]">
      <div class="space-y-1.5">
        <p class="text-label-secondary">
          {{ t("pages.explorePage.heroEyebrow") }}
        </p>
        <h1 class="text-heading text-[var(--text-primary)]">
          {{ t("pages.explorePage.heroTitle") }}
        </h1>
      </div>
    </section>

    <UAlert
      v-if="errorMessage"
      color="warning"
      variant="subtle"
      icon="i-ph-warning-circle-fill"
      class="rounded-[22px]"
      :description="errorMessage"
    />

    <section
      v-if="loading"
      class="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface)] px-6 py-14 text-center shadow-[var(--shadow-sm)]"
    >
      <div class="flex items-center justify-center gap-3 text-sm font-bold text-[var(--text-secondary)]">
        <Icon name="i-lucide-loader-2" class="h-5 w-5 animate-spin" />
        <span>{{ t("pages.explorePage.heroEyebrow") }}</span>
      </div>
    </section>

    <section
      v-else-if="mediaPosts.length === 0"
      class="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface)] px-6 py-14 text-center shadow-[var(--shadow-sm)]"
    >
      <FoundationEmptyState
        icon="i-ph-compass-duotone"
        :title="t('pages.explorePage.emptyTitle')"
        :description="t('pages.explorePage.emptyDescription')"
      />
    </section>

    <div v-else class="grid grid-cols-2 gap-3 md:grid-cols-3">
      <article
        v-for="post in mediaPosts"
        :key="post.id"
        class="explore-tile"
      >
        <div class="explore-tile__media">
          <NuxtImg
            v-if="post.mediaItems[0]?.type === 'image' && post.mediaItems[0]?.src"
            :src="post.mediaItems[0].src"
            :alt="post.mediaItems[0].alt || post.author"
            class="explore-tile__image"
            loading="lazy"
          />
          <div
            v-else
            class="explore-tile__video"
            :style="post.mediaItems[0]?.thumb || post.mediaItems[0]?.src
              ? { backgroundImage: `url('${post.mediaItems[0]?.thumb || post.mediaItems[0]?.src}')` }
              : undefined"
          >
            <Icon name="i-ph-play-fill" class="h-9 w-9 text-white/90" />
          </div>
        </div>

        <div class="explore-tile__meta">
          <p class="explore-tile__author">{{ post.author }}</p>
          <p class="explore-tile__time">{{ post.time }}</p>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import FoundationEmptyState from "../../../foundation/presentation/components/EmptyState.vue"
import type { FeedExploreResponse } from "../../../feed/domain/types/feed.types"
import { createApiFeedRepository } from "../../../feed/infrastructure/repositories/ApiFeedRepository"

const { t } = useI18n()
const repository = createApiFeedRepository()
const loading = ref(true)
const errorMessage = ref("")
const response = ref<FeedExploreResponse>({
  posts: [],
  users: [],
  pages: [],
  hashtags: [],
  announcement: null,
})

const mediaPosts = computed(() =>
  response.value.posts.filter(post => post.mediaItems.length > 0),
)

async function fetchExplore() {
  loading.value = true
  errorMessage.value = ""

  try {
    response.value = await repository.getExplore({ limit: 18 })
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : t("pages.explorePage.emptyDescription")
  }
  finally {
    loading.value = false
  }
}

await fetchExplore()
</script>

<style scoped>
.explore-tile {
  overflow: hidden;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
}

.explore-tile__media {
  aspect-ratio: 1 / 1;
  background: var(--bg-surface-hover);
}

.explore-tile__image,
.explore-tile__video {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.explore-tile__image {
  object-fit: cover;
}

.explore-tile__video {
  background-color: #0f172a;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.explore-tile__meta {
  padding: 10px 12px 12px;
}

.explore-tile__author {
  margin: 0;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 700;
}

.explore-tile__time {
  margin: 4px 0 0;
  color: var(--text-secondary);
  font-size: 12px;
}
</style>
