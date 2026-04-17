<template>
  <article class="overflow-hidden rounded-[28px] border border-[#dbe3f2] bg-white shadow-[0_14px_34px_rgba(15,35,110,0.08)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,35,110,0.12)]">
    <div class="relative overflow-hidden px-5 pb-5 pt-6 text-white" :style="{ background: group.banner }">
      <div class="pointer-events-none absolute inset-0 opacity-30" :style="{ background: 'radial-gradient(circle_at_top_right, rgba(255,255,255,0.45), transparent 42%)' }" />
      <div class="relative flex items-start justify-between gap-3">
        <div class="min-w-0">
          <span class="inline-flex items-center rounded-full bg-white/16 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/95 backdrop-blur">
            {{ privacyLabel }}
          </span>
          <NuxtLink
            :to="groupTo"
            class="mt-4 block text-[1.35rem] font-black tracking-[-0.04em] text-white transition hover:text-white/85"
          >
            {{ group.name }}
          </NuxtLink>
          <p class="mt-2 max-w-[28rem] text-[13px] leading-6 text-white/82">
            {{ group.summary }}
          </p>
        </div>

        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-white/16 text-white backdrop-blur">
          <Icon name="i-ph-users-three-fill" class="h-6 w-6" />
        </div>
      </div>
    </div>

    <div class="space-y-5 px-5 py-5">
      <div class="flex flex-wrap items-center gap-2 text-[12px] font-semibold">
        <span class="inline-flex items-center rounded-full bg-[#eef3ff] px-3 py-1.5 text-[#243b63]">
          <Icon name="i-ph-users" class="mr-1.5 h-4 w-4 text-[#0000ff]" />
          {{ memberLabel }}
        </span>
        <span class="inline-flex items-center rounded-full bg-[#f8fafc] px-3 py-1.5 text-slate-500">
          {{ categoryLabel }}
        </span>
        <span
          v-for="tag in group.tags.slice(0, 2)"
          :key="tag"
          class="inline-flex items-center rounded-full border border-[#e2e8f0] px-3 py-1.5 text-slate-500"
        >
          #{{ tag }}
        </span>
      </div>

      <div class="grid gap-3 md:grid-cols-2">
        <div class="rounded-[20px] border border-[#edf2fb] bg-[#fbfcff] px-4 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">
            Hoạt động
          </p>
          <p class="mt-1 text-[13px] font-semibold text-[#243b63]">
            {{ group.activityLabel }}
          </p>
        </div>

        <div class="rounded-[20px] border border-[#edf2fb] bg-[#fbfcff] px-4 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">
            Ngữ cảnh
          </p>
          <p class="mt-1 text-[13px] font-semibold text-[#243b63]">
            {{ group.ownerLabel }}
          </p>
        </div>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="text-[12px] text-slate-500">
          <span class="font-semibold text-[#243b63]">/g/{{ group.slug }}</span>
          <span class="mx-2 text-slate-300">•</span>
          <span>{{ privacyDescription }}</span>
        </div>

        <NuxtLink
          :to="groupTo"
          class="inline-flex h-11 items-center justify-center rounded-full px-5 text-[13px] font-bold text-white shadow-[0_10px_20px_rgba(0,0,255,0.18)] transition hover:-translate-y-0.5"
          :style="{ background: primaryButtonBackground }"
        >
          {{ actionLabel }}
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import {
  formatCommunityMemberCount,
  getCommunityGroupPath,
  communityCategoryOptions,
  communityPrivacyOptions,
  getCommunityOptionDescription,
  getCommunityOptionLabel,
} from "../../../types/community"
import type { CommunityGroupRecord } from "../../../types/community"

const props = withDefaults(defineProps<{
  group: CommunityGroupRecord
  actionLabel?: string
}>(), {
  actionLabel: "Xem nhóm",
})

const memberLabel = computed(() =>
  formatCommunityMemberCount(props.group.members),
)

const privacyLabel = computed(() =>
  getCommunityOptionLabel(communityPrivacyOptions, props.group.privacy, "Nhóm"),
)

const privacyDescription = computed(() =>
  getCommunityOptionDescription(communityPrivacyOptions, props.group.privacy, "Cài đặt quyền riêng tư đang được áp dụng cho nhóm này."),
)

const categoryLabel = computed(() =>
  getCommunityOptionLabel(communityCategoryOptions, props.group.category, "Chưa phân loại"),
)

const primaryButtonBackground = computed(() =>
  `linear-gradient(135deg, ${props.group.accent} 0%, #0000ff 100%)`,
)

const groupTo = computed(() =>
  getCommunityGroupPath(props.group.slug),
)
</script>
