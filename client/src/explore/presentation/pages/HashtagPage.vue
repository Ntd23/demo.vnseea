<template>
  <div class="mx-auto max-w-[1120px] space-y-4 px-3 pb-16 sm:px-5 lg:px-6">
    <section class="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface)] px-5 py-4 shadow-[var(--shadow-sm)]">
      <div class="space-y-1.5">
        <p class="text-label-secondary">
          {{ t("pages.hashtagPage.heroEyebrow") }}
        </p>
        <h1 class="text-heading text-[var(--text-primary)]">
          {{ hashtagLabel }}
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

    <div v-if="loading" class="space-y-4">
      <div
        v-for="item in 3"
        :key="item"
        class="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-sm)]"
      >
        <div class="flex items-start gap-4">
          <USkeleton class="h-12 w-12 rounded-full" />
          <div class="min-w-0 flex-1 space-y-3">
            <USkeleton class="h-5 w-44 rounded-xl" />
            <USkeleton class="h-4 w-full rounded-xl" />
            <USkeleton class="h-4 w-[80%] rounded-xl" />
            <USkeleton class="aspect-video w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>

    <section
      v-else-if="matchingPosts.length === 0"
      class="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface)] px-6 py-14 text-center shadow-[var(--shadow-sm)]"
    >
      <FoundationEmptyState
        icon="i-ph-hash-bold"
        :title="t('pages.hashtagPage.emptyTitle', { tag: hashtagLabel })"
        :description="t('pages.hashtagPage.emptyDescription', { tag: hashtagLabel })"
      />
    </section>

    <div v-else class="space-y-4">
      <FeedPostCard
        v-for="post in matchingPosts"
        :key="post.id"
        :post="post"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import FoundationEmptyState from "../../../foundation/presentation/components/EmptyState.vue"
import FeedPostCard from "../../../feed/presentation/components/PostCard.vue"
import { formatHashtagLabel, normalizeHashtagValue } from "../../../feed/application/composables/useHashtagData"
import type { FeedPostRecord } from "../../../feed/domain/types/feed.types"
import { createApiFeedRepository } from "../../../feed/infrastructure/repositories/ApiFeedRepository"

function readRouteParam(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || "")
  return typeof value === "string" ? value : ""
}

const route = useRoute()
const { t } = useI18n()
const repository = createApiFeedRepository()
const loading = ref(true)
const errorMessage = ref("")
const matchingPosts = ref<FeedPostRecord[]>([])

const rawTag = computed(() => normalizeHashtagValue(readRouteParam(route.params.tag)))
const hashtagLabel = computed(() => formatHashtagLabel(rawTag.value))

async function fetchHashtagPosts() {
  loading.value = true
  errorMessage.value = ""

  try {
    const response = await repository.getHashtag(rawTag.value, { limit: 10 })
    matchingPosts.value = response.posts
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : t("pages.hashtagPage.emptyDescription", { tag: hashtagLabel.value })
    matchingPosts.value = []
  }
  finally {
    loading.value = false
  }
}

useSeoMeta({
  title: () => t("pages.hashtagPage.seoTitle", { tag: hashtagLabel.value }),
  description: () => t("pages.hashtagPage.seoDescriptionMatch", { tag: hashtagLabel.value }),
})

watch(rawTag, async () => {
  await fetchHashtagPosts()
}, { immediate: true })
</script>
