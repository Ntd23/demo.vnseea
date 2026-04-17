<template>
  <section class="rounded-[24px] border border-[#dbe3f2] bg-white p-5 shadow-[0_12px_30px_rgba(15,35,110,0.06)]">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0000ff]/70">
          {{ compact ? "Tóm tắt" : "Giới thiệu nhóm" }}
        </p>
        <h3 class="mt-2 text-[1.2rem] font-black tracking-[-0.04em] text-[#243b63]">
          {{ compact ? "Thông tin nhanh" : group.name }}
        </h3>
      </div>

      <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-[#eef3ff] text-[#0000ff]">
        <Icon :name="compact ? 'i-ph-info-bold' : 'i-ph-identification-card-bold'" class="h-5 w-5" />
      </div>
    </div>

    <p class="mt-4 text-[14px] leading-7 text-slate-600">
      {{ group.summary }}
    </p>

    <div class="mt-4 grid gap-3 sm:grid-cols-2">
      <div class="rounded-[18px] bg-[#f8fbff] px-4 py-3">
        <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">Quyền riêng tư</p>
        <p class="mt-1 text-[13px] font-semibold text-[#243b63]">{{ privacyLabel }}</p>
        <p class="mt-1 text-[12px] leading-5 text-slate-500">{{ privacyDescription }}</p>
      </div>
      <div class="rounded-[18px] bg-[#f8fbff] px-4 py-3">
        <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">Danh mục</p>
        <p class="mt-1 text-[13px] font-semibold text-[#243b63]">{{ categoryLabel }}</p>
        <p class="mt-1 text-[12px] leading-5 text-slate-500">{{ group.locationLabel }}</p>
      </div>
    </div>

    <div class="mt-4 space-y-2 text-[13px] text-slate-500">
      <div class="flex items-start gap-2">
        <Icon name="i-ph-calendar-blank-bold" class="mt-0.5 h-4 w-4 text-[#0000ff]/70" />
        <span>{{ group.foundedLabel }}</span>
      </div>
      <div class="flex items-start gap-2">
        <Icon name="i-ph-link-simple-bold" class="mt-0.5 h-4 w-4 text-[#0000ff]/70" />
        <span>{{ group.website }}</span>
      </div>
      <div class="flex items-start gap-2">
        <Icon name="i-ph-users-three-bold" class="mt-0.5 h-4 w-4 text-[#0000ff]/70" />
        <span>{{ memberCountLabel }}</span>
      </div>
    </div>

    <div v-if="!compact && group.guidelines?.length" class="mt-5">
      <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0000ff]/70">
        Nội quy
      </p>
      <div class="mt-3 space-y-2.5">
        <div
          v-for="rule in group.guidelines"
          :key="rule"
          class="rounded-[18px] bg-[#f8fbff] px-4 py-3 text-[13px] leading-6 text-slate-600"
        >
          {{ rule }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CommunityGroupRecord } from "../../../types/community"

withDefaults(defineProps<{
  group: CommunityGroupRecord
  privacyLabel: string
  privacyDescription: string
  categoryLabel: string
  memberCountLabel: string
  compact?: boolean
}>(), {
  compact: false,
})
</script>
