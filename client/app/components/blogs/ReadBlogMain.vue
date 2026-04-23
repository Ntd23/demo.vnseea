<template>
  <section class="min-w-0 space-y-5">
    <UCard
      class="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface-hover)]"
      :ui="{ body: 'p-3' }"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap gap-2">
          <UButton
            :color="liked ? 'primary' : 'neutral'"
            :variant="liked ? 'solid' : 'soft'"
            size="lg"
            class="h-11 rounded-[var(--radius-full)] px-4 text-[13px] font-bold"
            :aria-pressed="liked"
            @click="$emit('toggleLike')"
          >
            <Icon :name="liked ? 'i-ph-thumbs-up-fill' : 'i-ph-thumbs-up'" class="h-4 w-4" />
            {{ formatCompact(displayedLikes) }}
          </UButton>
          <UButton
            color="neutral"
            variant="soft"
            size="lg"
            class="h-11 rounded-[var(--radius-full)] px-4 text-[13px] font-bold"
            :aria-pressed="shareOpen"
            @click="$emit('toggleShare')"
          >
            <Icon name="i-ph-share-network-fill" class="h-4 w-4" />
            {{ $t("pages.readBlogPage.share") }}
          </UButton>
        </div>

        <div class="flex flex-wrap gap-1.5">
          <UBadge
            v-for="tag in article.tags"
            :key="tag"
            color="primary"
            variant="subtle"
            class="rounded-[var(--radius-full)] px-2.5 py-1 text-[11px] font-bold"
          >
            #{{ tag }}
          </UBadge>
        </div>
      </div>
    </UCard>

    <UCard
      v-if="shareOpen"
      class="rounded-[22px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-sm)]"
      :ui="{ body: 'p-4' }"
      role="status"
      aria-live="polite"
    >
      <p class="text-[13px] font-bold text-[var(--text-primary)]">
        {{ $t("pages.readBlogPage.shareMockLink") }}
      </p>
      <p class="mt-2 break-all rounded-[16px] bg-[var(--bg-surface-hover)] px-3 py-2 text-[13px] text-[var(--text-secondary)]">
        {{ shareUrl }}
      </p>
    </UCard>

    <UCard
      class="rounded-[28px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-sm)]"
      :ui="{ body: 'p-5 sm:p-7' }"
    >
      <div class="blog-reader-body">
        <p
          v-for="paragraph in article.body"
          :key="paragraph"
          class="text-[16px] leading-8 text-[var(--text-primary)]"
        >
          {{ paragraph }}
        </p>
      </div>
    </UCard>

    <UCard
      class="rounded-[28px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]"
      :ui="{ body: 'p-5' }"
    >
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
          <UTextarea
            :model-value="commentText"
            autoresize
            :placeholder="$t('pages.readBlogPage.commentPlaceholder')"
            :rows="4"
            class="w-full"
            :ui="{
              base: 'min-h-[96px] resize-y rounded-[20px] border-[var(--border-default)] bg-[var(--bg-surface-hover)] px-4 py-3 text-[14px] leading-6 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]',
            }"
            @update:model-value="$emit('update:commentText', ($event ?? '') as string)"
          />
          <div class="mt-3 flex justify-end">
            <UButton
              color="primary"
              variant="solid"
              size="lg"
              class="h-10 rounded-[var(--radius-full)] px-4 text-[13px] font-bold"
              @click="$emit('addComment')"
            >
              {{ $t("pages.readBlogPage.submitComment") }}
            </UButton>
          </div>
        </div>
      </div>

      <div class="mt-5 space-y-3" role="list" aria-live="polite">
        <div
          v-for="comment in comments"
          :key="comment.id"
          class="flex gap-3 rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface-hover)] p-3"
          role="listitem"
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
    </UCard>
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
