<template>
  <div class="rounded-[20px] border border-[#0000ff]/10 bg-[#0000ff]/3 p-4">
    <div class="flex gap-3">
      <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0000ff] text-xs font-bold text-white shadow-[0_4px_12px_rgba(0,0,255,0.2)]">
        VN
      </div>
      <div class="min-w-0 flex-1">
        <FormsTextareaAutoResize v-model="message" placeholder="Viết bình luận mang tính xây dựng..." />
      </div>
    </div>

    <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap gap-1 text-[#0000ff]/40">
        <button class="rounded-full p-2 transition hover:bg-white hover:text-[#0000ff]" type="button" title="Emoji">
          <Icon name="i-lucide-smile" class="h-4 w-4" />
        </button>
        <button class="rounded-full p-2 transition hover:bg-white hover:text-[#0000ff]" type="button" title="Ảnh">
          <Icon name="i-lucide-image" class="h-4 w-4" />
        </button>
        <button class="rounded-full p-2 transition hover:bg-white hover:text-[#0000ff]" type="button" title="GIF">
          <Icon name="i-lucide-film" class="h-4 w-4" />
        </button>
        <button class="rounded-full p-2 transition hover:bg-white hover:text-[#0000ff]" type="button" title="Sticker">
          <Icon name="i-lucide-sticker" class="h-4 w-4" />
        </button>
        <button class="rounded-full p-2 transition hover:bg-white hover:text-[#0000ff]" type="button" title="Mention">
          <Icon name="i-lucide-at-sign" class="h-4 w-4" />
        </button>
      </div>
      <button
        class="rounded-full bg-[#0000ff] px-4 py-1.5 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(0,0,255,0.22)] transition hover:bg-[#0000cc]"
        type="button"
      >
        Gửi
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const message = ref('')
</script>
