<template>
  <div class="space-y-5 pb-10">
    <LiveHero
      :stats="heroStats"
      @focus-chat="focusChat"
      @go-live="goLiveOpen = true"
    />

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div class="space-y-5">
        <LivePlayer
          :joined-viewers="joinedViewers"
          :local-likes="localLikesById[selectedStream.id] ?? 0"
          :muted="muted"
          :stream="selectedStream"
          @like="likeStream"
          @toggle-mute="muted = !muted"
        />

        <section class="rounded-[30px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-md)]">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-label-secondary text-[var(--text-tertiary)]">{{ $t("pages.livePage.setupEyebrow") }}</p>
              <h2 class="mt-1 text-heading text-[var(--text-primary)]">{{ $t("pages.livePage.setupTitle") }}</h2>
              <p class="mt-1 text-body-secondary">{{ $t("pages.livePage.setupDescription") }}</p>
            </div>
            <button
              class="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-full)] border border-[var(--border-default)] bg-white px-5 text-[13px] font-extrabold text-[var(--color-primary-600)] transition hover:bg-[var(--color-primary-50)]"
              type="button"
              @click="goLiveOpen = true"
            >
              <Icon name="i-ph-video-camera-fill" class="h-4 w-4" />
              {{ $t("pages.livePage.goLive") }}
            </button>
          </div>

          <div class="mt-5 grid gap-3 md:grid-cols-3">
            <div v-for="item in readiness" :key="item.label" class="rounded-[22px] bg-[var(--bg-surface-hover)] p-4">
              <Icon :name="item.icon" class="h-6 w-6 text-[var(--color-primary-600)]" />
              <p class="mt-3 text-[14px] font-extrabold text-[var(--text-primary)]">{{ item.label }}</p>
              <p class="mt-1 text-[12px] font-semibold leading-5 text-[var(--text-secondary)]">{{ item.description }}</p>
            </div>
          </div>
        </section>
      </div>

      <div class="space-y-5">
        <LiveStreamList
          :selected-id="selectedStreamId"
          :streams="allStreams"
          @select="selectStream"
        />
        <LiveChat
          ref="chatRef"
          :comments="activeComments"
          @send="sendComment"
        />
      </div>
    </div>

    <LiveGoLiveModal
      :categories="categories"
      :open="goLiveOpen"
      @close="goLiveOpen = false"
      @create="createStream"
    />
  </div>
</template>

<script setup lang="ts">
import type { GoLivePayload, MockLiveComment, MockLiveStream } from "~/composables/useMockLiveData"

const { t } = useI18n()
const { categories, streams } = useMockLiveData()

useSeoMeta({
  title: () => t("pages.livePage.seoTitle"),
  description: () => t("pages.livePage.seoDescription"),
})

const selectedStreamId = ref(streams[0]?.id ?? "")
const muted = ref(false)
const goLiveOpen = ref(false)
const createdStreams = ref<MockLiveStream[]>([])
const localLikesById = ref<Record<string, number>>({})
const localCommentsById = ref<Record<string, MockLiveComment[]>>({})
const joinedViewers = ref(12)
const chatRef = ref<{ focusInput: () => void }>()

const allStreams = computed(() => [...createdStreams.value, ...streams])
const selectedStream = computed<MockLiveStream>(() => allStreams.value.find(stream => stream.id === selectedStreamId.value) ?? streams[0]!)

const activeComments = computed(() => [
  ...(selectedStream.value?.comments ?? []),
  ...(localCommentsById.value[selectedStream.value?.id ?? ""] ?? []),
])

const heroStats = computed(() => [
  {
    label: t("pages.livePage.statLive"),
    value: allStreams.value.filter(stream => stream.status === "live").length,
    description: t("pages.livePage.statLiveDescription"),
  },
  {
    label: t("pages.livePage.statViewers"),
    value: allStreams.value.reduce((sum, stream) => sum + stream.viewers, 0) + joinedViewers.value,
    description: t("pages.livePage.statViewersDescription"),
  },
  {
    label: t("pages.livePage.statComments"),
    value: Object.values(localCommentsById.value).reduce((sum, comments) => sum + comments.length, 0),
    description: t("pages.livePage.statCommentsDescription"),
  },
])

const readiness = computed(() => [
  {
    label: t("pages.livePage.readinessCreate"),
    icon: "i-ph-video-camera-fill",
    description: t("pages.livePage.readinessCreateDescription"),
  },
  {
    label: t("pages.livePage.readinessPlayer"),
    icon: "i-ph-play-circle-fill",
    description: t("pages.livePage.readinessPlayerDescription"),
  },
  {
    label: t("pages.livePage.readinessChat"),
    icon: "i-ph-chat-circle-dots-fill",
    description: t("pages.livePage.readinessChatDescription"),
  },
])

const selectStream = (id: string) => {
  selectedStreamId.value = id
}

const likeStream = () => {
  const id = selectedStream.value.id
  localLikesById.value = {
    ...localLikesById.value,
    [id]: (localLikesById.value[id] ?? 0) + 1,
  }
}

const sendComment = (message: string) => {
  const id = selectedStream.value.id
  const comment: MockLiveComment = {
    id: Date.now(),
    author: t("pages.livePage.you"),
    initials: t("pages.livePage.youInitials"),
    message,
    time: t("pages.livePage.justNow"),
  }

  localCommentsById.value = {
    ...localCommentsById.value,
    [id]: [...(localCommentsById.value[id] ?? []), comment],
  }
}

const createStream = (payload: GoLivePayload) => {
  const stream: MockLiveStream = {
    id: `${payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "new-live"}-${Date.now()}`,
    title: payload.title,
    status: "live",
    category: payload.category,
    cover: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80",
    host: {
      name: t("pages.livePage.you"),
      initials: t("pages.livePage.youInitials"),
      role: payload.privacy === "public"
        ? t("pages.livePage.hostRolePublic")
        : payload.privacy === "members"
          ? t("pages.livePage.hostRoleMembers")
          : t("pages.livePage.hostRolePrivate"),
      gradient: "linear-gradient(135deg,var(--color-primary-500),var(--color-accent-500))",
    },
    viewers: 1,
    likes: 0,
    startedAt: t("pages.livePage.startedJustNow"),
    duration: "00:01",
    description: payload.description || t("pages.livePage.newStreamDescription"),
    tags: ["#live", "#vnseea", `#${payload.category.toLowerCase().replace(/\s+/g, "")}`],
    comments: [
      {
        id: Date.now() + 1,
        author: t("pages.livePage.systemAuthor"),
        initials: "VN",
        message: t("pages.livePage.systemMessage"),
        time: t("pages.livePage.justNow"),
        isHost: true,
      },
    ],
  }

  createdStreams.value = [stream, ...createdStreams.value]
  selectedStreamId.value = stream.id
  joinedViewers.value += 1
}

const focusChat = () => {
  chatRef.value?.focusInput()
}
</script>
