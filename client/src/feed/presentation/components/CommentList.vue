<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <p class="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#0000ff]/50">{{ t("feed.commentList.title") }}</p>
      <div class="flex items-center gap-2 text-[12px] font-semibold text-slate-500">
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
      class="rounded-[18px]"
      color="neutral"
      variant="subtle"
      icon="i-ph-chat-centered-dots"
      :title="t('feed.commentList.title')"
      :description="t('feed.commentList.emptyDescription')"
    />

    <FeedCommentItem
      v-for="comment in visibleComments"
      :key="comment.id"
      :author="comment.author"
      :role="comment.role"
      :text="comment.text"
    />

    <UButton
      v-if="visibleComments.length < sortedComments.length"
      color="neutral"
      variant="outline"
      size="sm"
      class="mx-auto block rounded-full"
      @click="visibleCount += 3"
    >
      {{ t("feed.commentList.loadMore") }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
import FeedCommentItem from "./CommentItem.vue"

const { t } = useI18n()

type FeedComment = { id: number; author: string; role: string; text: string }

const props = defineProps<{
  comments: { id: number; author: string; role: string; text: string }[]
}>()

const sort = ref<"top" | "newest">("top")
const visibleCount = ref(2)

watch(
  () => props.comments.length,
  (count) => {
    visibleCount.value = Math.min(Math.max(visibleCount.value, 2), Math.max(count, 2))
  },
  { immediate: true },
)

const sortedComments = computed<FeedComment[]>(() =>
  sort.value === "newest" ? [...props.comments].reverse() : props.comments,
)

const visibleComments = computed(() =>
  sortedComments.value.slice(0, visibleCount.value),
)
</script>
