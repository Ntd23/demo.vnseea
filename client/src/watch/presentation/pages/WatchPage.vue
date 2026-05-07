<!-- Description: Renders the watch route as a simple content-first video post list aligned to the legacy PHP watch page order. -->
<template>
  <div class="mx-auto max-w-[1120px] space-y-4 px-3 pb-10 sm:px-5 lg:px-6">
    <section class="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface)] px-5 py-4 shadow-[var(--shadow-sm)]">
      <div class="space-y-1.5">
        <p class="text-label-secondary">
          {{ t("pages.watchPage.heroEyebrow") }}
        </p>
        <h1 class="text-heading text-[var(--text-primary)]">
          {{ t("pages.watchPage.heroTitle") }}
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
      v-if="loading && posts.length === 0"
      class="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface)] px-6 py-14 text-center shadow-[var(--shadow-sm)]"
    >
      <div class="flex items-center justify-center gap-3 text-sm font-bold text-[var(--text-secondary)]">
        <Icon name="i-lucide-loader-2" class="h-5 w-5 animate-spin" />
        <span>{{ t("pages.watchPage.heroTitle") }}</span>
      </div>
    </section>

    <section
      v-else-if="posts.length === 0"
      class="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface)] px-6 py-14 text-center shadow-[var(--shadow-sm)]"
    >
      <FoundationEmptyState
        icon="i-ph-video-camera-duotone"
        :title="t('pages.watchPage.emptyTitle')"
        :description="t('pages.watchPage.emptyDescription')"
      />
    </section>

    <div v-else class="space-y-4">
      <FeedPostCard
        v-for="post in posts"
        :key="post.id"
        :post="post"
      />
    </div>

    <div v-if="posts.length > 0" class="flex justify-center pt-2">
      <UButton
        v-if="hasMore"
        color="primary"
        variant="soft"
        class="rounded-full"
        :loading="loadingMore"
        @click="loadMore"
      >
        {{ t("pages.homeFeedPage.loadMore") }}
      </UButton>
      <p v-else class="text-caption-secondary">
        {{ t("pages.homeFeedPage.allCaughtUp") }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import FoundationEmptyState from "../../../foundation/presentation/components/EmptyState.vue"
import FeedPostCard from "../../../feed/presentation/components/PostCard.vue"
import type { FeedPostRecord } from "../../../feed/domain/types/feed.types"
import { createApiFeedRepository } from "../../../feed/infrastructure/repositories/ApiFeedRepository"

const { t } = useI18n()
const repository = createApiFeedRepository()

const loading = ref(true)
const loadingMore = ref(false)
const errorMessage = ref("")
const posts = ref<FeedPostRecord[]>([])
const hasMore = ref(false)
const nextOffset = ref<number | null>(null)

async function fetchVideos(reset = true) {
  errorMessage.value = ""

  try {
    const response = await repository.getVideos({
      limit: 10,
      afterPostId: reset ? undefined : nextOffset.value ?? undefined,
    })

    hasMore.value = response.hasMore
    nextOffset.value = response.nextOffset

    posts.value = reset
      ? response.posts
      : [...posts.value, ...response.posts.filter(post => !posts.value.some(existing => existing.id === post.id))]
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : t("pages.watchPage.emptyDescription")
  }
  finally {
    loading.value = false
    loadingMore.value = false
  }
}

async function loadMore() {
  if (!hasMore.value || loadingMore.value) return

  loadingMore.value = true
  await fetchVideos(false)
}

useSeoMeta({
  title: () => t("pages.watchPage.seoTitle"),
  description: () => t("pages.watchPage.seoDescription"),
})

await fetchVideos(true)
</script>
