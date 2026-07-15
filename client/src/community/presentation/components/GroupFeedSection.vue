<!-- Description: Renders the group profile feed composer, feed shortcuts, empty state, and posts list. -->
<template>
  <div class="space-y-4">
    <FeedPublisherBox
      :group-id="group.id"
      @created="post => emit('created', post)"
    />

    <ClientOnly>
      <div class="group-feed__icon-nav">
        <NavigationHeaderIconNav />
      </div>
    </ClientOnly>

    <UAlert
      v-if="posts.length === 0"
      color="neutral"
      variant="subtle"
      icon="i-ph-newspaper-clipping-bold"
      :title="emptyTitle || t('pages.groupDetailPage.feedEmptyTitle')"
      :description="emptyDescription || t('pages.groupDetailPage.feedEmptyDescription')"
      class="rounded-[24px]"
    />

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
