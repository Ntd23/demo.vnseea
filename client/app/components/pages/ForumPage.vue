<template>
  <div class="space-y-5 pb-10">
    <ForumHero
      :stats="heroStats"
      @create-thread="createOpen = true"
    />

    <ForumFilters
      v-model:search="search"
      v-model:selected-section="selectedSection"
      :sections="sections"
    />

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      <main class="space-y-4">
        <div class="rounded-[30px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-md)]">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-label-secondary text-[var(--text-tertiary)]">Threads</p>
              <h2 class="mt-1 text-heading text-[var(--text-primary)]">{{ resultHeading }}</h2>
              <p class="mt-1 text-body-secondary">{{ filteredThreads.length }} thread phù hợp</p>
            </div>
            <button
              class="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-full)] border border-[var(--border-default)] bg-white px-5 text-[13px] font-extrabold text-[var(--color-primary-600)]"
              type="button"
              @click="createOpen = true"
            >
              <Icon name="i-ph-plus-circle-fill" class="h-4 w-4" />
              Thread mới
            </button>
          </div>
        </div>

        <ForumThreadCard
          v-for="thread in filteredThreads"
          :key="thread.id"
          :local-reply-count="localRepliesById[thread.id]?.length ?? 0"
          :selected="thread.id === selectedThread.id"
          :thread="thread"
          @select="selectedThreadId = $event"
        />

        <div v-if="filteredThreads.length === 0" class="rounded-[30px] border border-dashed border-[var(--border-default)] bg-white p-8 text-center shadow-[var(--shadow-md)]">
          <Icon name="i-ph-chats-circle-fill" class="mx-auto h-12 w-12 text-[var(--color-primary-600)]" />
          <h3 class="mt-3 text-xl font-black text-[var(--text-primary)]">Không tìm thấy thread</h3>
          <p class="mt-2 text-body-secondary">Thử đổi section hoặc từ khóa tìm kiếm.</p>
        </div>
      </main>

      <div class="space-y-5">
        <ForumThreadDetail
          :replies="activeReplies"
          :thread="selectedThread"
          @reply="sendReply"
        />
        <ForumStatsSidebar
          :counts="sectionCounts"
          :sections="sections"
          @select-section="selectedSection = $event"
        />
      </div>
    </div>

    <ForumCreateThreadModal
      :open="createOpen"
      :sections="sections"
      @close="createOpen = false"
      @create="createThread"
    />
  </div>
</template>

<script setup lang="ts">
import type { ForumReply, ForumSectionKey, ForumThread, ForumThreadPayload } from "~/composables/useMockForumData"
import { formatForumNumber } from "~/composables/useMockForumData"

const { sections, threads } = useMockForumData()

useSeoMeta({
  title: "Forum | VNSEEA",
  description: "Danh sách sections, threads, post reply và search forum trong VNSEEA.",
})

const search = ref("")
const selectedSection = ref<ForumSectionKey>("all")
const selectedThreadId = ref(threads[0]?.id ?? "")
const createOpen = ref(false)
const createdThreads = ref<ForumThread[]>([])
const localRepliesById = ref<Record<string, ForumReply[]>>({})

const allThreads = computed(() => [...createdThreads.value, ...threads])

const filteredThreads = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return allThreads.value.filter((thread) => {
    const matchesSection = selectedSection.value === "all" || thread.section === selectedSection.value
    const matchesKeyword = keyword.length === 0 || [
      thread.title,
      thread.author,
      thread.sectionLabel,
      thread.excerpt,
      ...thread.tags,
    ].some(field => field.toLowerCase().includes(keyword))

    return matchesSection && matchesKeyword
  })
})

watch(filteredThreads, (items) => {
  if (!items.some(thread => thread.id === selectedThreadId.value)) {
    selectedThreadId.value = items[0]?.id ?? allThreads.value[0]!.id
  }
})

const selectedThread = computed<ForumThread>(() =>
  allThreads.value.find(thread => thread.id === selectedThreadId.value) ?? allThreads.value[0]!,
)

const activeReplies = computed(() => [
  ...selectedThread.value.replies,
  ...(localRepliesById.value[selectedThread.value.id] ?? []),
])

const sectionCounts = computed(() => {
  const counts: Record<string, number> = { all: allThreads.value.length }
  for (const section of sections) {
    if (section.value === "all") continue
    counts[section.value] = allThreads.value.filter(thread => thread.section === section.value).length
  }
  return counts
})

const heroStats = computed(() => [
  {
    label: "Sections",
    value: sections.length - 1,
    description: "Khu vực thảo luận.",
  },
  {
    label: "Threads",
    value: allThreads.value.length,
    description: "Thread đang hiển thị.",
  },
  {
    label: "Views",
    value: formatForumNumber(allThreads.value.reduce((sum, thread) => sum + thread.views, 0)),
    description: "Tổng lượt xem mock.",
  },
])

const resultHeading = computed(() => {
  if (selectedSection.value === "all") return "Tất cả thảo luận"
  return sections.find(section => section.value === selectedSection.value)?.label ?? "Threads"
})

const sendReply = (message: string) => {
  const id = selectedThread.value.id
  const reply: ForumReply = {
    id: Date.now(),
    author: "Bạn",
    initials: "B",
    role: "Member",
    message,
    time: "Vừa xong",
  }

  localRepliesById.value = {
    ...localRepliesById.value,
    [id]: [...(localRepliesById.value[id] ?? []), reply],
  }
}

const createThread = (payload: ForumThreadPayload) => {
  const section = sections.find(item => item.value === payload.section)
  const thread: ForumThread = {
    id: `${payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "thread"}-${Date.now()}`,
    title: payload.title,
    section: payload.section,
    sectionLabel: section?.label ?? "Hỗ trợ",
    author: "Bạn",
    authorInitials: "B",
    authorRole: "Member",
    status: "open",
    createdAt: "Vừa xong",
    views: 1,
    repliesCount: 0,
    excerpt: payload.message,
    tags: ["#forum", "#vnseea"],
    replies: [],
  }

  createdThreads.value = [thread, ...createdThreads.value]
  selectedSection.value = "all"
  selectedThreadId.value = thread.id
  createOpen.value = false
}
</script>
