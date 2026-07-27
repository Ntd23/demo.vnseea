<!-- Description: Renders the group profile feed composer, feed shortcuts, empty state, and posts list. -->
<template>
  <div class="space-y-4">
    <FeedPublisherBox
      v-if="canPublish"
      :group-id="group.id"
      @created="post => emit('created', post)"
    />

    <div
      v-else
      class="rounded-[18px] border border-[var(--border-light)] bg-[var(--bg-surface)] px-5 py-4 shadow-sm"
    >
      <div class="flex items-start gap-3">
        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--bg-muted)] text-[var(--bg-brand)]">
          <Icon name="i-ph-lock-key-duotone" class="h-5 w-5" />
        </span>
        <div>
          <h3 class="text-sm font-extrabold text-[var(--text-primary)]">
            {{ t("pages.groupDetailPage.joinToPostTitle") }}
          </h3>
          <p class="mt-1 text-xs font-semibold leading-5 text-[var(--text-secondary)]">
            {{ t("pages.groupDetailPage.joinToPostDescription") }}
          </p>
        </div>
      </div>
    </div>
    <div v-if="posts.length === 0" class="rounded-[24px] border border-[var(--border-light)] bg-[var(--bg-surface)] p-8 text-center shadow-sm">
      <div class="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-muted)] text-[var(--bg-brand)] mb-3">
        <Icon name="i-ph-newspaper-clipping-duotone" class="h-7 w-7" />
      </div>
      <h3 class="text-base font-extrabold text-[var(--text-primary)]">
        {{ emptyTitle || t('pages.groupDetailPage.feedEmptyTitle') }}
      </h3>
      <p class="mt-1 text-xs font-semibold text-[var(--text-secondary)]">
        {{ emptyDescription || t('pages.groupDetailPage.feedEmptyDescription') }}
      </p>
    </div>

    <template v-else>
      <FeedPostCard
        v-for="post in posts"
        :key="post.id"
        :post="post"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import FeedPostCard from "../../../feed/presentation/components/PostCard.vue"
import FeedPublisherBox from "../../../feed/presentation/components/FeedPublisherBox.vue"
import NavigationHeaderIconNav from "../../../navigation/presentation/components/HeaderIconNav.vue"
import type { FeedPostRecord } from "../../../feed/domain/types/feed.types"
import type { CommunityGroupRecord } from "../../domain/types/community.types"

const { t } = useI18n()
const translateText = useMaybeTranslatedText()

const props = defineProps<{
  group: CommunityGroupRecord
  posts: FeedPostRecord[]
  emptyTitle?: string
  emptyDescription?: string
}>()

const emptyTitle = computed(() => props.emptyTitle || "")
const emptyDescription = computed(() => props.emptyDescription || "")
const canPublish = computed(() => Boolean(props.group.canManage || props.group.joined))

const emit = defineEmits<{
  created: [post: FeedPostRecord | null]
}>()

const activityLabel = computed(() =>
  translateText(props.group.activityLabel),
)

const ownerLabel = computed(() =>
  translateText(props.group.ownerLabel),
)
</script>

<style scoped>
.group-feed__icon-nav {
  overflow: hidden;
  border: 1px solid var(--border-default);
  border-radius: 18px;
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
}
</style>
