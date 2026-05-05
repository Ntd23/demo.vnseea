<!-- Description: Renders a normalized feed post with real backend media, like, report, and comment actions instead of mock-local content. -->
<template>
  <article :id="postAnchorId" class="post-card">
    <div class="post-card__body">
      <FeedPostHeader
        :author="post.author"
        :author-avatar-url="post.authorAvatarUrl"
        :role="post.role"
        :time="post.time"
        :audience="post.audience"
        @menu-action="handleMenuAction"
      />

      <div class="post-card__content">
        <p class="post-card__text">{{ post.text }}</p>
        <div v-if="post.tags.length" class="post-card__tags">
          <NuxtLink
            v-for="tag in post.tags"
            :key="tag"
            :to="createHashtagPath(tag)"
            class="post-card__tag"
          >
            {{ formatHashtagLabel(tag) }}
          </NuxtLink>
        </div>
      </div>

      <FeedPostMediaGrid v-if="mediaItems.length" class="post-card__media" :items="mediaItems" @open="onOpenMedia" />

      <div class="post-card__stats">
        <div class="post-card__stats-left">
          <div class="post-card__reaction-emojis">
            <span class="post-card__emoji post-card__emoji--like">👍</span>
            <span class="post-card__emoji post-card__emoji--love">❤️</span>
            <span class="post-card__emoji post-card__emoji--wow">😮</span>
          </div>
          <span class="post-card__stat-count">{{ likesCount }}</span>
        </div>
        <div class="post-card__stats-right">
          <span>{{ t("feed.postCard.commentsCount", { count: localComments.length }) }}</span>
          <span>{{ t("feed.postCard.sharesCount", { count: sharesCount }) }}</span>
        </div>
      </div>

      <div class="post-card__actions">
        <button
          class="post-card__action-btn"
          :class="{ 'post-card__action-btn--active': liked }"
          type="button"
          :aria-pressed="liked"
          @click="toggleLike"
        >
          <Icon name="i-ph-thumbs-up-fill" class="post-card__action-icon" />
          <span>{{ liked ? t("feed.postCard.likeActive") : t("feed.postCard.like") }}</span>
        </button>
        <button
          class="post-card__action-btn"
          :class="{ 'post-card__action-btn--active': showComments }"
          type="button"
          :aria-pressed="showComments"
          @click="showComments = !showComments"
        >
          <Icon name="i-ph-chat-circle-fill" class="post-card__action-icon" />
          <span>{{ t("feed.postCard.comment") }}</span>
        </button>
        <button
          class="post-card__action-btn"
          type="button"
          @click="showShare = true"
        >
          <Icon name="i-ph-share-fat-fill" class="post-card__action-icon" />
          <span>{{ t("feed.postCard.share") }}</span>
        </button>
      </div>

      <UAlert
        v-if="actionState !== 'idle' && actionMessage"
        class="mt-3 rounded-2xl"
        :color="actionState === 'error' ? 'warning' : 'success'"
        variant="subtle"
        :icon="actionState === 'error' ? 'i-ph-warning-circle-fill' : 'i-ph-check-circle-fill'"
        :description="actionMessage"
      />

      <div v-if="localComments.length && !showComments" class="post-card__comment-peek">
        <div class="post-card__comment-peek-row">
          <div class="post-card__comment-avatar">
            {{ localComments[0]?.author.split(" ").map(w => w[0]).join("") }}
          </div>
          <div class="post-card__comment-bubble">
            <p class="post-card__comment-author">{{ localComments[0]?.author }}</p>
            <p class="post-card__comment-text">{{ localComments[0]?.text }}</p>
          </div>
        </div>
        <button v-if="localComments.length > 1" class="post-card__comment-more" type="button" @click="showComments = true">
          {{ t("feed.postCard.viewMoreComments", { count: localComments.length - 1 }) }}
        </button>
      </div>

      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
        <div v-if="showComments" class="post-card__comments-full">
          <FeedCommentList :comments="localComments" />
          <FeedCommentComposer @submit="submitComment" />
        </div>
      </Transition>
    </div>

    <FeedShareModal
      :open="showShare"
      :share-url="shareUrl"
      :post="{ author: post.author, text: post.text }"
      @close="showShare = false"
      @shared="handleShared"
    />
    <FeedLightboxViewer
      :open="lightboxOpen"
      :items="mediaItems"
      :current-index="currentMediaIndex"
      :title="t('feed.postCard.lightboxTitle')"
      :description="t('feed.lightboxViewer.description', { count: mediaItems.length })"
      :author="post.author"
      :caption="post.text"
      @close="lightboxOpen = false"
      @change="currentMediaIndex = $event"
      @share="showShare = true"
      @download="downloadMedia"
      @like="toggleLike"
      @comment="showComments = true"
    />
  </article>
</template>

<script setup lang="ts">
import { createHashtagPath, formatHashtagLabel } from "../../application/composables/useHashtagData"
import { useCurrentAuthUserStore } from "../../../auth/application/stores/useCurrentAuthUserStore"
import type { FeedCommentRecord, FeedPostRecord } from "../../domain/types/feed.types"
import { createApiFeedRepository } from "../../infrastructure/repositories/ApiFeedRepository"
import FeedCommentComposer from "./CommentComposer.vue"
import FeedCommentList from "./CommentList.vue"
import FeedLightboxViewer from "./LightboxViewer.vue"
import FeedPostHeader from "./PostHeader.vue"
import FeedPostMediaGrid from "./PostMediaGrid.vue"
import FeedShareModal from "./ShareModal.vue"

const { t } = useI18n()
const route = useRoute()
const requestURL = useRequestURL()
const toast = useToast()
const currentAuthUserStore = useCurrentAuthUserStore()
const repository = createApiFeedRepository()

const props = defineProps<{
  post: FeedPostRecord
}>()

const showComments = ref(false)
const showShare = ref(false)
const liked = ref(false)
const lightboxOpen = ref(false)
const currentMediaIndex = ref(0)
const localComments = ref<FeedCommentRecord[]>([])
const likesCount = ref(0)
const sharesCount = ref(0)
const actionState = ref<"idle" | "success" | "error">("idle")
const actionMessage = ref("")
const liking = ref(false)
const commenting = ref(false)
const reporting = ref(false)

const postAnchorId = computed(() => `feed-post-${props.post.id}`)

const shareUrl = computed(() =>
  new URL(`${route.path || "/"}#${postAnchorId.value}`, requestURL.origin).toString(),
)

watch(
  () => props.post,
  (post) => {
    localComments.value = [...post.comments]
    likesCount.value = post.stats.likes
    sharesCount.value = post.stats.shares
    liked.value = false
    actionState.value = "idle"
    actionMessage.value = ""
    showComments.value = false
    showShare.value = false
    lightboxOpen.value = false
    currentMediaIndex.value = 0
  },
  { deep: true, immediate: true },
)

onMounted(async () => {
  await currentAuthUserStore.hydrate()
})

const mediaItems = computed(() => props.post.mediaItems)

async function toggleLike() {
  if (liking.value) return

  liking.value = true

  try {
    await repository.runPostAction({
      action: "like",
      postId: props.post.id,
    })
    likesCount.value += liked.value ? -1 : 1
    liked.value = !liked.value
  }
  catch (error) {
    actionState.value = "error"
    actionMessage.value = error instanceof Error ? error.message : t("feed.publisherBox.statusErrorDescription")
  }
  finally {
    liking.value = false
  }
}

const onOpenMedia = (index: number) => {
  currentMediaIndex.value = index
  lightboxOpen.value = true
}

async function submitComment(message: string) {
  if (commenting.value) return

  commenting.value = true

  try {
    await repository.runPostAction({
      action: "comment",
      postId: props.post.id,
      text: message,
    })

    const comment: FeedCommentRecord = {
      id: Date.now(),
      author: currentAuthUserStore.user?.name || t("feed.postCard.commentAuthor"),
      role: currentAuthUserStore.user?.username ? `@${currentAuthUserStore.user.username}` : t("feed.postCard.commentRole"),
      text: message,
    }

    localComments.value = [...localComments.value, comment]
    showComments.value = true
    actionState.value = "success"
    actionMessage.value = t("feed.postCard.commentAddedMessage")

    toast.add({
      color: "success",
      icon: "i-ph-chat-centered-dots-fill",
      title: props.post.author,
      description: actionMessage.value,
    })
  }
  catch (error) {
    actionState.value = "error"
    actionMessage.value = error instanceof Error ? error.message : t("feed.publisherBox.statusErrorDescription")
  }
  finally {
    commenting.value = false
  }
}

function handleShared() {
  sharesCount.value += 1
  actionState.value = "success"
  actionMessage.value = t("feed.shareModal.shared")
  showShare.value = false
}

async function handleMenuAction(action: string) {
  if (action === "open" && import.meta.client) {
    window.open(props.post.sourcePath || shareUrl.value, "_blank", "noopener,noreferrer")
    return
  }

  if (action === "copy") {
    try {
      if (!import.meta.client || typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
        throw new Error("clipboard_unavailable")
      }

      await navigator.clipboard.writeText(shareUrl.value)
      actionState.value = "success"
      actionMessage.value = shareUrl.value
    }
    catch {
      actionState.value = "error"
      actionMessage.value = shareUrl.value
    }
  }
  else if (action === "report") {
    if (reporting.value) return
    reporting.value = true

    try {
      await repository.runPostAction({
        action: "report",
        postId: props.post.id,
      })
      actionState.value = "success"
      actionMessage.value = t("feed.postHeader.menuReportLabel")
    }
    catch (error) {
      actionState.value = "error"
      actionMessage.value = error instanceof Error ? error.message : t("feed.publisherBox.statusErrorDescription")
    }
    finally {
      reporting.value = false
    }
  }

  toast.add({
    color: actionState.value === "error" ? "warning" : "primary",
    icon: actionState.value === "error" ? "i-ph-warning-circle-fill" : "i-ph-check-circle-fill",
    title: props.post.author,
    description: actionMessage.value,
  })
}

const downloadMedia = () => {
  if (!mediaItems.value[currentMediaIndex.value]) return

  actionState.value = "success"
  actionMessage.value = t("feed.postCard.lightboxDownloadMessage")

  toast.add({
    color: "primary",
    icon: "i-ph-download-simple-fill",
    title: props.post.author,
    description: actionMessage.value,
  })
}
</script>

<style scoped>
.post-card {
  overflow: hidden;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 255, 0.06);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 6px 20px rgba(0, 0, 255, 0.03);
  transition: box-shadow 0.2s ease;
}

.post-card:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05), 0 10px 28px rgba(0, 0, 255, 0.05);
}

.post-card__body {
  padding: 16px;
}

@media (min-width: 640px) {
  .post-card__body {
    padding: 20px;
  }
}

.post-card__content {
  margin-top: 14px;
}

.post-card__text {
  font-size: 14.5px;
  line-height: 1.75;
  color: #334155;
}

.post-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.post-card__tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(0, 0, 255, 0.05);
  font-size: 12px;
  font-weight: 600;
  color: #0000ff;
  transition: all 0.15s ease;
}

.post-card__tag:hover {
  background: #0000ff;
  color: #ffffff;
}

.post-card__media {
  margin-top: 14px;
}

.post-card__stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 255, 0.06);
  font-size: 13px;
  color: #64748b;
}

.post-card__stats-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.post-card__reaction-emojis {
  display: flex;
}

.post-card__emoji {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 12px;
  margin-right: -5px;
  border: 2px solid #ffffff;
  transition: transform 0.15s ease;
}

.post-card__emoji:hover {
  transform: scale(1.2);
  z-index: 2;
}

.post-card__emoji--like { background: #3b82f6; }
.post-card__emoji--love { background: #ef4444; }
.post-card__emoji--wow { background: #facc15; }

.post-card__stat-count {
  font-weight: 600;
  font-size: 13px;
}

.post-card__stats-right {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12.5px;
  color: #94a3b8;
}

.post-card__actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(0, 0, 255, 0.06);
}

.post-card__action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 4px;
  border: none;
  border-radius: 10px;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
}

.post-card__action-btn:hover {
  background: rgba(0, 0, 255, 0.04);
  color: #0000ff;
}

.post-card__action-btn--active {
  background: rgba(0, 0, 255, 0.06);
  color: #0000ff;
}

.post-card__action-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.post-card__comment-peek {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 255, 0.05);
}

.post-card__comment-peek-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.post-card__comment-avatar {
  display: flex;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e2e8f0;
  font-size: 9px;
  font-weight: 700;
  color: #475569;
}

.post-card__comment-bubble {
  min-width: 0;
  border-radius: 14px;
  background: #f1f5f9;
  padding: 8px 12px;
}

.post-card__comment-author {
  font-size: 12.5px;
  font-weight: 700;
  color: #1e293b;
}

.post-card__comment-text {
  font-size: 12.5px;
  line-height: 1.6;
  color: #475569;
  margin-top: 2px;
}

.post-card__comment-more {
  margin-left: 36px;
  margin-top: 6px;
  font-size: 12.5px;
  font-weight: 600;
  color: rgba(0, 0, 255, 0.55);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.15s ease;
}

.post-card__comment-more:hover {
  color: #0000ff;
}

.post-card__comments-full {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
