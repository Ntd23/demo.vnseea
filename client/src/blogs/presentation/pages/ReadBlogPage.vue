<template>
  <div class="read-blog-page">
    <div
      class="read-blog-page__progress"
      :style="{ width: `${readingProgress}%` }"
      role="progressbar"
      :aria-valuenow="readingProgress"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label="Reading progress"
    />

    <BlogsReadBlogHero
      :article="article"
      :article-not-found="articleNotFound"
      :format-compact="formatCompact"
    />

    <div class="read-blog-page__layout">
      <BlogsReadBlogMain
        v-model:comment-text="commentText"
        class="read-blog-page__main"
        :article="article"
        :liked="liked"
        :displayed-likes="displayedLikes"
        :share-open="shareOpen"
        :share-url="shareUrl"
        :comments="comments"
        :format-compact="formatCompact"
        @toggle-like="liked = !liked"
        @toggle-share="shareOpen = !shareOpen"
        @add-comment="addComment"
      />

      <BlogsReadBlogSidebar
        class="read-blog-page__sidebar"
        :article="article"
        :related-articles="relatedArticles"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import BlogsReadBlogHero from "../components/ReadBlogHero.vue"
import BlogsReadBlogMain from "../components/ReadBlogMain.vue"
import BlogsReadBlogSidebar from "../components/ReadBlogSidebar.vue"
import { useReadBlogPageVM } from "../../application/view-models/useReadBlogPageVM"

const {
  article,
  articleNotFound,
  liked,
  shareOpen,
  commentText,
  comments,
  displayedLikes,
  relatedArticles,
  shareUrl,
  formatCompact,
  addComment,
  readingProgress,
} = useReadBlogPageVM()
</script>

<style scoped>
.read-blog-page {
  padding-bottom: 44px;
}

.read-blog-page__progress {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 50;
  height: 3px;
  background: linear-gradient(90deg, #0000ff, #0ea5e9);
  transition: width 0.1s ease;
}

.read-blog-page :deep(header) {
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.read-blog-page :deep(header > .relative) {
  border-radius: 0;
}

.read-blog-page__layout {
  display: grid;
  gap: 18px;
  margin-top: 18px;
}

.read-blog-page__main {
  min-width: 0;
}

.read-blog-page :deep(.blog-reader-body) {
  max-width: 760px;
  margin: 0 auto;
}

.read-blog-page :deep(.blog-body-paragraph) {
  color: #334155;
  font-size: 17px;
  line-height: 1.9;
}

.read-blog-page :deep(.first-paragraph::first-letter) {
  color: #0000ff;
}

@media (min-width: 1024px) {
  .read-blog-page__layout {
    grid-template-columns: minmax(0, 1fr) 320px;
    align-items: start;
  }

  .read-blog-page__sidebar {
    position: sticky;
    top: 82px;
  }
}
</style>
