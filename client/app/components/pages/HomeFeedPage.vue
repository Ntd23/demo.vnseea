<template>
  <div class="space-y-4 sm:space-y-5">
    <section class="overflow-hidden rounded-[1.5rem] border border-[#dbe3f2] bg-white p-4 shadow-[0_14px_32px_rgba(13,38,76,0.04)] sm:rounded-[1.85rem] sm:p-5">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="min-w-0">
          <p class="text-[11px] font-extrabold uppercase tracking-[0.32em] text-[#0000ff]">{{ greetingLabel }}</p>
          <h1 class="mt-1 text-[1.4rem] font-black tracking-[-0.06em] text-[#243b63] sm:text-[1.65rem]">Bảng tin của bạn</h1>
        </div>
        <div class="flex w-fit items-center gap-1.5 rounded-full border border-[#dbe3f2] bg-[#f8faff] p-1 shadow-[0_4px_16px_rgba(13,38,76,0.04)]">
          <button v-for="ord in orderings" :key="ord.value" class="rounded-full px-3 py-1.5 text-[12px] font-bold transition duration-150" :class="ordering === ord.value ? 'bg-[linear-gradient(180deg,#2749ff_0%,#0000ff_100%)] text-white shadow-[0_6px_16px_rgba(0,0,255,0.18)]' : 'text-slate-500 hover:text-[#0000ff]'" type="button" @click="ordering = ord.value">
            {{ ord.label }}
          </button>
        </div>
      </div>
    </section>

    <div class="px-0">
      <FeedStoryCarousel />
    </div>

    <div class="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
      <button v-for="f in filters" :key="f.value" class="flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition duration-150" :class="activeFilter === f.value ? 'border-[#0000ff] bg-[#0000ff]/8 text-[#0000ff]' : 'border-[#dbe3f2] bg-white text-slate-500 hover:border-[#0000ff]/25 hover:text-[#0000ff]'" type="button" @click="activeFilter = f.value">
        <Icon :name="f.icon" class="h-3.5 w-3.5" />
        {{ f.label }}
      </button>
    </div>

    <div class="rounded-[1.5rem] border border-[#dbe3f2] bg-white p-3 shadow-[0_10px_26px_rgba(13,38,76,0.04)] sm:rounded-[1.85rem] sm:p-4">
      <FeedPublisherBox />
    </div>

    <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150" leave-to-class="opacity-0 -translate-y-2">
      <div v-if="newPostsCount > 0" class="flex justify-center">
        <button class="flex items-center gap-2 rounded-full border border-[#0000ff]/20 bg-white px-4 py-2 text-sm font-semibold text-[#0000ff] shadow-[0_4px_20px_rgba(0,0,255,0.12)] transition hover:bg-[#0000ff] hover:text-white" type="button" @click="loadNewPosts">
          <Icon name="i-ph-arrow-up-bold" class="h-4 w-4" />
          {{ newPostsCount }} bài mới — nhấn để tải
        </button>
      </div>
    </Transition>

    <div class="space-y-0 sm:space-y-4">
      <FeedPostCard v-for="post in visiblePosts" :key="post.id" :post="post" />
    </div>

    <div class="flex justify-center py-2">
      <button v-if="!allLoaded" class="flex items-center gap-2 rounded-full border border-[#0000ff]/15 bg-white px-6 py-2.5 text-sm font-semibold text-[#0000ff]/70 shadow-[0_2px_12px_rgba(0,0,255,0.07)] transition hover:border-[#0000ff]/30 hover:text-[#0000ff]" :disabled="loadingMore" type="button" @click="loadMore">
        <Icon v-if="loadingMore" name="i-lucide-loader-2" class="h-4 w-4 animate-spin" />
        <Icon v-else name="i-ph-arrow-down-bold" class="h-4 w-4" />
        {{ loadingMore ? 'Đang tải...' : 'Tải thêm bài viết' }}
      </button>
      <p v-else class="text-sm text-[#0000ff]/40">Bạn đã xem hết bài viết 🎉</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { posts } = useMockSocialData()
useSeoMeta({ title: 'Bảng tin | VNSEEA', description: 'Bảng tin cộng đồng VNSEEA — chia sẻ, kết nối và khám phá.' })
const greetingLabel = computed(() => { const h = new Date().getHours(); if (h < 12) return '☀️ Chào buổi sáng'; if (h < 18) return '🌤️ Chào buổi chiều'; return '🌙 Chào buổi tối' })
const ordering = ref('all')
const orderings = [{ label: 'Tất cả', value: 'all' }, { label: 'Đang theo dõi', value: 'following' }]
const activeFilter = ref('all')
const filters = [{ label: 'Tất cả', value: 'all', icon: 'i-ph-squares-four' }, { label: 'Bài viết', value: 'text', icon: 'i-ph-article' }, { label: 'Ảnh', value: 'photo', icon: 'i-ph-image' }, { label: 'Video', value: 'video', icon: 'i-ph-video' }, { label: 'Nhạc', value: 'music', icon: 'i-ph-music-note' }]
const newPostsCount = ref(0)
let newPostTimer: ReturnType<typeof setTimeout>
onMounted(() => { newPostTimer = setTimeout(() => { newPostsCount.value = 3 }, 8000) })
onUnmounted(() => clearTimeout(newPostTimer))
const loadNewPosts = () => { newPostsCount.value = 0 }
const pageSize = 2
const page = ref(1)
const loadingMore = ref(false)
const visiblePosts = computed(() => posts.slice(0, page.value * pageSize))
const allLoaded = computed(() => visiblePosts.value.length >= posts.length)
const loadMore = async () => { loadingMore.value = true; await new Promise(r => setTimeout(r, 800)); page.value++; loadingMore.value = false }
</script>

<style scoped>
.scrollbar-hide { scrollbar-width: none; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
</style>
