<template>
  <section class="rounded-[24px] border border-[#dbe3f2] bg-white p-5 shadow-[0_12px_30px_rgba(15,35,110,0.06)]">
    <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0000ff]/70">
      Tương tác fanpage
    </p>
    <h3 class="mt-2 text-[1.15rem] font-black tracking-[-0.04em] text-[#243b63]">
      Theo dõi, nhắn tin và cập nhật
    </h3>
    <p class="mt-2 text-[13px] leading-6 text-slate-500">
      {{ page.responseLabel }} Fanpage này có thể dùng CTA để điều hướng người xem sang hộp thư, cửa hàng hoặc landing page chính.
    </p>

    <div class="mt-4 grid gap-3 sm:grid-cols-2">
      <button
        class="inline-flex h-11 items-center justify-center rounded-[16px] bg-[#0000ff] px-4 text-[13px] font-extrabold text-white shadow-[0_12px_24px_rgba(0,0,255,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0000e0]"
        type="button"
      >
        <Icon name="i-ph-bell-simple-ringing-bold" class="mr-2 h-4 w-4" />
        {{ page.ctaLabel || "Theo dõi" }}
      </button>

      <button
        class="inline-flex h-11 items-center justify-center rounded-[16px] border border-[#dbe3f2] bg-[#f8fbff] px-4 text-[13px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
        type="button"
      >
        <Icon name="i-ph-chat-circle-dots-bold" class="mr-2 h-4 w-4" />
        Nhắn tin
      </button>
    </div>

    <div class="mt-4 grid gap-3 sm:grid-cols-2">
      <div class="rounded-[18px] bg-[#f8fbff] px-4 py-3">
        <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">Theo dõi</p>
        <p class="mt-1 text-[15px] font-black text-[#243b63]">{{ followerCountLabel }}</p>
      </div>
      <div class="rounded-[18px] bg-[#f8fbff] px-4 py-3">
        <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">Yêu thích</p>
        <p class="mt-1 text-[15px] font-black text-[#243b63]">{{ likeCountLabel }}</p>
      </div>
    </div>

    <div v-if="page.canManage" class="mt-4 rounded-[18px] border border-[#dbe3f2] bg-white px-4 py-3">
      <p class="text-[12px] font-semibold text-[#243b63]">Bạn đang có quyền quản lý fanpage này.</p>
      <p class="mt-1 text-[12px] leading-5 text-slate-500">
        Ở bước tiếp theo bạn có thể chỉnh CTA, thông tin liên hệ, cover và các thiết lập hiển thị của trang.
      </p>
      <button
        class="mt-3 inline-flex h-10 items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-4 text-[12px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
        type="button"
      >
        <Icon name="i-ph-gear-six-bold" class="mr-1.5 h-4 w-4" />
        Cài đặt trang
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CommunityPageRecord } from "../../../types/community"

defineProps<{
  page: CommunityPageRecord
  followerCountLabel: string
  likeCountLabel: string
}>()
</script>
