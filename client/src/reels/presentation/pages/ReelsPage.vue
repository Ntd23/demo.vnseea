<!-- Description: Renders the reels route as a minimal fullscreen viewer with stacked reel navigation, aligned to the legacy PHP reels flow. -->
<template>
  <div class="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#020617_0%,#0f172a_52%,#020617_100%)] text-white">
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_34%),linear-gradient(90deg,rgba(37,99,235,0.12),transparent_28%,transparent_72%,rgba(14,165,233,0.1))]" />

    <div v-if="loading" class="relative mx-auto flex min-h-screen max-w-[1440px] items-center justify-center px-6 text-center">
      <div class="space-y-4 rounded-[28px] border border-white/10 bg-white/6 px-8 py-10 backdrop-blur">
        <Icon name="i-lucide-loader-2" class="mx-auto h-8 w-8 animate-spin text-white/70" />
        <p class="text-sm font-bold text-white/70">{{ t("pages.reelsPage.playing") }}</p>
      </div>
    </div>

    <div v-else-if="activeReel" class="relative mx-auto flex min-h-screen max-w-[1440px] items-center justify-center gap-4 px-0 py-0 sm:px-5 sm:py-4 xl:px-8">
      <div class="min-w-0 flex-1">
        <ReelsPlayer
          :reel="activeReel"
          :current-index="activeIndex"
          :total="reels.length"
          @next="nextReel"
          @prev="prevReel"
        />
      </div>

      <aside class="hidden w-[300px] shrink-0 xl:flex xl:flex-col xl:gap-3">
        <section class="rounded-[28px] border border-white/10 bg-white/6 p-4 backdrop-blur">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-white/60">
            {{ t("pages.reelsPage.playing") }}
          </p>
          <h1 class="mt-2 text-[1.25rem] font-black tracking-[-0.03em] text-white">
            {{ activeReel.title }}
          </h1>
          <p class="mt-1 text-[13px] leading-6 text-white/72">
            {{ activeReel.description }}
          </p>
          <p class="mt-3 text-[12px] font-semibold text-white/60">
            {{ activeIndex + 1 }}/{{ reels.length }}
          </p>
        </section>

        <div class="space-y-2">
          <button
            v-for="(reel, index) in reels"
            :key="reel.id"
            type="button"
            class="flex w-full items-center gap-3 rounded-[22px] border px-3 py-3 text-left transition"
            :class="index === activeIndex
              ? 'border-white/20 bg-white/12 shadow-[0_12px_28px_rgba(2,6,23,0.28)]'
              : 'border-white/8 bg-black/18 hover:border-white/14 hover:bg-white/8'"
            @click="jumpToReel(index)"
          >
            <img
              :src="reel.cover"
              :alt="reel.title"
              class="h-16 w-12 rounded-[12px] object-cover"
            >
            <div class="min-w-0 flex-1">
              <p class="truncate text-[13px] font-black text-white">
                {{ reel.title }}
              </p>
              <p class="mt-1 truncate text-[12px] text-white/62">
                {{ reel.author }}
              </p>
            </div>
            <span class="text-[12px] font-bold text-white/45">
              {{ index + 1 }}
            </span>
          </button>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-[18px] border border-white/10 bg-white/8 px-4 py-3 text-[13px] font-bold text-white transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-45"
            :disabled="reels.length < 2"
            @click="prevReel"
          >
            <Icon name="i-ph-arrow-up-bold" class="mr-2 h-4 w-4" />
            Prev
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-[18px] border border-white/10 bg-white/8 px-4 py-3 text-[13px] font-bold text-white transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-45"
            :disabled="reels.length < 2"
            @click="nextReel"
          >
            Next
            <Icon name="i-ph-arrow-down-bold" class="ml-2 h-4 w-4" />
          </button>
        </div>
      </aside>
    </div>

    <div v-else class="relative mx-auto flex min-h-screen max-w-[1440px] items-center justify-center px-6 text-center">
      <div class="space-y-4 rounded-[28px] border border-white/10 bg-white/6 px-8 py-10 backdrop-blur">
        <Icon name="i-ph-film-strip-duotone" class="mx-auto h-8 w-8 text-white/70" />
        <p class="text-base font-black text-white">{{ t("pages.reelsPage.heroTitle") }}</p>
        <p class="max-w-md text-sm leading-6 text-white/70">{{ errorMessage || t("pages.watchPage.emptyDescription") }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatHashtagLabel } from "../../../feed/application/composables/useHashtagData"
import { createApiFeedRepository } from "../../../feed/infrastructure/repositories/ApiFeedRepository"
import ReelsPlayer from "../components/ReelsPlayer.vue"

const { t } = useI18n()
const repository = createApiFeedRepository()
const loading = ref(true)
const errorMessage = ref("")
useSeoMeta({
  title: () => t("pages.reelsPage.seoTitle"),
  description: () => t("pages.reelsPage.seoDescription"),
})

const reels = ref<Array<{
  id: number
  title: string
  author: string
  subtitle: string
  description: string
  likes: number
  comments: number
  shares: number
  views: number
  music: string
  tags: string[]
  cover: string
  avatar: string
  authorPath: string
}>>([])

const activeIndex = ref(0)
const activeReel = computed(() => reels.value[activeIndex.value] ?? null)

async function fetchReels() {
  loading.value = true
  errorMessage.value = ""

  try {
    const response = await repository.getVideos({ limit: 12 })
    reels.value = response.posts
      .filter(post => post.mediaItems.length > 0)
      .map((post) => ({
        id: post.id,
        title: post.text || post.author,
        author: post.author,
        subtitle: post.role,
        description: post.text || post.role,
        likes: post.stats.likes,
        comments: post.stats.comments,
        shares: post.stats.shares,
        views: post.stats.views,
        music: post.tags[0] ? formatHashtagLabel(post.tags[0]) : post.sourceLabel,
        tags: post.tags.map(tag => formatHashtagLabel(tag)),
        cover: post.mediaItems[0]?.thumb || post.mediaItems[0]?.src || post.authorAvatarUrl,
        avatar: post.authorAvatarUrl,
        authorPath: post.authorPath,
      }))
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : t("pages.watchPage.emptyDescription")
  }
  finally {
    loading.value = false
  }
}

const jumpToReel = (index: number) => {
  activeIndex.value = index
}

const nextReel = () => {
  activeIndex.value = (activeIndex.value + 1) % reels.value.length
}

const prevReel = () => {
  activeIndex.value = (activeIndex.value - 1 + reels.value.length) % reels.value.length
}

await fetchReels()
</script>
