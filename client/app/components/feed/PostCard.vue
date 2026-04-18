<template>
  <article class="overflow-hidden rounded-[20px] border border-[#0000ff]/10 bg-white shadow-[0_2px_20px_rgba(0,0,255,0.06)]">
    <div class="p-4 sm:p-5">
      <FeedPostHeader :author="post.author" :role="post.role" :time="post.time" :audience="post.audience" />

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

      <FeedPostMediaGrid v-if="post.media" class="mt-4" :variant="post.media" @open="onOpenMedia" />

      <div class="mt-4 flex items-center justify-between border-t border-[#0000ff]/8 pt-3 text-[12px] text-slate-500">
        <div class="flex items-center gap-2">
          <div class="flex -space-x-1.5">
            <span class="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full border-[3px] border-white bg-blue-500 text-[11px]">👍</span>
            <span class="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full border-[3px] border-white bg-red-500 text-[11px]">❤️</span>
            <span class="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full border-[3px] border-white bg-yellow-400 text-[11px]">😮</span>
          </div>
          <span>{{ post.stats.likes }}</span>
        </div>
        <div class="flex items-center gap-3 text-[12px] text-slate-400">
          <span>{{ post.stats.comments }} bình luận</span>
          <span>{{ post.stats.shares }} chia sẻ</span>
        </div>
      </div>

      <div class="mt-3 grid grid-cols-3 gap-2">
        <button class="flex w-full items-center justify-center gap-2 rounded-[14px] border border-[#0000ff]/10 bg-white py-2.5 text-[13px] font-semibold text-slate-500 transition duration-200 hover:border-[#0000ff]/25 hover:bg-[#0000ff]/5 hover:text-[#0000ff]" type="button" @click="toggleLike">
          <Icon name="i-lucide-thumbs-up" class="h-4 w-4" />
          {{ liked ? 'Đã thích' : 'Thích' }}
        </button>
        <button class="flex w-full items-center justify-center gap-2 rounded-[14px] border border-[#0000ff]/10 bg-white py-2.5 text-[13px] font-semibold text-slate-500 transition duration-200 hover:border-[#0000ff]/25 hover:bg-[#0000ff]/5 hover:text-[#0000ff]" type="button" @click="showComments = !showComments">
          <Icon name="i-lucide-message-circle" class="h-4 w-4" />
          Bình luận
        </button>
        <button class="flex w-full items-center justify-center gap-2 rounded-[14px] border border-[#0000ff]/10 bg-white py-2.5 text-[13px] font-semibold text-slate-500 transition duration-200 hover:border-[#0000ff]/25 hover:bg-[#0000ff]/5 hover:text-[#0000ff]" type="button" @click="showShare = true">
          <Icon name="i-lucide-share-2" class="h-4 w-4" />
          Chia sẻ
        </button>
      </div>

      <div class="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-400">
        <button class="rounded-full bg-slate-50 px-2.5 py-1 transition hover:bg-[#0000ff]/5 hover:text-[#0000ff]" type="button">Ẩn bài</button>
        <button class="rounded-full bg-slate-50 px-2.5 py-1 transition hover:bg-[#0000ff]/5 hover:text-[#0000ff]" type="button">Báo cáo</button>
        <button class="rounded-full bg-slate-50 px-2.5 py-1 transition hover:bg-[#0000ff]/5 hover:text-[#0000ff]" type="button">Lưu bài</button>
        <button class="rounded-full bg-slate-50 px-2.5 py-1 transition hover:bg-[#0000ff]/5 hover:text-[#0000ff]" type="button">Sao chép link</button>
        <button class="rounded-full bg-slate-50 px-2.5 py-1 transition hover:bg-[#0000ff]/5 hover:text-[#0000ff]" type="button">Dịch bài</button>
      </div>

      <div v-if="post.comments.length && !showComments" class="mt-3 border-t border-[#0000ff]/8 pt-3">
        <div class="flex items-start gap-2">
          <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[9px] font-bold text-slate-600">
            {{ post.comments[0].author.split(' ').map(w => w[0]).join('') }}
          </div>
          <div class="min-w-0 rounded-2xl bg-[#f1f4fb] px-3 py-2">
            <p class="text-[12px] font-semibold text-slate-800">{{ post.comments[0].author }}</p>
            <p class="text-[12px] leading-relaxed text-slate-600">{{ post.comments[0].text }}</p>
          </div>
        </div>
        <button v-if="post.comments.length > 1" class="ml-9 mt-1.5 text-[12px] font-semibold text-[#0000ff]/60 hover:text-[#0000ff]" type="button" @click="showComments = true">
          Xem thêm {{ post.comments.length - 1 }} bình luận
        </button>
      </div>

      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
        <div v-if="showComments" class="mt-3 space-y-3 border-t border-[#0000ff]/8 pt-3">
          <FeedCommentList :comments="post.comments" />
          <FeedCommentComposer />
        </div>
      </Transition>
    </div>

    <FeedShareModal :open="showShare" :post="{ author: post.author, text: post.text }" @close="showShare = false" />
    <LightboxModal
      :open="lightboxOpen"
      :items="mediaItems"
      :current-index="currentMediaIndex"
      title="Ảnh bài viết"
      :description="post.author"
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
import { createHashtagPath, formatHashtagLabel } from "~/composables/useMockHashtagData"

const props = defineProps<{
  post: {
    author: string
    role: string
    audience: string
    time: string
    text: string
    tags: string[]
    stats: { likes: number; comments: number; shares: number }
    media?: 'double' | 'single'
    comments: { id: number; author: string; role: string; text: string }[]
  }
}>()

const showComments = ref(false)
const showShare = ref(false)
const liked = ref(false)
const lightboxOpen = ref(false)
const currentMediaIndex = ref(0)

const mediaItems = computed(() => {
  const count = props.post.media === 'double' ? 2 : props.post.media ? 1 : 0
  return Array.from({ length: count }, (_, i) => ({
    type: 'image' as const,
    src: `https://picsum.photos/seed/${encodeURIComponent(props.post.author)}-${i + 1}/1200/900`,
    alt: `${props.post.author} media ${i + 1}`,
  }))
})

const toggleLike = () => {
  liked.value = !liked.value
}

const onOpenMedia = (index: number) => {
  currentMediaIndex.value = index
  lightboxOpen.value = true
}

const downloadMedia = () => {
  if (!mediaItems.value[currentMediaIndex.value]) return
}
</script>
