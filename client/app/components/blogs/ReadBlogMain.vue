<template>
  <section class="min-w-0 space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface-hover)] p-3">
      <div class="flex flex-wrap gap-2">
        <button
          class="inline-flex h-11 items-center gap-2 rounded-[var(--radius-full)] px-4 text-[13px] font-bold transition"
          :class="liked
            ? 'bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-brand)]'
            : 'bg-white text-[var(--text-secondary)] hover:text-[var(--color-primary-600)]'"
          type="button"
          @click="$emit('toggleLike')"
        >
          <Icon :name="liked ? 'i-ph-thumbs-up-fill' : 'i-ph-thumbs-up'" class="h-4 w-4" />
          {{ formatCompact(displayedLikes) }}
        </button>
        <button
          class="inline-flex h-11 items-center gap-2 rounded-[var(--radius-full)] bg-white px-4 text-[13px] font-bold text-[var(--text-secondary)] transition hover:text-[var(--color-primary-600)]"
          type="button"
          @click="$emit('toggleShare')"
        >
          <Icon name="i-ph-share-network-fill" class="h-4 w-4" />
          {{ $t("pages.readBlogPage.share") }}
        </button>
      </div>

      <div class="flex flex-wrap gap-1.5">
        <span
          v-for="tag in article.tags"
          :key="tag"
          class="rounded-[var(--radius-full)] bg-[var(--color-primary-50)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-primary-600)]"
        >
          #{{ tag }}
        </span>
      </div>
    </div>

    <div
      v-if="shareOpen"
      class="rounded-[22px] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-sm)]"
    >
      <p class="text-[13px] font-bold text-[var(--text-primary)]">
        {{ $t("pages.readBlogPage.shareMockLink") }}
      </p>
      <p class="mt-2 break-all rounded-[16px] bg-[var(--bg-surface-hover)] px-3 py-2 text-[13px] text-[var(--text-secondary)]">
        {{ shareUrl }}
      </p>
    </div>

    <div class="blog-reader-body rounded-[28px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-sm)] sm:p-7">
      <p
        v-for="paragraph in article.body"
        :key="paragraph"
        class="text-[16px] leading-8 text-[var(--text-primary)]"
      >
        {{ paragraph }}
      </p>
    </div>

    <section class="rounded-[28px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-md)]">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-label-secondary text-[var(--color-primary-600)]">
            {{ $t("pages.readBlogPage.comments") }}
          </p>
          <h2 class="mt-1 text-heading text-[var(--text-primary)]">
            {{ $t("pages.readBlogPage.responses", { count: comments.length }) }}
          </h2>
        </div>
      </div>

      <div class="mt-4 flex gap-3">
        <div class="avatar-md avatar-brand shrink-0">VN</div>
        <div class="min-w-0 flex-1">
          <textarea
            :value="commentText"
            class="min-h-[96px] w-full resize-y rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface-hover)] px-4 py-3 text-[14px] leading-6 text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--color-primary-500)] focus:bg-white focus:ring-4 focus:ring-[var(--bg-surface-active)]"
            :placeholder="$t('pages.readBlogPage.commentPlaceholder')"
            @input="$emit('update:commentText', ($event.target as HTMLTextAreaElement).value)"
          />
          <div class="mt-3 flex justify-end">
            <button
              class="inline-flex h-10 items-center rounded-[var(--radius-full)] bg-[var(--color-primary-500)] px-4 text-[13px] font-bold text-white shadow-[var(--shadow-brand)] transition hover:-translate-y-0.5"
              type="button"
              @click="$emit('addComment')"
            >
              {{ $t("pages.readBlogPage.submitComment") }}
            </button>
          </div>
        </div>
      </div>

      <div class="mt-5 space-y-3">
        <div
          v-for="comment in comments"
          :key="comment.id"
          class="flex gap-3 rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface-hover)] p-3"
        >
          <div class="avatar-md avatar-muted shrink-0">
            {{ comment.initials }}
          </div>
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <p class="text-[13px] font-bold text-[var(--text-primary)]">
                {{ comment.author }}
              </p>
              <span class="text-caption-secondary">{{ comment.time }}</span>
            </div>
            <p class="mt-1 text-[13px] leading-6 text-[var(--text-secondary)]">
              {{ comment.body }}
            </p>
          </div>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  article: {
    tags: string[]
    body: string[]
  }
  liked: boolean
  displayedLikes: number
  shareOpen: boolean
  shareUrl: string
  commentText: string
  comments: Array<{
    id: number
    author: string
    initials: string
    time: string
    body: string
  }>
  formatCompact: (value: number) => string
}>()

defineEmits<{
  toggleLike: []
  toggleShare: []
  addComment: []
  "update:commentText": [value: string]
}>()
</script>

<style scoped>
.blog-reader-body {
  display: grid;
  gap: 1.2rem;
}
</style>
