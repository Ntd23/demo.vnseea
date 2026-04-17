<template>
  <article class="overflow-hidden rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-lg)]">
    <div class="relative min-h-[360px] overflow-hidden sm:min-h-[430px]">
      <div class="absolute inset-0" :style="{ background: campaign.coverFallback }" />
      <img :src="campaign.cover" :alt="campaign.title" class="absolute inset-0 h-full w-full object-cover" @error="hideImage">
      <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.15),rgba(15,23,42,0.78))]" />
      <div class="relative z-10 flex min-h-[360px] flex-col justify-end p-5 text-white sm:min-h-[430px] sm:p-7">
        <div class="flex flex-wrap gap-2">
          <span class="rounded-[10px] bg-white/18 px-3 py-1 text-[12px] font-bold backdrop-blur">{{ campaign.categoryLabel }}</span>
          <span v-if="campaign.isOwner" class="rounded-[10px] bg-white/18 px-3 py-1 text-[12px] font-bold backdrop-blur">Của tôi</span>
        </div>
        <h1 class="mt-4 max-w-[820px] text-[2rem] font-black leading-tight tracking-[-0.05em] sm:text-[3rem]">{{ campaign.title }}</h1>
        <p class="mt-3 max-w-[680px] text-[15px] leading-7 text-white/84">{{ campaign.summary }}</p>
        <div class="mt-5 flex flex-wrap items-center gap-3">
          <button class="inline-flex h-12 items-center justify-center rounded-[var(--radius-full)] bg-white px-5 text-[14px] font-extrabold text-[var(--color-primary-600)] shadow-[var(--shadow-lg)]" type="button" @click="$emit('donate', campaign)">
            <Icon name="i-ph-hand-heart-fill" class="mr-2 h-4 w-4" />
            Ủng hộ ngay
          </button>
          <NuxtLink to="/funding" class="inline-flex h-12 items-center justify-center rounded-[var(--radius-full)] bg-white/14 px-5 text-[14px] font-extrabold text-white backdrop-blur">
            Quay lại Funding
          </NuxtLink>
        </div>
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
