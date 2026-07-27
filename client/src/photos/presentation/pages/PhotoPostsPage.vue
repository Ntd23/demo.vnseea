<!-- English description: Shows full feed posts that contain image media for the header photo navigation. -->
<template>
  <div class="photo-posts-page">
    <UAlert
      v-if="errorMessage"
      color="warning"
      variant="subtle"
      icon="i-ph-warning-circle-fill"
      class="rounded-[22px]"
      :description="errorMessage"
    />

    <section v-if="loading" class="photo-posts-page__state surface-card">
      <Icon name="i-lucide-loader-2" class="h-5 w-5 animate-spin" />
      <span>{{ t("pages.photosPage.heroTitle") }}</span>
    </section>

    <section v-else-if="posts.length === 0" class="photo-posts-page__state surface-card">
      <FoundationEmptyState
        icon="i-ph-images-square-duotone"
        :title="t('pages.photosPage.emptyTitle')"
        :description="t('pages.photosPage.emptyDescription')"
      />
    </section>

    <template v-else>
      <div class="photo-posts-page__posts">
        <FeedPostCard
          v-for="post in posts"
          :key="post.id"
          :post="post"
          @deleted="removePost"
          @hidden="removePost"
        />
      </div>

      <div
        v-if="!allLoaded"
        ref="loadMoreSentinel"
        class="photo-posts-page__load-more"
        aria-live="polite"
      >
        <div class="photo-posts-page__load-more-skeleton">
          <article
            v-for="index in 2"
            :key="index"
            class="photo-posts-page__post-skeleton surface-card"
          >
            <div class="photo-posts-page__post-skeleton-header">
              <USkeleton class="photo-posts-page__post-skeleton-avatar" />
              <div class="photo-posts-page__post-skeleton-copy">
                <USkeleton class="photo-posts-page__post-skeleton-line photo-posts-page__post-skeleton-line--title" />
                <USkeleton class="photo-posts-page__post-skeleton-line photo-posts-page__post-skeleton-line--meta" />
              </div>
            </div>
            <USkeleton class="photo-posts-page__post-skeleton-line photo-posts-page__post-skeleton-line--body" />
            <USkeleton class="photo-posts-page__post-skeleton-media" />
          </article>
        </div>
        <span class="sr-only">
          {{ loadingMore ? t("pages.homeFeedPage.loadingMore") : t("pages.homeFeedPage.loadMore") }}
        </span>
      </div>
      <div v-else class="photo-posts-page__load-more">
        <p class="text-caption-secondary">
          {{ t("pages.homeFeedPage.allCaughtUp") }}
        </p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import FoundationEmptyState from "../../../foundation/presentation/components/EmptyState.vue"
import FeedPostCard from "../../../feed/presentation/components/PostCard.vue"
import { usePhotoPostsPageVM } from "../../application/view-models/usePhotoPostsPageVM"

const { t } = useI18n()
const {
  loading,
  loadingMore,
  errorMessage,
  posts,
  allLoaded,
  fetchPosts,
  loadMore,
  removePost,
} = usePhotoPostsPageVM()

const loadMoreSentinel = ref<HTMLElement | null>(null)

useIntersectionObserver(
  loadMoreSentinel,
  ([entry]) => {
    if (!entry?.isIntersecting || allLoaded.value || loadingMore.value) {
      return
    }

    void loadMore()
  },
  {
    rootMargin: "600px 0px",
  },
)

await fetchPosts()
</script>

<style scoped>
.photo-posts-page,
.photo-posts-page__posts {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.photo-posts-page {
  padding-top: 8px;
}

.photo-posts-page__state {
  display: flex;
  min-height: 180px;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  color: var(--text-secondary);
  text-align: center;
}

.photo-posts-page__load-more {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 4px 0 16px;
  color: var(--text-secondary);
}

.photo-posts-page__load-more-skeleton {
  display: grid;
  gap: 16px;
}

.photo-posts-page__post-skeleton {
  display: grid;
  gap: 14px;
  padding: 18px;
}

.photo-posts-page__post-skeleton-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.photo-posts-page__post-skeleton-avatar {
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  border-radius: 999px;
}

.photo-posts-page__post-skeleton-copy {
  display: grid;
  flex: 1;
  gap: 8px;
}

.photo-posts-page__post-skeleton-line {
  height: 12px;
  border-radius: 999px;
}

.photo-posts-page__post-skeleton-line--title {
  width: min(180px, 55%);
}

.photo-posts-page__post-skeleton-line--meta {
  width: min(120px, 38%);
}

.photo-posts-page__post-skeleton-line--body {
  width: min(440px, 78%);
}

.photo-posts-page__post-skeleton-media {
  width: 100%;
  height: min(52vw, 420px);
  min-height: 240px;
  border-radius: 14px;
}
</style>
