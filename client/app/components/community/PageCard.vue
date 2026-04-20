<template>
  <article class="overflow-hidden rounded-[28px] border border-[#dbe3f2] bg-white shadow-[0_14px_34px_rgba(15,35,110,0.08)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,35,110,0.12)]">
    <div class="relative overflow-hidden px-5 pb-5 pt-6 text-white" :style="{ background: page.banner }">
      <div class="pointer-events-none absolute inset-0 opacity-30" :style="{ background: 'radial-gradient(circle_at_top_right, rgba(255,255,255,0.45), transparent 42%)' }" />

      <div class="relative flex items-start justify-between gap-3">
        <div class="min-w-0">
          <span class="inline-flex items-center rounded-full bg-white/16 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/95 backdrop-blur">
            {{ $t(categoryLabel) }}
          </span>

          <NuxtLink
            :to="pageTo"
            class="mt-4 block text-[1.35rem] font-black tracking-[-0.04em] text-white transition hover:text-white/85"
          >
            {{ page.name }}
          </NuxtLink>

          <p class="mt-2 max-w-[28rem] text-[13px] leading-6 text-white/82">
            {{ page.summary }}
          </p>
        </div>

        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-white/16 text-white backdrop-blur">
          <Icon name="i-ph-flag-fill" class="h-6 w-6" />
        </div>
      </div>
    </div>

    <div class="space-y-5 px-5 py-5">
      <div class="flex flex-wrap items-center gap-2 text-[12px] font-semibold">
        <span class="inline-flex items-center rounded-full bg-[#eef3ff] px-3 py-1.5 text-[#243b63]">
          <Icon name="i-ph-users-three" class="mr-1.5 h-4 w-4 text-[#0000ff]" />
          {{ $t('community.pages.format.followers', { count: followerCountLabel }) }}
        </span>
        <span class="inline-flex items-center rounded-full bg-[#f8fafc] px-3 py-1.5 text-slate-500">
          {{ $t('community.pages.format.likes', { count: likeCountLabel }) }}
        </span>
        <span
          v-for="tag in page.tags.slice(0, 2)"
          :key="tag"
          class="inline-flex items-center rounded-full border border-[#e2e8f0] px-3 py-1.5 text-slate-500"
        >
          #{{ tag }}
        </span>
      </div>

      <div class="grid gap-3 md:grid-cols-2">
        <div class="rounded-[20px] border border-[#edf2fb] bg-[#fbfcff] px-4 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">
            Thương hiệu
          </p>
          <p class="mt-1 text-[13px] font-semibold text-[#243b63]">
            {{ page.ownerLabel }}
          </p>
        </div>

        <div class="rounded-[20px] border border-[#edf2fb] bg-[#fbfcff] px-4 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">
            Tương tác
          </p>
          <p class="mt-1 text-[13px] font-semibold text-[#243b63]">
            {{ page.responseLabel }}
          </p>
        </div>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="text-[12px] text-slate-500">
          <span class="font-semibold text-[#243b63]">/p/{{ page.slug }}</span>
          <span class="mx-2 text-slate-300">•</span>
          <span>{{ page.locationLabel || "Fanpage công khai" }}</span>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <NuxtLink
            v-if="page.canManage"
            :to="pageSettingsTo"
            class="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-4 text-[13px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
          >
            <Icon name="i-ph-gear-six-bold" class="mr-1.5 h-4 w-4" />
            Cài đặt
          </NuxtLink>

          <NuxtLink
            :to="pageTo"
            class="inline-flex h-11 items-center justify-center rounded-full px-5 text-[13px] font-bold text-white shadow-[0_10px_20px_rgba(0,0,255,0.18)] transition hover:-translate-y-0.5"
            :style="{ background: primaryButtonBackground }"
          >
            {{ actionLabel }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import {
  communityPageCategoryOptions,
  formatCommunityFollowerCount,
  formatCommunityLikeCount,
  getCommunityOptionLabel,
  getCommunityPagePath,
  getCommunityPageSettingsPath,
} from "../../../types/community"
import type { CommunityPageRecord } from "../../../types/community"

const props = withDefaults(defineProps<{
  page: CommunityPageRecord
  actionLabel?: string
}>(), {
  actionLabel: "Xem fanpage",
})

const followerCountLabel = computed(() =>
  formatCommunityFollowerCount(props.page.followers),
)

const likeCountLabel = computed(() =>
  formatCommunityLikeCount(props.page.likes),
)

const categoryLabel = computed(() =>
  getCommunityOptionLabel(
    communityPageCategoryOptions,
    props.page.category,
    "Chưa phân loại",
  ),
)

const primaryButtonBackground = computed(() =>
  `linear-gradient(135deg, ${props.page.accent} 0%, #0000ff 100%)`,
)

const pageTo = computed(() =>
  getCommunityPagePath(props.page.slug),
)

const pageSettingsTo = computed(() =>
  getCommunityPageSettingsPath(props.page.slug),
)
</script>
