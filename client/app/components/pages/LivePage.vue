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
              <p class="text-label-secondary text-[var(--text-tertiary)]">Live setup</p>
              <h2 class="mt-1 text-heading text-[var(--text-primary)]">Provider readiness</h2>
              <p class="mt-1 text-body-secondary">Agora, LiveKit hoặc Millicast sẽ thay phần player mock khi nối backend.</p>
            </div>
            <button
              class="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-full)] border border-[var(--border-default)] bg-white px-5 text-[13px] font-extrabold text-[var(--color-primary-600)] transition hover:bg-[var(--color-primary-50)]"
              type="button"
              @click="goLiveOpen = true"
            >
              <Icon name="i-ph-video-camera-fill" class="h-4 w-4" />
              Tạo live mới
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

const { categories, streams } = useMockLiveData()

useSeoMeta({
  title: "Live | VNSEEA",
  description: "Tạo livestream, xem live player và chat realtime mock trong cộng đồng VNSEEA.",
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
    label: "Đang live",
    value: allStreams.value.filter(stream => stream.status === "live").length,
    description: "Kênh đang phát trong mock data.",
  },
  {
    label: "Người xem",
    value: allStreams.value.reduce((sum, stream) => sum + stream.viewers, 0) + joinedViewers.value,
    description: "Tổng viewer đang hoạt động.",
  },
  {
    label: "Comment",
    value: Object.values(localCommentsById.value).reduce((sum, comments) => sum + comments.length, 0),
    description: "Tin nhắn gửi trong phiên này.",
  },
])

const readiness = [
  {
    label: "Tạo live stream",
    icon: "i-ph-video-camera-fill",
    description: "Form Go Live mô phỏng payload gửi về live.php.",
  },
  {
    label: "Live video player",
    icon: "i-ph-play-circle-fill",
    description: "Player có trạng thái live, mute, like và viewer count.",
  },
  {
    label: "Live chat",
    icon: "i-ph-chat-circle-dots-fill",
    description: "Comment realtime mock, sẵn sàng thay bằng socket/API.",
  },
]

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
    author: "Bạn",
    initials: "B",
    message,
    time: "Vừa xong",
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
      name: "Bạn",
      initials: "B",
      role: payload.privacy === "public" ? "Public host" : "Private host",
      gradient: "linear-gradient(135deg,var(--color-primary-500),var(--color-accent-500))",
    },
    viewers: 1,
    likes: 0,
    startedAt: "Đang live · vừa bắt đầu",
    duration: "00:01",
    description: payload.description || "Livestream mới được tạo trong phiên mock.",
    tags: ["#live", "#vnseea", `#${payload.category.toLowerCase().replace(/\s+/g, "")}`],
    comments: [
      {
        id: Date.now() + 1,
        author: "Hệ thống",
        initials: "VN",
        message: "Live stream đã được mô phỏng. Chưa gọi API live.php.",
        time: "Vừa xong",
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
