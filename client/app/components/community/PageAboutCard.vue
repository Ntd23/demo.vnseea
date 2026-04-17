<template>
  <section class="rounded-[24px] border border-[#dbe3f2] bg-white p-5 shadow-[0_12px_30px_rgba(15,35,110,0.06)]">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0000ff]/70">
          {{ compact ? "Tóm tắt" : "Giới thiệu fanpage" }}
        </p>
        <h3 class="mt-2 text-[1.2rem] font-black tracking-[-0.04em] text-[#243b63]">
          {{ compact ? "Thông tin nhanh" : page.name }}
        </h3>
      </div>

      <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-[#eef3ff] text-[#0000ff]">
        <Icon :name="compact ? 'i-ph-info-bold' : 'i-ph-megaphone-simple-bold'" class="h-5 w-5" />
      </div>
    </div>

    <p class="mt-4 text-[14px] leading-7 text-slate-600">
      {{ page.summary }}
    </p>

    <div class="mt-4 grid gap-3 sm:grid-cols-2">
      <div class="rounded-[18px] bg-[#f8fbff] px-4 py-3">
        <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">Danh mục</p>
        <p class="mt-1 text-[13px] font-semibold text-[#243b63]">{{ categoryLabel }}</p>
        <p class="mt-1 text-[12px] leading-5 text-slate-500">{{ page.ownerLabel }}</p>
      </div>
      <div class="rounded-[18px] bg-[#f8fbff] px-4 py-3">
        <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">Tương tác</p>
        <p class="mt-1 text-[13px] font-semibold text-[#243b63]">{{ page.responseLabel }}</p>
        <p class="mt-1 text-[12px] leading-5 text-slate-500">
          {{
            [
              showFollowerCount ? followerCountLabel : "",
              showLikeCount ? likeCountLabel : "",
            ].filter(Boolean).join(" · ") || "Đã ẩn chỉ số công khai"
          }}
        </p>
      </div>
    </div>

    <div class="mt-4 space-y-2 text-[13px] text-slate-500">
      <div v-if="page.locationLabel" class="flex items-start gap-2">
        <Icon name="i-ph-map-pin-bold" class="mt-0.5 h-4 w-4 text-[#0000ff]/70" />
        <span>{{ page.locationLabel }}</span>
      </div>
      <div v-if="page.website" class="flex items-start gap-2">
        <Icon name="i-ph-link-simple-bold" class="mt-0.5 h-4 w-4 text-[#0000ff]/70" />
        <span>{{ page.website }}</span>
      </div>
      <div v-if="page.foundedLabel" class="flex items-start gap-2">
        <Icon name="i-ph-calendar-blank-bold" class="mt-0.5 h-4 w-4 text-[#0000ff]/70" />
        <span>{{ page.foundedLabel }}</span>
      </div>
      <div v-if="showFollowerCount" class="flex items-start gap-2">
        <Icon name="i-ph-users-three-bold" class="mt-0.5 h-4 w-4 text-[#0000ff]/70" />
        <span>{{ followerCountLabel }}</span>
      </div>
    </div>

    <div v-if="!compact" class="mt-5">
      <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0000ff]/70">
        Chủ đề chính
      </p>
      <div class="mt-3 flex flex-wrap gap-2">
        <span
          v-for="tag in page.tags"
          :key="tag"
          class="inline-flex items-center rounded-full bg-[#eef3ff] px-3 py-1.5 text-[12px] font-semibold text-[#243b63]"
        >
          #{{ tag }}
        </span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CommunityPageRecord } from "../../../types/community"

withDefaults(defineProps<{
  page: CommunityPageRecord
  categoryLabel: string
  followerCountLabel: string
  likeCountLabel: string
  compact?: boolean
  showFollowerCount?: boolean
  showLikeCount?: boolean
}>(), {
  compact: false,
  showFollowerCount: true,
  showLikeCount: true,
})
</script>
