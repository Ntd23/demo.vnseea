<template>
  <div class="space-y-5 pb-10">
    <ForumHero
      :stats="heroStats"
      :status-label="heroStatusLabel"
      :search-term="search"
      :active-section-label="selectedSection !== 'all' ? activeSectionLabel : ''"
      @create-thread="createOpen = true"
    />

    <ForumFilters
      v-model:search="search"
      v-model:selected-section="selectedSection"
      :sections="sections"
      :result-count="filteredThreads.length"
      :status-label="filtersStatusLabel"
      :can-reset="hasActiveFilters"
      @reset="resetFilters"
    />

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      <main class="space-y-4">
        <UCard
          class="rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]"
          :ui="{ body: 'p-5 sm:p-6' }"
        >
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p class="text-label-secondary text-[var(--text-tertiary)]">
                {{ t("pages.forumPage.resultsEyebrow") }}
              </p>
              <h2 class="mt-1 text-heading text-[var(--text-primary)]">
                {{ resultHeading }}
              </h2>
              <p class="mt-1 text-body-secondary" aria-live="polite">
                {{ t("pages.forumPage.matchingThreads", { count: filteredThreads.length }) }}
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <UBadge color="primary" variant="subtle" class="rounded-full px-3 py-1.5 text-[12px] font-semibold">
                {{ activeSectionLabel }}
              </UBadge>
              <UBadge
                v-if="search"
                color="neutral"
                variant="soft"
                class="rounded-full px-3 py-1.5 text-[12px] font-semibold"
              >
                {{ t("pages.forumPage.queryBadge", { query: search }) }}
              </UBadge>
              <UButton
                color="primary"
                size="sm"
                class="rounded-full"
                @click="createOpen = true"
              >
                <Icon name="i-ph-plus-circle-fill" class="mr-1.5 h-4 w-4" />
                {{ t("pages.forumPage.createThreadButton") }}
              </UButton>
            </div>
          </div>
        </UCard>

        <div v-if="filteredThreads.length > 0" class="space-y-4">
          <ForumThreadCard
            v-for="thread in filteredThreads"
            :key="thread.id"
            :local-reply-count="localRepliesById[thread.id]?.length ?? 0"
            :selected="thread.id === selectedThread?.id"
            :thread="thread"
            @select="selectThread"
          />
        </div>

        <UAlert
          v-else
          color="neutral"
          variant="subtle"
          icon="i-ph-chats-circle-fill"
          :title="t('pages.forumPage.emptyTitle')"
          :description="t('pages.forumPage.emptyDescription')"
          class="rounded-[30px]"
        >
          <template #actions>
            <UButton
              v-if="hasActiveFilters"
              color="neutral"
              variant="outline"
              size="sm"
              class="rounded-full"
              @click="resetFilters"
            >
              {{ t("pages.forumPage.resetFilters") }}
            </UButton>
          </template>
        </UAlert>
      </main>

      <div class="space-y-5">
        <ForumThreadDetail
          :thread="selectedThread"
          :replies="activeReplies"
          :status-label="selectedThreadStatusLabel"
          @reply="sendReply"
        />
        <ForumStatsSidebar
          :counts="sectionCounts"
          :sections="sections"
          :selected-section="selectedSection"
          :status-label="filtersStatusLabel"
          :has-active-filters="hasActiveFilters"
          @select-section="selectedSection = $event"
          @reset="resetFilters"
        />
      </div>
    </div>

    <ForumCreateThreadModal
      :open="createOpen"
      :sections="sections"
      :default-section="selectedSection === 'all' ? undefined : selectedSection"
      @close="createOpen = false"
      @create="createThread"
    />
  </div>
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import { watchDebounced } from "@vueuse/core"
import type { ForumReply, ForumSectionKey, ForumThread, ForumThreadPayload } from "../../domain/types/forum.types"
import {
  filterForumThreads,
  formatForumNumber,
  normalizeForumSection,
  readForumQueryValue,
  useForumCatalog,
} from "../../infrastructure/mocks/forumCatalog"
import ForumCreateThreadModal from "../components/CreateThreadModal.vue"
import ForumFilters from "../components/ForumFilters.vue"
import ForumHero from "../components/ForumHero.vue"
import ForumStatsSidebar from "../components/ForumStatsSidebar.vue"
import ForumThreadCard from "../components/ForumThreadCard.vue"
import ForumThreadDetail from "../components/ForumThreadDetail.vue"

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const { sections, threads } = useForumCatalog()

const search = ref(readForumQueryValue(route.query.q).trim())
const selectedSection = ref<ForumSectionKey>(
  normalizeForumSection(readForumQueryValue(route.query.section)),
)
const selectedThreadId = ref(readForumQueryValue(route.query.thread).trim())
const threadSelectionPinned = ref(selectedThreadId.value.length > 0)
const createOpen = ref(false)
const createdThreads = ref<ForumThread[]>([])
const localRepliesById = ref<Record<string, ForumReply[]>>({})

const allThreads = computed(() => [...createdThreads.value, ...threads.value])

const activeSectionLabel = computed(() =>
  sections.value.find(section => section.value === selectedSection.value)?.label
  ?? t("pages.forumPage.allThreads"),
)

const hasActiveFilters = computed(() =>
  search.value.trim().length > 0 || selectedSection.value !== "all",
)

const filteredThreads = computed(() =>
  filterForumThreads(allThreads.value, search.value, selectedSection.value),
)

const selectedThread = computed<ForumThread | null>(() =>
  filteredThreads.value.find(thread => thread.id === selectedThreadId.value)
  ?? filteredThreads.value[0]
  ?? null,
)

const activeReplies = computed(() => {
  const thread = selectedThread.value
  if (!thread) return []

  return [
    ...thread.replies,
    ...(localRepliesById.value[thread.id] ?? []),
  ]
})

const sectionCounts = computed(() => {
  const counts: Record<string, number> = { all: allThreads.value.length }

  for (const section of sections.value) {
    if (section.value === "all") continue
    counts[section.value] = allThreads.value.filter(thread => thread.section === section.value).length
  }

  return counts
})

const formatCount = (value: number) =>
  new Intl.NumberFormat(locale.value === "vi" ? "vi-VN" : "en-US").format(value)

const heroStats = computed(() => [
  {
    label: t("pages.forumPage.statSections"),
    value: sections.value.length - 1,
    description: t("pages.forumPage.statSectionsDescription"),
  },
  {
    label: t("pages.forumPage.statThreads"),
    value: allThreads.value.length,
    description: t("pages.forumPage.statThreadsDescription"),
  },
  {
    label: t("pages.forumPage.statViews"),
    value: formatForumNumber(allThreads.value.reduce((sum, thread) => sum + thread.views, 0), locale.value),
    description: t("pages.forumPage.statViewsDescription"),
  },
])

const resultHeading = computed(() => {
  if (search.value && selectedSection.value !== "all") {
    return t("pages.forumPage.resultHeadingSearchSection", {
      query: search.value,
      section: activeSectionLabel.value,
    })
  }

  if (search.value) {
    return t("pages.forumPage.resultHeadingSearch", {
      query: search.value,
    })
  }

  if (selectedSection.value === "all") return t("pages.forumPage.allThreads")
  return activeSectionLabel.value || t("pages.forumPage.resultsEyebrow")
})

const filtersStatusLabel = computed(() => {
  const count = formatCount(filteredThreads.value.length)

  if (search.value && selectedSection.value !== "all") {
    return t("pages.forumPage.filterStatusSearchSection", {
      count,
      query: search.value,
      section: activeSectionLabel.value,
    })
  }

  if (search.value) {
    return t("pages.forumPage.filterStatusSearch", {
      count,
      query: search.value,
    })
  }

  if (selectedSection.value !== "all") {
    return t("pages.forumPage.filterStatusSection", {
      count,
      section: activeSectionLabel.value,
    })
  }

  return t("pages.forumPage.filterStatusDefault", {
    count,
  })
})

const heroStatusLabel = computed(() => {
  const count = formatCount(filteredThreads.value.length)

  if (search.value && selectedSection.value !== "all") {
    return t("pages.forumPage.heroStatusSearchSection", {
      count,
      query: search.value,
      section: activeSectionLabel.value,
    })
  }

  if (search.value) {
    return t("pages.forumPage.heroStatusSearch", {
      count,
      query: search.value,
    })
  }

  if (selectedSection.value !== "all") {
    return t("pages.forumPage.heroStatusSection", {
      count,
      section: activeSectionLabel.value,
    })
  }

  return t("pages.forumPage.heroStatusAll", {
    count: formatCount(allThreads.value.length),
  })
})

const selectedThreadStatusLabel = computed(() => {
  if (!selectedThread.value) {
    return t("pages.forumPage.detailEmptyDescription")
  }

  return t("pages.forumPage.detailStatus", {
    count: formatCount(activeReplies.value.length),
    title: selectedThread.value.title,
  })
})

watch(
  () => route.query.q,
  (value) => {
    const nextSearch = readForumQueryValue(value).trim()
    if (nextSearch !== search.value) {
      search.value = nextSearch
    }
  },
)

watch(
  () => route.query.section,
  (value) => {
    const nextSection = normalizeForumSection(readForumQueryValue(value))
    if (nextSection !== selectedSection.value) {
      selectedSection.value = nextSection
    }
  },
)

watch(
  () => route.query.thread,
  (value) => {
    const nextThread = readForumQueryValue(value).trim()
    const fallbackThreadId = filteredThreads.value[0]?.id ?? ""

    threadSelectionPinned.value = nextThread.length > 0

    if (nextThread !== selectedThreadId.value) {
      selectedThreadId.value = nextThread || fallbackThreadId
    }
  },
)

watch(
  filteredThreads,
  (items) => {
    if (items.some(thread => thread.id === selectedThreadId.value)) return

    selectedThreadId.value = items[0]?.id ?? ""
    threadSelectionPinned.value = false
  },
  { immediate: true },
)

watchDebounced(
  search,
  () => {
    const normalizedSearch = search.value.trim()

    if (normalizedSearch !== search.value) {
      search.value = normalizedSearch
      return
    }

    syncRoute()
  },
  { debounce: 250, maxWait: 800 },
)

watch(selectedSection, syncRoute)
watch(selectedThreadId, syncRoute)

onMounted(() => {
  syncRoute()
})

function syncRoute() {
  const nextSearch = search.value.trim()
  const currentRawSearch = readForumQueryValue(route.query.q)
  const currentRawSection = readForumQueryValue(route.query.section)
  const currentRawThread = readForumQueryValue(route.query.thread)
  const visibleSelectedThreadId = filteredThreads.value.some(thread => thread.id === selectedThreadId.value)
    ? selectedThreadId.value
    : ""

  if (threadSelectionPinned.value && !visibleSelectedThreadId) {
    threadSelectionPinned.value = false
  }

  const nextThread = threadSelectionPinned.value ? visibleSelectedThreadId : ""
  const nextSection = selectedSection.value === "all" ? "" : selectedSection.value

  if (
    currentRawSearch === nextSearch
    && currentRawSection === nextSection
    && currentRawThread === nextThread
  ) {
    return
  }

  const nextQuery = { ...route.query }

  if (nextSearch) {
    nextQuery.q = nextSearch
  }
  else {
    delete nextQuery.q
  }

  if (selectedSection.value !== "all") {
    nextQuery.section = selectedSection.value
  }
  else {
    delete nextQuery.section
  }

  if (nextThread) {
    nextQuery.thread = nextThread
  }
  else {
    delete nextQuery.thread
  }

  void router.replace({ path: appRoutes.forum, query: nextQuery })
}

function resetFilters() {
  search.value = ""
  selectedSection.value = "all"
}

function selectThread(id: string) {
  selectedThreadId.value = id
  threadSelectionPinned.value = true
}

function sendReply(message: string) {
  const thread = selectedThread.value
  if (!thread) return

  const reply: ForumReply = {
    id: Date.now(),
    author: t("pages.forumPage.replyAuthor"),
    initials: t("pages.forumPage.replyInitials"),
    role: t("pages.forumPage.replyRole"),
    message,
    time: t("pages.forumPage.justNow"),
  }

  localRepliesById.value = {
    ...localRepliesById.value,
    [thread.id]: [...(localRepliesById.value[thread.id] ?? []), reply],
  }
}

function createThread(payload: ForumThreadPayload) {
  const section = sections.value.find(item => item.value === payload.section)
  const thread: ForumThread = {
    id: `${payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "thread"}-${Date.now()}`,
    title: payload.title,
    section: payload.section,
    sectionLabel: section?.label ?? t("pages.forumPage.supportFallback"),
    author: t("pages.forumPage.replyAuthor"),
    authorInitials: t("pages.forumPage.replyInitials"),
    authorRole: t("pages.forumPage.replyRole"),
    status: "open",
    createdAt: t("pages.forumPage.justNow"),
    views: 1,
    repliesCount: 0,
    excerpt: payload.message,
    tags: ["forum", "vnseea"],
    replies: [],
  }

  createdThreads.value = [thread, ...createdThreads.value]
  search.value = ""
  selectedSection.value = "all"
  selectedThreadId.value = thread.id
  threadSelectionPinned.value = true
  createOpen.value = false
}
</script>
