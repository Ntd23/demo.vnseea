<template>
  <section class="space-y-4">
    <div class="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-md)]">
      <p class="text-label-secondary text-[var(--color-primary-600)]">Tiến độ</p>
      <FundingProgress class="mt-4" :raised="campaign.raisedAmount" :goal="campaign.goalAmount" />
      <div class="mt-5 grid gap-3 sm:grid-cols-3">
        <div class="rounded-[18px] bg-[var(--color-secondary-100)] p-3 text-center">
          <p class="text-[1.2rem] font-black text-[var(--text-primary)]">{{ campaign.backers }}</p>
          <p class="text-[12px] font-semibold text-[var(--text-tertiary)]">người ủng hộ</p>
        </div>
        <div class="rounded-[18px] bg-[var(--color-secondary-100)] p-3 text-center">
          <p class="text-[1.2rem] font-black text-[var(--text-primary)]">{{ campaign.daysLeft }}</p>
          <p class="text-[12px] font-semibold text-[var(--text-tertiary)]">ngày còn lại</p>
        </div>
        <div class="rounded-[18px] bg-[var(--color-secondary-100)] p-3 text-center">
          <p class="text-[1.2rem] font-black text-[var(--text-primary)]">{{ campaign.location }}</p>
          <p class="text-[12px] font-semibold text-[var(--text-tertiary)]">địa điểm</p>
        </div>
      </div>
    </div>

    <div class="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-md)]">
      <p class="text-label-secondary text-[var(--color-primary-600)]">Mô tả</p>
      <p class="mt-3 text-[15px] leading-8 text-[var(--text-secondary)]">{{ campaign.description }}</p>
    </div>

    <div class="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-md)]">
      <p class="text-label-secondary text-[var(--color-primary-600)]">Tác động dự kiến</p>
      <ul class="mt-3 space-y-2">
        <li v-for="item in campaign.impact" :key="item" class="flex gap-2 text-[14px] leading-7 text-[var(--text-secondary)]">
          <Icon name="i-ph-check-circle-fill" class="mt-1 h-4 w-4 shrink-0 text-[var(--color-success)]" />
          <span>{{ item }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { MockFundingCampaign } from "~/composables/useMockFundingData"
defineProps<{ campaign: MockFundingCampaign }>()
</script>
