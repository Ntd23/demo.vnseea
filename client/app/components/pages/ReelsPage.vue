<template>
  <div class="space-y-4 pb-10">
    <div class="flex flex-col gap-3 rounded-[1.5rem] border border-[#dbe3f2] bg-white px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] sm:px-5">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-[0.8rem] font-bold uppercase tracking-[0.28em] text-[#0000ff]/55">Reels</p>
          <h1 class="text-[1.35rem] font-black leading-tight text-[#243b63] sm:text-[1.65rem]">Khám phá video ngắn</h1>
        </div>
        <button class="inline-flex h-10 items-center gap-2 rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-4 text-[0.92rem] font-semibold text-[#243b63] transition hover:border-[#c7d3ea] hover:text-[#0000ff]" type="button">
          <Icon name="i-ph-squares-four-fill" class="h-4 w-4" />
          Bộ lọc
        </button>
      </div>
      <p class="max-w-2xl text-[0.95rem] leading-7 text-slate-500">
        Xem video ngắn theo kiểu full-screen, thao tác nhanh với nút thích, bình luận, lưu và chia sẻ theo đúng nhịp UI của VNSEEA.
      </p>
    </div>

    <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section class="space-y-4 min-w-0">
        <article
          v-for="reel in reels"
          :key="reel.id"
          class="relative overflow-hidden rounded-[1.5rem] border border-[#dbe3f2] bg-[#050505] shadow-[0_16px_40px_rgba(15,23,42,0.14)]"
        >
          <div class="relative aspect-[9/16] min-h-[520px] w-full bg-black sm:min-h-[640px]">
            <img
              :src="reel.cover"
              :alt="reel.title"
              class="h-full w-full object-cover opacity-95"
            >
            <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.25)_0%,rgba(0,0,0,0.15)_18%,rgba(0,0,0,0.65)_100%)]" />

            <div class="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-white backdrop-blur-sm">
              <span class="h-2 w-2 rounded-full bg-[#10b981]" />
              <span class="text-[0.78rem] font-semibold">Đang phát</span>
            </div>

            <div class="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
              <Icon name="i-ph-trash-fill" class="h-5 w-5" />
            </div>

            <div class="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 sm:p-5">
              <div class="max-w-[62%] text-white">
                <div class="flex items-center gap-3">
                  <img :src="reel.avatar" :alt="reel.author" class="h-11 w-11 rounded-full border-2 border-white object-cover shadow-lg sm:h-12 sm:w-12">
                  <div class="min-w-0">
                    <p class="truncate text-[1rem] font-bold leading-tight">{{ reel.author }}</p>
                    <p class="truncate text-[0.82rem] text-white/75">{{ reel.subtitle }}</p>
                  </div>
                </div>

                <h2 class="mt-3 text-[1.15rem] font-black leading-tight sm:text-[1.3rem]">{{ reel.title }}</h2>
                <p class="mt-2 line-clamp-3 text-[0.92rem] leading-7 text-white/80">
                  {{ reel.description }}
                </p>
              </div>

              <div class="flex flex-col items-center gap-3">
                <button class="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#f59e0b] shadow-[0_10px_20px_rgba(0,0,0,0.2)] transition hover:scale-105" type="button">
                  <Icon name="i-ph-hand-heart-fill" class="h-5 w-5" />
                </button>
                <button class="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-white/15" type="button">
                  <Icon name="i-ph-bookmark-simple-fill" class="h-5 w-5" />
                </button>
                <button class="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-white/15" type="button">
                  <Icon name="i-ph-thumbs-up-fill" class="h-5 w-5" />
                </button>
                <span class="text-[0.78rem] font-semibold text-white/80">{{ reel.likes }}</span>
                <button class="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-white/15" type="button">
                  <Icon name="i-ph-chats-circle-fill" class="h-5 w-5" />
                </button>
                <span class="text-[0.78rem] font-semibold text-white/80">{{ reel.comments }}</span>
                <button class="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-white/15" type="button">
                  <Icon name="i-ph-eye-fill" class="h-5 w-5" />
                </button>
                <span class="text-[0.78rem] font-semibold text-white/80">{{ reel.views }}</span>
              </div>
            </div>
          </div>
        </article>
      </section>

      <aside class="hidden min-w-0 xl:block">
        <div class="sticky top-[74px] space-y-4">
          <section class="rounded-[1.5rem] border border-[#dbe3f2] bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            <p class="text-[0.8rem] font-bold uppercase tracking-[0.28em] text-[#0000ff]/55">Khám phá</p>
            <div class="mt-3 space-y-3">
              <div class="flex items-center gap-3 rounded-[1.15rem] bg-[#f8fbff] p-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef2ff] text-[#0000ff]"><Icon name="i-ph-music-note-fill" class="h-5 w-5" /></div>
                <div>
                  <p class="text-[0.95rem] font-semibold text-[#243b63]">Âm thanh đang hot</p>
                  <p class="text-[0.82rem] text-slate-500">7.2k lượt dùng</p>
                </div>
              </div>
              <div class="flex items-center gap-3 rounded-[1.15rem] bg-[#f8fbff] p-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef2ff] text-[#0000ff]"><Icon name="i-ph-fire-fill" class="h-5 w-5" /></div>
                <div>
                  <p class="text-[0.95rem] font-semibold text-[#243b63]">Xu hướng hôm nay</p>
                  <p class="text-[0.82rem] text-slate-500">Nội dung nổi bật</p>
                </div>
              </div>
            </div>
          </section>

          <section class="rounded-[1.5rem] border border-[#dbe3f2] bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            <p class="text-[0.8rem] font-bold uppercase tracking-[0.28em] text-[#0000ff]/55">Người theo dõi</p>
            <div class="mt-3 space-y-3">
              <div v-for="creator in creators" :key="creator.name" class="flex items-center justify-between gap-3 rounded-[1.1rem] bg-[#f8fbff] p-3">
                <div class="flex min-w-0 items-center gap-3">
                  <img :src="creator.avatar" class="h-10 w-10 rounded-full object-cover">
                  <div class="min-w-0">
                    <p class="truncate text-[0.92rem] font-semibold text-[#243b63]">{{ creator.name }}</p>
                    <p class="truncate text-[0.8rem] text-slate-500">{{ creator.meta }}</p>
                  </div>
                </div>
                <button class="rounded-full bg-[#eef2ff] px-3 py-1.5 text-[0.8rem] font-bold text-[#0000ff] transition hover:bg-[#dfe5ff]" type="button">Theo dõi</button>
              </div>
            </div>
          </section>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Reels | VNSEEA',
  description: 'Khám phá video ngắn trên VNSEEA.',
})

const reels = [
  {
    id: 1,
    title: 'Cách mình dựng UI nhanh hơn với Vue + Nuxt',
    author: 'Thanh Hà',
    subtitle: 'Creator · 12 phút trước',
    description: 'Một reel demo theo layout trong ảnh gợi ý: khung video đặt giữa, nền tối, cột action bên phải và phần info overlay ở đáy.',
    likes: 0,
    comments: 0,
    views: 2,
    cover: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    avatar: 'https://i.pravatar.cc/150?u=reel-1',
  },
  {
    id: 2,
    title: 'Reels travel: một góc yên tĩnh để tập trung',
    author: 'Minh Anh',
    subtitle: 'Community · 1 giờ trước',
    description: 'Bạn có thể thay source thành video thật sau, còn phần UI đã có khung sẵn để test scroll và responsive.',
    likes: 18,
    comments: 4,
    views: 128,
    cover: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    avatar: 'https://i.pravatar.cc/150?u=reel-2',
  },
]

const creators = [
  { name: 'Phương Linh', meta: '3.2k followers', avatar: 'https://i.pravatar.cc/150?u=creator-1' },
  { name: 'Quốc Bảo', meta: '8.5k followers', avatar: 'https://i.pravatar.cc/150?u=creator-2' },
  { name: 'Hà My', meta: '1.9k followers', avatar: 'https://i.pravatar.cc/150?u=creator-3' },
]
</script>