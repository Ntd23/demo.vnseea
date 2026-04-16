<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <p class="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#0000ff]/50">Bình luận</p>
      <div class="flex items-center gap-2 text-[12px] font-semibold text-slate-500">
        <button class="rounded-full bg-white px-2.5 py-1 hover:text-[#0000ff]" type="button">Top</button>
        <button class="rounded-full bg-white px-2.5 py-1 hover:text-[#0000ff]" type="button">Mới nhất</button>
      </div>
    </div>

    <FeedCommentItem
      v-for="comment in comments"
      :key="comment.id"
      :author="comment.author"
      :role="comment.role"
      :text="comment.text"
    />

    <button class="mx-auto block rounded-full border border-[#0000ff]/15 bg-white px-4 py-2 text-[12px] font-semibold text-[#0000ff]/70 transition hover:border-[#0000ff]/30 hover:text-[#0000ff]" type="button">
      Tải thêm bình luận
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  comments: { id: number; author: string; role: string; text: string }[]
}>()
</script>
