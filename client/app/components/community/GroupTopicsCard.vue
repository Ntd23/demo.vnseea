<template>
  <section class="rounded-[24px] border border-[#dbe3f2] bg-white p-5 shadow-[0_12px_30px_rgba(15,35,110,0.06)]">
    <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0000ff]/70">
      Chủ đề nổi bật
    </p>
    <div class="mt-4 flex flex-wrap gap-2">
      <span
        v-for="tag in group.tags"
        :key="tag"
        class="inline-flex items-center rounded-full bg-[#eef3ff] px-3 py-1.5 text-[12px] font-semibold text-[#243b63]"
      >
        #{{ tag }}
      </span>
    </div>

    <div class="mt-5 grid gap-3 sm:grid-cols-2">
      <div class="rounded-[18px] bg-[#f8fbff] px-4 py-3">
        <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">Dành cho ai</p>
        <p class="mt-1 text-[13px] leading-6 text-slate-600">
          Thành viên quan tâm tới {{ categoryLabel.toLowerCase() }}, muốn trao đổi có chiều sâu và cập nhật đều đặn trong một không gian rõ chủ đề.
        </p>
      </div>
      <div class="rounded-[18px] bg-[#f8fbff] px-4 py-3">
        <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">Cách tham gia</p>
        <p class="mt-1 text-[13px] leading-6 text-slate-600">
          {{ privacyDescription }} Sau khi vào nhóm, thành viên có thể đăng bài, bình luận và mời thêm bạn bè phù hợp.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CommunityGroupRecord } from "../../../types/community"

defineProps<{
  group: CommunityGroupRecord
  categoryLabel: string
  privacyDescription: string
}>()
</script>
