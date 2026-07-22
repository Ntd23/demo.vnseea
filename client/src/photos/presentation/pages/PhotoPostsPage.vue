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

      <div class="photo-posts-page__load-more">
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
  hasMore,
  fetchPosts,
  loadMore,
  removePost,
} = usePhotoPostsPageVM()

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
  justify-content: center;
  padding: 4px 0 16px;
}
</style>
