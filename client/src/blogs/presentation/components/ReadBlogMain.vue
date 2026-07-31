<!-- English description: Renders themed blog content, actions, sharing, and the article comment workflow. -->
<template>
  <section class="read-blog-main">
    <div class="read-blog-main__toolbar">
      <div class="read-blog-main__actions">
        <button
          class="read-blog-main__action"
          :class="{ 'read-blog-main__action--active': liked }"
          :aria-pressed="liked"
          type="button"
          @click="$emit('toggleLike')"
        >
          <Icon :name="liked ? 'i-ph-thumbs-up-fill' : 'i-ph-thumbs-up-duotone'" class="read-blog-main__action-icon" />
          <span>{{ formatCompact(displayedLikes) }}</span>
        </button>

        <button
          class="read-blog-main__action"
          :class="{ 'read-blog-main__action--active': shareOpen }"
          :aria-pressed="shareOpen"
          type="button"
          @click="$emit('toggleShare')"
        >
          <Icon name="i-ph-share-network-duotone" class="read-blog-main__action-icon" />
          <span>{{ $t("pages.readBlogPage.share") }}</span>
        </button>
      </div>

      <div v-if="article.tags.length > 0" class="read-blog-main__tags" aria-label="Article tags">
        <span v-for="tag in article.tags" :key="tag" class="read-blog-main__tag">
          #{{ tag }}
        </span>
      </div>
    </div>

    <div v-if="shareOpen" class="read-blog-main__share" role="status" aria-live="polite">
      <span class="read-blog-main__share-label">{{ $t("pages.readBlogPage.shareLink") }}</span>
      <span class="read-blog-main__share-url">{{ shareUrl }}</span>
    </div>

    <article class="read-blog-main__article">
      <div class="read-blog-main__body">
        <p
          v-for="(paragraph, index) in article.body"
          :key="`${index}-${paragraph}`"
          class="read-blog-main__paragraph"
          :class="{ 'read-blog-main__paragraph--lead': index === 0 }"
        >
          {{ paragraph }}
        </p>
      </div>
    </article>

    <section class="read-blog-main__comments" aria-labelledby="read-blog-comments-title">
      <div class="read-blog-main__comments-header">
        <span class="read-blog-main__comments-icon">
          <Icon name="i-ph-chat-circle-dots-fill" />
        </span>
        <div>
          <p class="read-blog-main__eyebrow">{{ $t("pages.readBlogPage.comments") }}</p>
          <h2 id="read-blog-comments-title" class="read-blog-main__comments-title">
            {{ $t("pages.readBlogPage.responses", { count: comments.length }) }}
          </h2>
        </div>
      </div>

      <div class="read-blog-main__comment-list">
        <div v-if="commentsLoading" class="read-blog-main__comments-loading" role="status" aria-live="polite">
          <Icon name="i-ph-circle-notch-bold" />
          <span>{{ $t("pages.readBlogPage.loading") }}</span>
        </div>

        <FeedCommentList
          v-else
          :comments="comments"
          enable-reply
          enable-reaction
          :current-user-name="currentUserName"
          :current-user-avatar-url="currentUserAvatarUrl"
          :comment-action-repository="commentActionRepository"
        />
      </div>

      <div class="read-blog-main__composer">
        <FeedCommentComposer
          :current-user-name="currentUserName"
          :current-user-avatar-url="currentUserAvatarUrl"
          :submitting="commenting"
          :enable-attachments="false"
          @submit="$emit('addComment', $event)"
        />
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import FeedCommentComposer from "../../../feed/presentation/components/CommentComposer.vue"
import FeedCommentList from "../../../feed/presentation/components/CommentList.vue"
import type { FeedCommentActionRepository } from "../../../feed/application/view-models/useFeedCommentItemVM"
import type { FeedCommentRecord, FeedCommentSubmitPayload } from "../../../feed/domain/types/feed.types"

defineProps<{
  article: {
    tags: string[]
    body: string[]
  }
  liked: boolean
  displayedLikes: number
  shareOpen: boolean
  shareUrl: string
  comments: FeedCommentRecord[]
  commentsLoading: boolean
  commenting: boolean
  currentUserName: string
  currentUserAvatarUrl: string
  commentActionRepository: FeedCommentActionRepository
  formatCompact: (value: number) => string
}>()

defineEmits<{
  toggleLike: []
  toggleShare: []
  addComment: [payload: FeedCommentSubmitPayload]
}>()
</script>

<style scoped>
.read-blog-main {
  display: grid;
  gap: 16px;
  min-width: 0;
}

.read-blog-main__toolbar,
.read-blog-main__article,
.read-blog-main__comments,
.read-blog-main__share {
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
}

.read-blog-main__toolbar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
}

.read-blog-main__actions,
.read-blog-main__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.read-blog-main__action {
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 38px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  padding: 0 13px;
  pointer-events: auto;
  user-select: none;
  transition: all var(--duration-fast) var(--ease-default);
}

.read-blog-main__action > * {
  pointer-events: none;
}

.read-blog-main__action:hover,
.read-blog-main__action--active {
  border-color: color-mix(in srgb, var(--bg-brand) 18%, transparent);
  background: color-mix(in srgb, var(--bg-brand) 5%, transparent);
  color: var(--bg-brand);
}

.read-blog-main__action-icon,
.read-blog-main__submit-icon {
  height: 16px;
  width: 16px;
}

.read-blog-main__tag {
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--bg-brand) 6%, transparent);
  color: var(--bg-brand);
  font-size: 12px;
  font-weight: 600;
  padding: 5px 10px;
}

.read-blog-main__share {
  display: grid;
  gap: 8px;
  padding: 12px;
}

.read-blog-main__share-label {
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 800;
}

.read-blog-main__share-url {
  overflow-wrap: anywhere;
  border-radius: var(--radius-md);
  background: var(--bg-muted);
  color: var(--text-secondary);
  font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace;
  font-size: 12px;
  line-height: 1.6;
  padding: 10px 12px;
}

.read-blog-main__article {
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  padding: 20px;
}

.read-blog-main__body {
  display: grid;
  min-width: 0;
  width: 100%;
  max-width: min(100%, 760px);
  gap: 20px;
  margin: 0 auto;
}

.read-blog-main__paragraph {
  margin: 0;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 500;
  line-height: 1.9;
  overflow-wrap: anywhere;
  word-break: break-word;
  white-space: pre-wrap;
}

.read-blog-main__paragraph--lead {
  color: var(--text-primary);
  font-size: 17px;
}

.read-blog-main__comments {
  overflow: hidden;
}

.read-blog-main__comments-header,
.read-blog-main__composer,
.read-blog-main__comments-loading {
  display: flex;
}

.read-blog-main__comments-header {
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--border-light);
  padding: 14px 16px;
}

.read-blog-main__comments-icon {
  display: flex;
  height: 34px;
  width: 34px;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--bg-brand) 6%, transparent);
  color: var(--bg-brand);
}

.read-blog-main__eyebrow {
  margin: 0;
  color: var(--text-tertiary);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.read-blog-main__comments-title {
  margin: 2px 0 0;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 800;
}

.read-blog-main__comment-list {
  display: grid;
  padding: 16px;
}

.read-blog-main__comments-loading {
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 700;
}

.read-blog-main__comments-loading :deep(svg) {
  height: 16px;
  width: 16px;
  animation: read-blog-comment-spin 0.8s linear infinite;
}

.read-blog-main__composer {
  border-top: 1px solid var(--border-light);
  padding: 16px;
}

.read-blog-main__comment-list :deep(.comment-list) {
  gap: 14px;
}

.read-blog-main__comment-list :deep(.comment-list__header) {
  align-items: center;
}

.read-blog-main__comment-list :deep(.comment-list__sort) {
  overflow: hidden;
  border-radius: var(--radius-full);
  background: var(--bg-muted);
  padding: 3px;
}

.read-blog-main__comment-list :deep(.comment-list__items) {
  display: grid;
  gap: 14px;
}

.read-blog-main__comment-list :deep(.comment-item) {
  width: 100%;
}

.read-blog-main__comment-list :deep(.comment-item__bubble) {
  max-width: min(100%, 680px);
  border: 1px solid var(--border-light);
  background: var(--bg-muted);
}

.read-blog-main__comment-list :deep(.comment-item__footer) {
  gap: 12px;
  margin-left: 10px;
  color: var(--text-secondary);
}

.read-blog-main__comment-list :deep(.comment-item__footer > span),
.read-blog-main__comment-list :deep(.comment-item__role),
.read-blog-main__comment-list :deep(.comment-item__footer-count) {
  color: var(--text-secondary);
}

.read-blog-main__comment-list :deep(.comment-item__footer-action) {
  border-radius: var(--radius-full);
  padding: 3px 7px;
}

.read-blog-main__comment-list :deep(.comment-item__footer-action:hover),
.read-blog-main__comment-list :deep(.comment-item__footer-action--active) {
  background: color-mix(in srgb, var(--bg-brand) 6%, transparent);
  color: var(--bg-brand);
}

.read-blog-main__comment-list :deep(.comment-item__replies) {
  margin-top: 10px;
  padding-left: 14px;
  border-left-color: color-mix(in srgb, var(--bg-brand) 14%, transparent);
}

.read-blog-main__comment-list :deep(.comment-item__replies .comment-composer) {
  margin-top: 12px;
}

.read-blog-main__comment-list :deep(.comment-item__replies .comment-composer__input-wrap) {
  border-color: var(--border-light);
  background: var(--bg-muted);
}

.read-blog-main__comment-list :deep(.comment-item__replies .comment-composer__input-wrap:focus-within) {
  border-color: color-mix(in srgb, var(--bg-brand) 28%, transparent);
  background: var(--bg-surface);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--bg-brand) 7%, transparent);
}

.read-blog-main__comment-list :deep(.comment-item__replies .comment-composer__textarea) {
  color: var(--text-primary);
}

.read-blog-main__comment-list :deep(.comment-item__replies .comment-composer__textarea)::placeholder {
  color: var(--text-secondary);
  opacity: 1;
}

.read-blog-main__composer :deep(.comment-composer) {
  width: 100%;
}

.read-blog-main__composer :deep(.comment-composer__shell) {
  min-width: 0;
}

.read-blog-main__composer :deep(.comment-composer__toolbar) {
  justify-content: flex-start;
}

.read-blog-main__composer :deep(.comment-composer__textarea)::placeholder {
  color: var(--text-secondary);
  opacity: 1;
}

@keyframes read-blog-comment-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (min-width: 640px) {
  .read-blog-main__toolbar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .read-blog-main__article {
    padding: 28px;
  }
}
</style>
