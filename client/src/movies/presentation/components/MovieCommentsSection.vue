<!-- English description: Displays movie comments, reply threads, and the authenticated comment composer. -->
<template>
  <section class="movie-comments" aria-labelledby="movie-comments-title">
    <header class="movie-comments__header">
      <span class="movie-comments__icon">
        <Icon name="i-ph-chat-circle-dots-fill" />
      </span>
      <h2 id="movie-comments-title">{{ commentCount }} Bình luận</h2>
    </header>

    <div v-if="commentsLoading" class="movie-comments__loading">
      <Icon name="i-ph-circle-notch-bold" class="h-5 w-5 animate-spin" />
      <span>Đang tải bình luận</span>
    </div>

    <FeedCommentList
      v-else
      :comments="comments"
      enable-reply
      :enable-reaction="false"
      :current-user-name="currentUserName"
      :current-user-avatar-url="currentUserAvatarUrl"
      :comment-action-repository="commentActionRepository"
    />

    <div class="movie-comments__composer">
      <form class="movie-comments__form" @submit.prevent="submitComment">
        <span class="movie-comments__avatar" aria-hidden="true">
          <img
            v-if="currentUserAvatarUrl"
            :src="currentUserAvatarUrl"
            :alt="currentUserName"
          />
          <span v-else>{{ currentUserInitials }}</span>
        </span>
        <input
          v-model="commentText"
          type="text"
          placeholder="Viết bình luận và nhấn enter"
          :disabled="commenting"
        />
        <button
          type="submit"
          :disabled="commenting || !commentText.trim()"
          aria-label="Gửi bình luận"
          title="Gửi bình luận"
        >
          <Icon
            :name="
              commenting ? 'i-ph-circle-notch-bold' : 'i-ph-arrow-right-bold'
            "
            :class="{ 'animate-spin': commenting }"
          />
        </button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import FeedCommentList from "../../../feed/presentation/components/CommentList.vue";
import type { FeedCommentActionRepository } from "../../../feed/application/view-models/useFeedCommentItemVM";
import type {
  FeedCommentRecord,
  FeedCommentSubmitPayload,
} from "../../../feed/domain/types/feed.types";

const props = defineProps<{
  comments: FeedCommentRecord[];
  commentCount: number;
  commentsLoading: boolean;
  commenting: boolean;
  currentUserName: string;
  currentUserAvatarUrl: string;
  commentActionRepository: FeedCommentActionRepository;
}>();

const emit = defineEmits<{
  addComment: [payload: FeedCommentSubmitPayload];
}>();

const commentText = ref("");
const currentUserInitials = computed(() =>
  props.currentUserName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase() || "")
    .join(""),
);

const submitComment = () => {
  const text = commentText.value.trim();
  if (!text || props.commenting) return;

  emit("addComment", { text });
  commentText.value = "";
};
</script>

<style scoped>
.movie-comments {
  display: grid;
  gap: 14px;
  border: 1px solid var(--border-light);
  border-radius: 16px;
  background: var(--bg-surface);
  padding: 18px;
  box-shadow: var(--shadow-sm);
}

.movie-comments__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-light);
}

.movie-comments__icon {
  display: inline-flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--color-accent-700, var(--bg-brand));
  color: var(--color-on-brand);
}

.movie-comments__header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 800;
}

.movie-comments__loading {
  display: flex;
  min-height: 100px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 700;
}

.movie-comments__composer {
  padding-top: 12px;
  border-top: 1px solid var(--border-light);
}

.movie-comments__form {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 44px;
  align-items: center;
  gap: 10px;
}

.movie-comments__avatar {
  display: inline-flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 50%;
  background: var(--bg-surface-active);
  color: var(--color-accent-700, var(--bg-brand));
  font-size: 12px;
  font-weight: 800;
}

.movie-comments__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.movie-comments__form input {
  width: 100%;
  min-width: 0;
  height: 44px;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  background: var(--bg-surface);
  padding: 0 14px;
  color: var(--text-primary);
  font: inherit;
  font-size: 13px;
  outline: none;
}

.movie-comments__form input:focus {
  border-color: var(--color-accent-700, var(--bg-brand));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--bg-brand) 8%, transparent);
}

.movie-comments__form button {
  display: inline-flex;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 12px;
  background: var(--color-accent-700, var(--bg-brand));
  color: var(--color-on-brand);
  cursor: pointer;
  font-size: 20px;
  box-shadow: 0 4px 14px color-mix(in srgb, var(--bg-brand) 20%, transparent);
}

.movie-comments__form button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

@media (max-width: 640px) {
  .movie-comments {
    border-right: 0;
    border-left: 0;
    border-radius: 0;
    padding: 14px 12px;
  }
}
</style>
