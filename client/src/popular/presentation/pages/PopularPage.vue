<!-- Description: Renders popular posts as a simple legacy-style ranked feed list without extra dashboard sections or sidebar widgets. -->
<template>
  <div class="mx-auto max-w-[1120px] space-y-4 px-3 pb-16 sm:px-5 lg:px-6">
    <section class="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface)] px-5 py-4 shadow-[var(--shadow-sm)]">
      <div class="space-y-1.5">
        <p class="text-label-secondary">
          {{ t("pages.popularPage.heroEyebrow") }}
        </p>
        <h1 class="text-heading text-[var(--text-primary)]">
          {{ t("pages.popularPage.heroTitle") }}
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
        <span>{{ t("pages.popularPage.heroEyebrow") }}</span>
      </div>
    </section>

    <section
      v-else-if="posts.length === 0"
      class="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface)] px-6 py-14 text-center shadow-[var(--shadow-sm)]"
    >
      <FoundationEmptyState
        icon="i-ph-fire-duotone"
        :title="t('pages.popularPage.emptyTitle')"
        :description="t('pages.popularPage.emptyDescription')"
      />
    </section>

    <div v-else class="space-y-4">
      <article
        v-for="(post, index) in posts"
        :key="post.id"
        class="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 shadow-[var(--shadow-sm)]"
      >
        <div class="mb-3 flex items-center gap-3 rounded-[14px] bg-[var(--bg-surface-hover)] px-3 py-2">
          <div class="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[var(--bg-brand)] text-[13px] font-extrabold text-[var(--text-inverse)]">
            {{ formatRank(index + 1) }}
          </div>
          <div class="min-w-0">
            <p class="text-[14px] font-bold text-[var(--text-primary)]">
              {{ post.author }}
            </p>
            <p class="text-[12px] text-[var(--text-secondary)]">
              {{ post.time }}
            </p>
          </div>
        </div>

        <FeedPostCard :post="post" />
      </article>
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
const errorMessage = ref("")
const posts = ref<FeedPostRecord[]>([])

const formatRank = (value: number) => String(value).padStart(2, "0")

async function fetchPopularPosts() {
  loading.value = true
  errorMessage.value = ""

  try {
    const response = await repository.getPopular({ limit: 20 })
    posts.value = response.posts
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : t("pages.popularPage.emptyDescription")
  }
  finally {
    loading.value = false
  }
}

useSeoMeta({
  title: () => t("pages.popularPage.seoTitle"),
  description: () => t("pages.popularPage.seoDescription"),
})

await fetchPopularPosts()
</script>
