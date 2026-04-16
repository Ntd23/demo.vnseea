<template>
  <div class="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#f8fbff]">
    <div class="shrink-0 border-b border-[#dce6fb] bg-white px-4 py-4 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
      <div class="flex items-center justify-between gap-3">
        <div class="flex min-w-0 cursor-pointer items-center gap-3 rounded-[1rem] p-1 transition hover:bg-[#f8fbff]">
          <div class="relative shrink-0">
            <img src="https://i.pravatar.cc/150?u=12" class="h-11 w-11 rounded-full object-cover">
            <span class="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
          </div>
          <div class="min-w-0">
            <h3 class="truncate text-[0.98rem] font-bold leading-tight text-[#243b63]">Thanh Hà</h3>
            <p class="mt-0.5 text-[0.82rem] text-slate-500">Đang hoạt động</p>
          </div>
        </div>

        <div class="flex items-center gap-1.5">
          <button class="flex h-10 w-10 items-center justify-center rounded-full text-[#0000ff] transition hover:bg-[#eef2ff]" type="button">
            <Icon name="i-ph-phone-fill" class="h-5 w-5" />
          </button>
          <button class="flex h-10 w-10 items-center justify-center rounded-full text-[#0000ff] transition hover:bg-[#eef2ff]" type="button">
            <Icon name="i-ph-video-camera-fill" class="h-5 w-5" />
          </button>
          <button class="flex h-10 w-10 items-center justify-center rounded-full text-[#0000ff] transition hover:bg-[#eef2ff]" type="button">
            <Icon name="i-ph-info-fill" class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    <div class="flex-1 min-h-0 overflow-y-auto bg-[#f8fbff] px-4 py-5 scrollbar-hide">
      <div class="flex justify-center pb-2">
        <button class="rounded-full border border-[#dbe3f2] bg-white px-4 py-2 text-[0.8rem] font-semibold text-slate-500 shadow-[0_6px_20px_rgba(15,23,42,0.04)] transition hover:border-[#c7d3ea] hover:text-[#0000ff]" type="button">
          Tải tin nhắn cũ hơn
        </button>
      </div>

      <div v-for="(msg, idx) in messages" :key="idx" class="flex flex-col" :class="msg.isMine ? 'items-end' : 'items-start'">
        <div v-if="msg.showTime" class="self-center my-4 text-[0.75rem] font-medium text-slate-400">
          {{ msg.time }}
        </div>

        <div class="flex max-w-[78%] items-end gap-2 sm:max-w-[70%]">
          <img v-if="!msg.isMine && msg.isLast" src="https://i.pravatar.cc/150?u=12" class="mb-1 h-7 w-7 shrink-0 rounded-full object-cover">
          <div v-else-if="!msg.isMine" class="w-7 shrink-0"></div>

          <div class="group relative">
            <div class="relative whitespace-pre-wrap px-4 py-2.5 text-[0.95rem] leading-relaxed shadow-sm" :class="[msg.isMine ? 'rounded-l-[18px] rounded-br-[4px] rounded-tr-[18px] bg-[linear-gradient(180deg,#2749ff_0%,#0000ff_100%)] text-white' : 'rounded-r-[18px] rounded-bl-[4px] rounded-tl-[18px] border border-[#dbe3f2] bg-white text-slate-800']">
              {{ msg.text }}
            </div>
          </div>
        </div>
      </div>

      <div class="mt-3 flex max-w-[78%] items-center gap-2 sm:max-w-[70%]">
        <img src="https://i.pravatar.cc/150?u=12" class="h-7 w-7 shrink-0 rounded-full object-cover">
        <div class="flex h-[36px] items-center gap-1 rounded-[18px] border border-[#dbe3f2] bg-white px-3 shadow-sm">
          <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style="animation-delay: 0ms"></span>
          <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style="animation-delay: 150ms"></span>
          <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style="animation-delay: 300ms"></span>
        </div>
      </div>
    </div>

    <div class="shrink-0 border-t border-[#dce6fb] bg-white px-4 py-4 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] shadow-[0_-8px_18px_rgba(15,23,42,0.03)]">
      <div class="flex items-end gap-2">
        <button class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#0000ff] transition hover:bg-[#eef2ff]" type="button">
          <Icon name="i-ph-plus-circle-fill" class="h-6 w-6" />
        </button>
        <div class="hidden shrink-0 items-center gap-1 lg:flex">
          <button class="flex h-10 w-10 items-center justify-center rounded-full text-[#0000ff] transition hover:bg-[#eef2ff]" type="button">
            <Icon name="i-ph-image-fill" class="h-6 w-6" />
          </button>
          <button class="flex h-10 w-10 items-center justify-center rounded-full text-[#0000ff] transition hover:bg-[#eef2ff]" type="button">
            <Icon name="i-ph-sticker-fill" class="h-6 w-6" />
          </button>
          <button class="flex h-10 w-10 items-center justify-center rounded-full text-[#0000ff] transition hover:bg-[#eef2ff]" type="button">
            <Icon name="i-ph-gif-fill" class="h-6 w-6" />
          </button>
        </div>

        <div class="flex flex-1 items-center rounded-[1.25rem] border border-[#dbe3f2] bg-[#f8fbff] pr-2">
          <textarea rows="1" class="max-h-[120px] w-full resize-none bg-transparent px-4 py-2.5 text-[0.95rem] outline-none placeholder:text-slate-500 scrollbar-hide" placeholder="Aa" />
          <button class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#0000ff] transition hover:bg-[#eef2ff]" type="button">
            <Icon name="i-ph-smiley-fill" class="h-[22px] w-[22px]" />
          </button>
        </div>

        <button class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#0000ff] transition hover:bg-[#eef2ff]" type="button">
          <Icon name="i-ph-thumbs-up-fill" class="h-6 w-6" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const messages = [
  { text: 'Helo cậu!', isMine: false, time: 'T4 10:20', showTime: true, isLast: false },
  { text: 'Hôm nay làm bài xong chưa?', isMine: false, isLast: true },
  { text: 'Cũng gần xong rồi á', isMine: true, isLast: false },
  { text: 'Còn phần UI trang Messages này thôi\nđang ráng làm cho xong hihi', isMine: true, isLast: true },
  { text: 'Oke cố lên nhaa', isMine: false, time: '11:30', showTime: true, isLast: false },
  { text: 'Chừng nào xong rủ đi ăn uống bữa cho vui', isMine: false, isLast: true },
  { text: 'Oh ye sure', isMine: true, time: '11:35', showTime: true, isLast: true },
]
</script>
