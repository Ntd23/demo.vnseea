<!-- English description: Renders a single feed post detail view for notification and deep-link routes using the normalized feed post API. -->
<template>
  <section class="post-detail-page mt-1.5">
    <USkeleton v-if="pending" class="post-detail-page__skeleton" />

    <UAlert
      v-else-if="error || postDeleted || !post"
      color="warning"
      variant="subtle"
      icon="i-ph-warning-circle-fill"
      class="post-detail-page__alert"
      :title="t('feed.postDetail.notFoundTitle')"
      :description="t('feed.postDetail.notFoundDescription')"
    />

    <JobsJobPostDetail
      v-else-if="post.jobId"
      :post-id="post.id"
      :post-time="post.time"
    />

    <FeedPostCard v-else :post="post" @deleted="markDeleted" />
  </section>
</template>

<script setup lang="ts">
import { useFeedPostDetailPageVM } from "../../application/view-models/useFeedPostDetailPageVM"
import { usePostRealtimeStore } from "../../application/stores/usePostRealtimeStore"
import JobsJobPostDetail from "../../../jobs/presentation/components/JobPostDetail.vue"
import FeedPostCard from "../components/PostCard.vue"

const { t } = useI18n()

const props = defineProps<{
  postId: number
}>()

const postRealtimeStore = usePostRealtimeStore()
const {
  post: loadedPost,
  pending,
  error,
  markDeleted,
} = useFeedPostDetailPageVM(toRef(props, "postId"))
const post = computed(() => postRealtimeStore.snapshotFor(props.postId) ?? loadedPost.value)
const postDeleted = computed(() => postRealtimeStore.isDeleted(props.postId))
let stopPostWatch: (() => void) | null = null

function releasePostWatch() {
  stopPostWatch?.()
  stopPostWatch = null
}

function syncPostWatch() {
  releasePostWatch()
  stopPostWatch = postRealtimeStore.watchPost(props.postId)
}

onMounted(syncPostWatch)
watch(() => props.postId, syncPostWatch)
onBeforeUnmount(releasePostWatch)
</script>

<style scoped>
.post-detail-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-detail-page__skeleton {
  height: 420px;
  border-radius: var(--radius-xl);
}

.post-detail-page__alert {
  border-radius: var(--radius-xl);
}
</style>
