<!-- Description: Renders hashtag results as a simple heading plus backend-backed post list in the same order as the legacy PHP page. -->
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

    <section
      v-if="loading"
      class="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface)] px-6 py-14 text-center shadow-[var(--shadow-sm)]"
    >
      <div class="flex items-center justify-center gap-3 text-sm font-bold text-[var(--text-secondary)]">
        <Icon name="i-lucide-loader-2" class="h-5 w-5 animate-spin" />
        <span>{{ t("pages.hashtagPage.heroEyebrow") }}</span>
      </div>
    </section>

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
import { useHashtagPageVM } from "../../application/view-models/useHashtagPageVM"

const { t } = useI18n()
const {
  loading,
  errorMessage,
  matchingPosts,
  rawTag,
  hashtagLabel,
  fetchHashtagPosts,
} = useHashtagPageVM()

useSeoMeta({
  title: () => t("pages.hashtagPage.seoTitle", { tag: hashtagLabel.value }),
  description: () => t("pages.hashtagPage.seoDescriptionMatch", { tag: hashtagLabel.value }),
})

watch(rawTag, async () => {
  await fetchHashtagPosts()
}, { immediate: true })
</script>
