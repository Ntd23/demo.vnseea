<template>
  <section class="overflow-hidden rounded-[20px] border border-[#0000ff]/10 bg-white shadow-[0_2px_20px_rgba(0,0,255,0.06)]">
    <div class="px-4 pt-4 sm:px-5">
      <div class="flex items-start gap-3">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0000ff] text-[12px] font-bold tracking-wide text-white shadow-[0_4px_12px_rgba(0,0,255,0.2)]">VN</div>
        <div class="min-w-0 flex-1">
          <textarea
            v-model="text"
            rows="2"
            placeholder="Chuyện gì đang xảy ra vậy? #Hashtag .. @Mention .. Link .."
            class="w-full resize-none bg-transparent text-[14px] leading-6 text-slate-700 placeholder:text-slate-400 outline-none"
          />
        </div>
        <button class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#0000ff]/50 transition hover:bg-[#0000ff]/5 hover:text-[#0000ff]" type="button">
          <Icon name="i-lucide-smile" class="h-5 w-5" />
        </button>
      </div>

      <div class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <button v-for="action in mediaActions" :key="action.label" class="flex items-center justify-center gap-2 rounded-full border border-[#0000ff]/12 px-3 py-2 text-[12px] font-semibold text-slate-600 transition hover:bg-[#0000ff]/5 hover:text-[#0000ff]" type="button">
          <Icon :name="action.icon" class="h-4 w-4" />
          {{ action.label }}
        </button>
      </div>

      <div class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button v-for="action in extraActions" :key="action.label" class="flex items-center justify-center gap-2 rounded-full border border-[#0000ff]/12 px-3 py-2 text-[12px] font-semibold text-slate-600 transition hover:bg-[#0000ff]/5 hover:text-[#0000ff]" type="button">
          <Icon :name="action.icon" class="h-4 w-4" />
          {{ action.label }}
        </button>
      </div>
    </div>

    <div class="mt-4 border-t border-[#0000ff]/8 bg-[#f7f9ff] px-4 py-3 sm:px-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <button class="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-[#0000ff] shadow-sm" type="button">
            <Icon name="i-lucide-lock" class="h-3.5 w-3.5" />
            Chỉ có tôi
          </button>
          <button class="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600 shadow-sm" type="button">
            <Icon name="i-lucide-map-pin" class="h-3.5 w-3.5" />
            Thêm vị trí
          </button>
          <button class="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600 shadow-sm" type="button">
            <Icon name="i-lucide-user-plus" class="h-3.5 w-3.5" />
            Gắn thẻ bạn bè
          </button>
          <button class="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600 shadow-sm" type="button">
            <Icon name="i-lucide-palette" class="h-3.5 w-3.5" />
            Màu sắc
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button class="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600 shadow-sm" type="button">Trực tiếp</button>
          <button class="rounded-full bg-[#0000ff] px-5 py-1.5 text-[13px] font-semibold text-white shadow-[0_4px_14px_rgba(0,0,255,0.28)]" type="button">Chia sẻ</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const text = ref('')
const mediaActions = [
  { label: 'Ảnh', icon: 'i-lucide-image' },
  { label: 'Video', icon: 'i-lucide-video' },
  { label: 'Poll', icon: 'i-lucide-list-plus' },
  { label: 'GIF', icon: 'i-lucide-film' },
  { label: 'Cảm xúc', icon: 'i-lucide-smile-plus' },
]
const extraActions = [
  { label: 'Âm thanh', icon: 'i-lucide-music-4' },
  { label: 'Tệp', icon: 'i-lucide-file-up' },
  { label: 'Câu chuyện', icon: 'i-lucide-clapperboard' },
  { label: 'Sản phẩm', icon: 'i-lucide-shopping-cart' },
]
</script>
