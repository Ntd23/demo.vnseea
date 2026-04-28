<template>
  <section class="min-w-0 space-y-5">
    <!-- Like / Share / Tags bar -->
    <div class="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-[var(--border-default)] bg-[var(--color-secondary-50)] px-4 py-3">
      <div class="flex flex-wrap gap-2">
        <button
          class="inline-flex items-center gap-2 rounded-[12px] px-4 py-2 text-[13px] font-bold transition-all duration-150"
          :class="liked
            ? 'bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-brand)]'
            : 'bg-white border border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--color-primary-200)] hover:text-[var(--color-primary-600)]'"
          :aria-pressed="liked"
          type="button"
          @click="$emit('toggleLike')"
        >
          <Icon :name="liked ? 'i-ph-thumbs-up-fill' : 'i-ph-thumbs-up'" class="h-4 w-4" />
          {{ formatCompact(displayedLikes) }}
        </button>

        <button
          class="inline-flex items-center gap-2 rounded-[12px] border border-[var(--border-default)] bg-white px-4 py-2 text-[13px] font-bold text-[var(--text-secondary)] transition-all duration-150 hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
          :aria-pressed="shareOpen"
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
          class="rounded-[8px] bg-[var(--color-primary-50)] px-2.5 py-1 text-[11.5px] font-semibold text-[var(--color-primary-600)]"
        >
          #{{ tag }}
        </span>
      </div>
    </div>

    <!-- Share URL card -->
    <div
      v-if="shareOpen"
      class="overflow-hidden rounded-[20px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-sm)]"
      role="status"
      aria-live="polite"
    >
      <div class="border-b border-[var(--border-light)] px-4 py-3">
        <p class="text-[12.5px] font-bold text-[var(--text-primary)]">
          {{ $t("pages.readBlogPage.shareMockLink") }}
        </p>
      </div>
      <div class="px-4 py-3">
        <p class="break-all rounded-[12px] bg-[var(--color-secondary-50)] px-3 py-2.5 font-mono text-[12px] text-[var(--text-secondary)]">
          {{ shareUrl }}
        </p>
      </div>
    </div>

    <!-- Article body -->
    <div class="rounded-[28px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-sm)]">
      <div class="px-5 py-7 sm:px-8 sm:py-9">
        <div class="blog-reader-body">
          <p
            v-for="(paragraph, idx) in article.body"
            :key="paragraph"
            class="blog-body-paragraph text-[16.5px] leading-[1.85] text-[var(--text-primary)]"
            :class="idx === 0 ? 'first-paragraph' : ''"
          >
            {{ paragraph }}
          </p>
        </div>
      </div>
    </div>

    <!-- Comments section -->
    <div class="overflow-hidden rounded-[28px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]">
      <!-- Comments header -->
      <div class="border-b border-[var(--border-light)] px-5 py-4 sm:px-6">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <span class="flex h-8 w-8 items-center justify-center rounded-[11px] bg-[var(--color-primary-50)]">
              <Icon name="i-ph-chat-circle-dots-fill" class="h-4.5 w-4.5 text-[var(--color-primary-600)]" />
            </span>
            <div>
              <p class="text-[10.5px] font-bold uppercase tracking-[0.1em] text-[var(--text-tertiary)]">
                {{ $t("pages.readBlogPage.comments") }}
              </p>
              <h2 class="text-[15px] font-extrabold tracking-[-0.02em] text-[var(--text-primary)]">
                {{ $t("pages.readBlogPage.responses", { count: comments.length }) }}
              </h2>
            </div>
          </div>
        </div>
      </div>

      <!-- Comment input -->
      <div class="border-b border-[var(--border-light)] px-5 py-4 sm:px-6">
        <div class="flex gap-3">
          <div class="avatar-md avatar-brand shrink-0 text-white">VN</div>
          <div class="min-w-0 flex-1">
            <UTextarea
              :model-value="commentText"
              autoresize
              :placeholder="$t('pages.readBlogPage.commentPlaceholder')"
              :rows="3"
              class="w-full"
              :ui="{
                base: 'min-h-[80px] resize-y rounded-[18px] border-[var(--border-default)] bg-[var(--color-secondary-50)] px-4 py-3 text-[14px] leading-[1.65] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--color-primary-300)] focus:bg-white focus:ring-2 focus:ring-[var(--color-primary-100)] transition',
              }"
              @update:model-value="$emit('update:commentText', ($event ?? '') as string)"
            />
            <div class="mt-2.5 flex justify-end">
              <button
                class="inline-flex items-center gap-2 rounded-[12px] bg-[var(--color-primary-500)] px-5 py-2.5 text-[13px] font-bold text-white shadow-[var(--shadow-brand)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]"
                type="button"
                @click="$emit('addComment')"
              >
                <Icon name="i-ph-paper-plane-right-fill" class="h-3.5 w-3.5" />
                {{ $t("pages.readBlogPage.submitComment") }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Comment list -->
      <div class="space-y-0 divide-y divide-[var(--border-light)]" role="list" aria-live="polite">
        <div
          v-for="comment in comments"
          :key="comment.id"
          class="flex gap-3 px-5 py-4 transition-colors duration-100 hover:bg-[var(--color-secondary-50)] sm:px-6"
          role="listitem"
        >
          <div
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary-200)] text-[11px] font-bold text-[var(--color-secondary-600)]"
          >
            {{ comment.initials }}
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-baseline gap-2">
              <p class="text-[13.5px] font-bold text-[var(--text-primary)]">{{ comment.author }}</p>
              <span class="text-[11.5px] text-[var(--text-tertiary)]">{{ comment.time }}</span>
            </div>
            <p class="mt-1.5 text-[13.5px] leading-[1.65] text-[var(--text-secondary)]">
              {{ comment.body }}
            </p>
          </div>
        </div>
      </div>
    </div>
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
  gap: 1.5rem;
}

.blog-body-paragraph {
  font-family: var(--font-primary);
  color: var(--text-primary);
}

/* First paragraph drop-cap effect */
.first-paragraph::first-letter {
  float: left;
  font-family: var(--font-secondary);
  font-size: 4rem;
  font-weight: 900;
  line-height: 0.85;
  margin-right: 0.1em;
  margin-top: 0.05em;
  color: var(--color-primary-600);
}
</style>
