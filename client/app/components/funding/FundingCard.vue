<template>
  <article class="group overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]">
    <NuxtLink :to="`/show_fund/${campaign.id}`" class="block">
      <div class="relative aspect-[16/9] overflow-hidden bg-[var(--color-secondary-100)]">
        <div class="absolute inset-0" :style="{ background: campaign.coverFallback }" />
        <img :src="campaign.cover" :alt="campaign.title" class="relative h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]" loading="lazy" @error="hideImage">
        <div class="absolute inset-0 bg-[linear-gradient(180deg,transparent_20%,rgba(15,23,42,0.72)_100%)]" />
        <div class="absolute left-3 top-3 flex flex-wrap gap-2">
          <span class="rounded-[10px] bg-[#101828]/82 px-2.5 py-1 text-[11px] font-bold text-white">{{ campaign.categoryLabel }}</span>
          <span v-if="campaign.isOwner" class="rounded-[10px] bg-white/18 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-[4px]">Của tôi</span>
        </div>
        <div class="absolute bottom-3 left-3 right-3">
          <h3 class="line-clamp-2 text-[1.12rem] font-black leading-tight text-white">{{ campaign.title }}</h3>
          <p class="mt-1 text-[12px] font-semibold text-white/78">{{ campaign.owner }} · {{ campaign.location }}</p>
        </div>
      </div>
    </NuxtLink>

    <div class="p-4">
      <p class="min-h-[48px] text-[13px] leading-6 text-[var(--text-secondary)]">{{ campaign.summary }}</p>
      <FundingProgress class="mt-4" :raised="campaign.raisedAmount" :goal="campaign.goalAmount" />

      <div class="mt-4 grid grid-cols-3 gap-2 text-center">
        <div class="rounded-[16px] bg-[var(--color-secondary-100)] p-2">
          <p class="text-[13px] font-black text-[var(--text-primary)]">{{ campaign.backers }}</p>
          <p class="text-[11px] font-semibold text-[var(--text-tertiary)]">ủng hộ</p>
        </div>
        <div class="rounded-[16px] bg-[var(--color-secondary-100)] p-2">
          <p class="text-[13px] font-black text-[var(--text-primary)]">{{ campaign.daysLeft }}</p>
          <p class="text-[11px] font-semibold text-[var(--text-tertiary)]">ngày</p>
        </div>
        <div class="rounded-[16px] bg-[var(--color-secondary-100)] p-2">
          <p class="text-[13px] font-black text-[var(--text-primary)]">{{ campaign.donors.length }}</p>
          <p class="text-[11px] font-semibold text-[var(--text-tertiary)]">donor</p>
        </div>
      </div>

      <div class="mt-4 grid gap-2 sm:grid-cols-2">
        <button class="inline-flex h-11 items-center justify-center gap-2 rounded-[18px] bg-[var(--color-primary-500)] text-[13px] font-extrabold text-white shadow-[var(--shadow-brand)] transition hover:-translate-y-0.5" type="button" @click="$emit('donate', campaign)">
          <Icon name="i-ph-hand-heart-fill" class="h-4 w-4" />
          Ủng hộ
        </button>
        <NuxtLink :to="`/show_fund/${campaign.id}`" class="inline-flex h-11 items-center justify-center rounded-[18px] border border-[var(--border-default)] bg-white text-[13px] font-extrabold text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--color-primary-600)]">
          Chi tiết
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { MockFundingCampaign } from "~/composables/useMockFundingData"

defineProps<{ campaign: MockFundingCampaign }>()

defineEmits<{ donate: [campaign: MockFundingCampaign] }>()

const hideImage = (event: Event) => {
  ;(event.target as HTMLImageElement).style.display = "none"
}
</script>
