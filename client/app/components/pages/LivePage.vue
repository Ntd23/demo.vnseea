<template>
  <div class="space-y-8 pb-20 px-4 sm:px-6">
    <LiveHero
      :stats="heroStats"
      @focus-chat="focusChat"
      @go-live="goLiveOpen = true"
    />

    <div class="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div class="space-y-8 min-w-0">
        <LivePlayer
          :joined-viewers="joinedViewers"
          :local-likes="localLikesById[selectedStream.id] ?? 0"
          :muted="muted"
          :stream="selectedStream"
          @like="likeStream"
          @toggle-mute="muted = !muted"
        />

        <!-- Readiness Section -->
        <section class="surface-card p-8 sm:p-10 group overflow-hidden border-none ring-1 ring-secondary-100 shadow-xl relative bg-white">
          <div class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between relative z-10 mb-10 pb-8 border-b border-secondary-50">
            <div class="space-y-2">
              <p class="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-primary)]">{{ $t("pages.livePage.setupEyebrow") }}</p>
              <h2 class="text-3xl font-black tracking-tight text-[var(--text-primary)] leading-none">{{ $t("pages.livePage.setupTitle") }}</h2>
              <p class="text-sm font-medium text-[var(--text-primary)]">{{ $t("pages.livePage.setupDescription") }}</p>
            </div>
            <UButton
              size="xl"
              class="rounded-2xl font-black text-xs uppercase tracking-widest px-10 h-14 shadow-xl shadow-primary-500/20 bg-primary-600 hover:bg-primary-700 transition-all active:scale-95 shrink-0"
              @click="goLiveOpen = true"
            >
              <template #leading>
                <Icon name="i-ph-video-camera-duotone" class="h-6 w-6" />
              </template>
              {{ $t("pages.livePage.goLive") }}
            </UButton>
          </div>

          <div class="grid gap-6 md:grid-cols-3 relative z-10">
            <div 
              v-for="item in readiness" 
              :key="item.label" 
              class="surface-card p-6 ring-1 ring-secondary-50 bg-secondary-50/10 hover:bg-white hover:ring-primary-100 hover:shadow-xl transition-all duration-500 group/readiness"
            >
              <div class="h-12 w-12 flex items-center justify-center rounded-2xl bg-white text-[var(--text-primary)] shadow-sm ring-1 ring-secondary-100 mb-6 group-hover/readiness:scale-110 transition-transform duration-500">
                <Icon :name="item.icon.replace('-fill', '-duotone')" class="h-7 w-7" />
              </div>
              <p class="text-[14px] font-black uppercase tracking-wider text-[var(--text-primary)] mb-2">{{ item.label }}</p>
              <p class="text-[12px] font-medium leading-relaxed text-[var(--text-primary)] group-hover/readiness:text-secondary-500 transition-colors">{{ item.description }}</p>
            </div>
          </div>
        </section>
      </div>

      <div class="space-y-8">
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

    <!-- Go Live Modal -->
    <LiveGoLiveModal
      v-model:open="goLiveOpen"
      :categories="categories"
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
      gradient: "linear-gradient(135deg,#0000ff,#6366f1)",
    },
    viewers: 1,
    likes: 0,
    startedAt: t("pages.livePage.startedJustNow"),
    duration: "00:01",
    description: payload.description || t("pages.livePage.newStreamDescription"),
    tags: ["live", "vnseea", payload.category.toLowerCase().replace(/\s+/g, "")],
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
  goLiveOpen.value = false
}

const focusChat = () => {
  chatRef.value?.focusInput()
}
</script>
