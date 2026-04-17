<template>
  <div class="space-y-4">
    <section class="rounded-[24px] border border-[#dbe3f2] bg-white p-5 shadow-[0_12px_30px_rgba(15,35,110,0.06)]">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0000ff]/70">
            Hoạt động
          </p>
          <h2 class="mt-2 text-[1.3rem] font-black tracking-[-0.04em] text-[#243b63]">
            Bảng tin nhóm
          </h2>
          <p class="mt-1 text-[14px] leading-6 text-slate-500">
            {{ group.activityLabel }}. Đây là khu vực thành viên đăng bài, chia sẻ update và thảo luận theo chủ đề của cộng đồng.
          </p>
        </div>

        <div class="rounded-[18px] bg-[#f8fbff] px-4 py-3 text-[12px] font-semibold text-slate-500">
          {{ group.ownerLabel }}
        </div>
      </div>
    </section>

    <FeedPublisherBox />

    <FeedPostCard
      v-for="post in posts"
      :key="post.id"
      :post="post"
    />
  </div>
</template>

<script setup lang="ts">
import type { CommunityGroupRecord } from "../../../types/community"

defineProps<{
  group: CommunityGroupRecord
  posts: Array<{
    id: number
    author: string
    role: string
    audience: string
    time: string
    text: string
    tags: string[]
    stats: { likes: number; comments: number; shares: number }
    media?: "double" | "single"
    comments: { id: number; author: string; role: string; text: string }[]
  }>
}>()
</script>
