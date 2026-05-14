<!-- Description: Displays real backend comments with compact sorting and optional inline reply threads. -->
<template>
  <section class="comment-list">
    <div class="comment-list__header">
      <p class="comment-list__title">{{ t("feed.commentList.title") }}</p>
      <div v-if="comments.length > 1" class="comment-list__sort">
        <UButton
          color="neutral"
          :variant="sort === 'top' ? 'soft' : 'ghost'"
          size="xs"
          class="rounded-full"
          @click="sort = 'top'"
        >
          {{ t("feed.commentList.sortTop") }}
        </UButton>
        <UButton
          color="neutral"
          :variant="sort === 'newest' ? 'soft' : 'ghost'"
          size="xs"
          class="rounded-full"
          @click="sort = 'newest'"
        >
          {{ t("feed.commentList.sortNewest") }}
        </UButton>
      </div>
    </div>

    <UAlert
      v-if="visibleComments.length === 0"
      class="comment-list__empty"
      color="neutral"
      variant="soft"
      icon="i-ph-chat-centered-dots"
      :description="t('feed.commentList.emptyDescription')"
    />

    <div v-else class="comment-list__items">
      <FeedCommentItem
        v-for="comment in visibleComments"
        :key="comment.id"
        :id="comment.id"
        :author="comment.author"
        :author-avatar-url="comment.authorAvatarUrl"
        :author-path="comment.authorPath"
        :role="comment.role"
        :text="comment.text"
        :time="comment.time"
        :attachment="comment.attachment"
        :reactions-count="comment.reactionsCount"
        :selected-reaction="comment.selectedReaction"
        :replies="comment.replies"
        :replies-count="comment.repliesCount"
        :enable-reply="enableReply"
        :enable-reaction="enableReaction"
        :current-user-name="currentUserName"
        :current-user-avatar-url="currentUserAvatarUrl"
        :comment-action-repository="commentActionRepository"
      />
    </div>

    <UButton
      v-if="visibleComments.length < sortedComments.length"
      color="neutral"
      variant="ghost"
      size="sm"
      class="comment-list__more"
      @click="visibleCount += 5"
    >
      {{ t("feed.commentList.loadMore") }}
    </UButton>
  </section>
</template>

<script setup lang="ts">
import type { FeedCommentRecord } from "../../domain/types/feed.types"
import type { FeedCommentActionRepository } from "../../application/view-models/useFeedCommentItemVM"
import FeedCommentItem from "./CommentItem.vue"

const { t } = useI18n()

const props = withDefaults(defineProps<{
  comments: FeedCommentRecord[]
  enableReply?: boolean
  enableReaction?: boolean
  currentUserName?: string
  currentUserAvatarUrl?: string
  commentActionRepository?: FeedCommentActionRepository
}>(), {
  enableReaction: true,
})

const sort = ref<"top" | "newest">("top")
const visibleCount = ref(3)

watch(
  () => props.comments.length,
  (count) => {
    visibleCount.value = Math.min(Math.max(visibleCount.value, 3), Math.max(count, 3))
  },
  { immediate: true },
)

const sortedComments = computed<FeedCommentRecord[]>(() =>
  sort.value === "newest" ? [...props.comments].reverse() : props.comments,
)

const visibleComments = computed(() =>
  sortedComments.value.slice(0, visibleCount.value),
)
</script>

<style scoped>
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-list__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.comment-list__title {
  margin: 0;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.comment-list__sort {
  display: flex;
  align-items: center;
  gap: 4px;
}

.comment-list__empty {
  border-radius: 16px;
}

.comment-list__items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.comment-list__more {
  align-self: flex-start;
  border-radius: 999px;
  font-weight: 700;
}
</style>
