<template>
  <div class="mx-auto max-w-[1440px] space-y-8 px-4 pb-20 pt-6 sm:px-6">
    <!-- GoPro Style Hero -->
    <LiveHero
      :stats="heroStats"
      @focus-chat="focusChat"
      @go-live="goLiveOpen = true"
    />

    <div class="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div class="space-y-8 min-w-0">
        <!-- Live Player Section -->
        <LivePlayer
          :joined-viewers="joinedViewers"
          :local-likes="localLikesById[selectedStream.id] ?? 0"
          :muted="muted"
          :stream="selectedStream"
          @like="likeStream"
          @toggle-mute="muted = !muted"
        />

        <!-- Readiness Section -->
        <section class="overflow-hidden rounded-[32px] border border-[#dbe3f2] bg-white shadow-xl">
          <div class="flex flex-col gap-6 p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between border-b border-slate-50">
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <div class="h-1 w-4 rounded-full bg-rose-600 animate-pulse" />
                <p class="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {{ $t("pages.livePage.setupEyebrow") }}
                </p>
              </div>
              <h2 class="text-[32px] font-black tracking-tight text-[#0f172a] leading-none">
                {{ $t("pages.livePage.setupTitle") }}
              </h2>
              <p class="text-[15px] font-medium text-slate-500">
                {{ $t("pages.livePage.setupDescription") }}
              </p>
            </div>
            
            <UButton
              size="xl"
              class="h-16 rounded-2xl bg-[#0f172a] px-10 font-black text-[13px] uppercase tracking-widest text-white shadow-2xl transition-all hover:-translate-y-1 active:scale-95"
              @click="goLiveOpen = true"
            >
              <template #leading>
                <Icon name="i-ph-video-camera-fill" class="h-6 w-6 text-rose-500" />
              </template>
              {{ $t("pages.livePage.goLive") }}
            </UButton>
          </div>

          <div class="grid gap-6 p-8 sm:p-10 md:grid-cols-3 bg-slate-50/50">
            <div 
              v-for="item in readiness" 
              :key="item.label" 
              class="group/item flex flex-col items-center text-center p-6 rounded-[24px] bg-white border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <div class="h-16 w-16 flex items-center justify-center rounded-[20px] bg-slate-50 text-[#0f172a] mb-6 group-hover/item:bg-primary-600 group-hover/item:text-white transition-colors">
                <Icon :name="item.icon" class="h-8 w-8" />
              </div>
              <p class="text-[14px] font-black uppercase tracking-wider text-[#0f172a] mb-2">{{ item.label }}</p>
              <p class="text-[12px] font-bold text-slate-400 leading-relaxed">{{ item.description }}</p>
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
