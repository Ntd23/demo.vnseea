<template>
  <div class="pb-10">
    <div
      class="fixed left-0 top-0 z-50 h-[3px] bg-[linear-gradient(90deg,var(--color-primary-500),#7c3aed)] transition-all duration-100"
      :style="{ width: `${readingProgress}%` }"
      role="progressbar"
      :aria-valuenow="readingProgress"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label="Reading progress"
    />

    <div class="overflow-hidden rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-lg)]">
      <BlogsPresentationReadHero
        :article="article"
        :article-not-found="articleNotFound"
        :format-compact="formatCompact"
      />

      <div class="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:p-6">
        <BlogsPresentationReadMain
          v-model:comment-text="commentText"
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

        <BlogsPresentationReadSidebar
          :article="article"
          :related-articles="relatedArticles"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useReadBlogPage } from "../../application/composables/useReadBlogPage"
import BlogsPresentationReadHero from "../components/ReadBlogHero.vue"
import BlogsPresentationReadMain from "../components/ReadBlogMain.vue"
import BlogsPresentationReadSidebar from "../components/ReadBlogSidebar.vue"

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
} = useReadBlogPage()
</script>
