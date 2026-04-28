<template>
  <article :id="postAnchorId" class="overflow-hidden rounded-[20px] border border-[#0000ff]/10 bg-white shadow-[0_2px_20px_rgba(0,0,255,0.06)]">
    <div class="p-4 sm:p-5">
      <FeedPostHeader
        :author="post.author"
        :role="post.role"
        :time="post.time"
        :audience="post.audience"
        :post-url="shareUrl"
        @menu-action="handleMenuAction"
      />

      <div class="mt-4">
        <p class="text-[14px] leading-7 text-slate-700">{{ post.text }}</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <NuxtLink
            v-for="tag in post.tags"
            :key="tag"
            :to="createHashtagPath(tag)"
            class="rounded-full bg-[#0000ff]/6 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#0000ff] transition hover:bg-[#0000ff] hover:text-white"
          >
            {{ formatHashtagLabel(tag) }}
          </NuxtLink>
        </div>
      </div>

      <FeedPostMediaGrid v-if="mediaItems.length" class="mt-4" :items="mediaItems" @open="onOpenMedia" />

      <div class="mt-4 flex flex-col gap-2 border-t border-[#0000ff]/8 pt-3 text-[12px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-2">
          <div class="flex -space-x-1.5">
            <span class="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full border-[3px] border-white bg-blue-500 text-[11px]">👍</span>
            <span class="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full border-[3px] border-white bg-red-500 text-[11px]">❤️</span>
            <span class="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full border-[3px] border-white bg-yellow-400 text-[11px]">😮</span>
          </div>
          <span>{{ likesCount }}</span>
        </div>
        <div class="flex flex-wrap items-center gap-3 text-[12px] text-slate-400">
          <span>{{ t("feed.postCard.commentsCount", { count: localComments.length }) }}</span>
          <span>{{ t("feed.postCard.sharesCount", { count: sharesCount }) }}</span>
        </div>
      </div>

      <UAlert
        v-if="actionState !== 'idle' && actionMessage"
        class="mt-3 rounded-[18px]"
        :color="actionState === 'error' ? 'warning' : 'success'"
        variant="subtle"
        :icon="actionState === 'error' ? 'i-ph-warning-circle-fill' : 'i-ph-check-circle-fill'"
        :description="actionMessage"
      />

      <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <UButton
          color="neutral"
          :variant="liked ? 'soft' : 'outline'"
          class="justify-center rounded-[14px] py-2.5 text-[12px] font-semibold sm:text-[13px]"
          :aria-pressed="liked"
          @click="toggleLike"
        >
          <Icon name="i-lucide-thumbs-up" class="h-4 w-4" />
          {{ liked ? t("feed.postCard.likeActive") : t("feed.postCard.like") }}
        </UButton>
        <UButton
          color="neutral"
          :variant="showComments ? 'soft' : 'outline'"
          class="justify-center rounded-[14px] py-2.5 text-[12px] font-semibold sm:text-[13px]"
          :aria-pressed="showComments"
          @click="showComments = !showComments"
        >
          <Icon name="i-lucide-message-circle" class="h-4 w-4" />
          {{ t("feed.postCard.comment") }}
        </UButton>
        <UButton
          color="neutral"
          variant="outline"
          class="justify-center rounded-[14px] py-2.5 text-[12px] font-semibold sm:text-[13px]"
          @click="showShare = true"
        >
          <Icon name="i-lucide-share-2" class="h-4 w-4" />
          {{ t("feed.postCard.share") }}
        </UButton>
      </div>

      <div class="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-400">
        <UButton
          v-for="item in quickActions"
          :key="item.key"
          color="neutral"
          variant="soft"
          size="xs"
          class="rounded-full"
          @click="handleQuickAction(item)"
        >
          {{ item.label }}
        </UButton>
      </div>

      <div v-if="localComments.length && !showComments" class="mt-3 border-t border-[#0000ff]/8 pt-3">
        <div class="flex items-start gap-2">
          <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[9px] font-bold text-slate-600">
            {{ localComments[0]?.author.split(' ').map(w => w[0]).join('') }}
          </div>
          <div class="min-w-0 rounded-2xl bg-[#f1f4fb] px-3 py-2">
            <p class="text-[12px] font-semibold text-slate-800">{{ localComments[0]?.author }}</p>
            <p class="text-[12px] leading-relaxed text-slate-600">{{ localComments[0]?.text }}</p>
          </div>
        </div>
        <button v-if="localComments.length > 1" class="ml-9 mt-1.5 text-[12px] font-semibold text-[#0000ff]/60 hover:text-[#0000ff]" type="button" @click="showComments = true">
          {{ t("feed.postCard.viewMoreComments", { count: localComments.length - 1 }) }}
        </button>
      </div>

      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
        <div v-if="showComments" class="mt-3 space-y-3 border-t border-[#0000ff]/8 pt-3">
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
import { createHashtagPath, formatHashtagLabel } from "../../application/composables/useMockHashtagData"
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

type FeedComment = { id: number; author: string; role: string; text: string }
type FeedPost = {
  id: number
  author: string
  role: string
  audience: string
  time: string
  text: string
  tags: string[]
  stats: { likes: number; comments: number; shares: number }
  media?: "double" | "single"
  comments: FeedComment[]
}

const props = defineProps<{
  post: FeedPost
}>()

const showComments = ref(false)
const showShare = ref(false)
const liked = ref(false)
const lightboxOpen = ref(false)
const currentMediaIndex = ref(0)
const localComments = ref<FeedComment[]>([])
const likesCount = ref(0)
const sharesCount = ref(0)
const actionState = ref<"idle" | "success" | "error">("idle")
const actionMessage = ref("")

const postAnchorId = computed(() => `feed-post-${props.post.id}`)

const shareUrl = computed(() =>
  new URL(`${route.path || "/"}#${postAnchorId.value}`, requestURL.origin).toString(),
)

const quickActions = computed(() => [
  { key: "hide", label: t("feed.postCard.hidePost") },
  { key: "report", label: t("feed.postCard.reportPost") },
  { key: "save", label: t("feed.postCard.savePost") },
  { key: "copy", label: t("feed.postCard.copyLink") },
  { key: "translate", label: t("feed.postCard.translatePost") },
])

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

const mediaItems = computed(() => {
  const count = props.post.media === "double" ? 2 : props.post.media ? 1 : 0
  return Array.from({ length: count }, (_, i) => ({
    type: "image" as const,
    src: `https://picsum.photos/seed/${encodeURIComponent(props.post.author)}-${i + 1}/1200/900`,
    alt: `${props.post.author} media ${i + 1}`,
  }))
})

const toggleLike = () => {
  likesCount.value += liked.value ? -1 : 1
  liked.value = !liked.value
}

const onOpenMedia = (index: number) => {
  currentMediaIndex.value = index
  lightboxOpen.value = true
}

async function submitComment(message: string) {
  const comment: FeedComment = {
    id: Date.now(),
    author: t("feed.postCard.commentAuthor"),
    role: t("feed.postCard.commentRole"),
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

function handleShared() {
  sharesCount.value += 1
  actionState.value = "success"
  actionMessage.value = t("feed.shareModal.shared")
  showShare.value = false
}

async function handleQuickAction(item: { key: string; label: string }) {
  if (item.key === "copy") {
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
  else {
    actionState.value = "success"
    actionMessage.value = item.label
  }

  toast.add({
    color: actionState.value === "error" ? "warning" : "primary",
    icon: actionState.value === "error" ? "i-ph-warning-circle-fill" : "i-ph-check-circle-fill",
    title: props.post.author,
    description: actionMessage.value,
  })
}

function handleMenuAction(action: string) {
  actionState.value = "success"
  actionMessage.value = quickActions.value.find(item => item.key === action)?.label ?? action
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
