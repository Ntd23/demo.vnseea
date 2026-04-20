<template>
  <aside class="space-y-4">
    <section class="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)]">
      <div class="flex items-center gap-3">
        <div class="avatar-lg text-white" :style="{ background: campaign.ownerGradient }">{{ campaign.ownerInitials }}</div>
        <div>
          <p class="text-label-secondary text-[var(--color-primary-600)]">{{ $t("pages.showFundPage.ownerEyebrow") }}</p>
          <p class="text-title-primary">{{ campaign.owner }}</p>
        </div>
      </div>
      <button class="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[18px] bg-[var(--color-primary-500)] text-[13px] font-extrabold text-white shadow-[var(--shadow-brand)]" type="button" @click="$emit('donate', campaign)">
        <Icon name="i-ph-hand-heart-fill" class="h-4 w-4" />
        {{ $t("pages.fundingPage.donate") }}
      </button>
    </section>

    <section class="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)]">
      <p class="text-label-secondary text-[var(--color-primary-600)]">{{ $t("pages.showFundPage.donorsEyebrow") }}</p>
      <div class="mt-4 space-y-3">
        <div v-for="donor in campaign.donors" :key="donor.id" class="flex gap-3">
          <div class="avatar-sm text-white" :style="{ background: donor.gradient }">{{ donor.initials }}</div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-[13px] font-bold text-[var(--text-primary)]">{{ donor.name }}</p>
            <p class="text-[12px] font-bold text-[var(--color-primary-600)]">{{ formatFundingCurrency(donor.amount, locale.value) }}</p>
            <p class="mt-1 text-[12px] leading-5 text-[var(--text-secondary)]">{{ donor.message }}</p>
          </div>
        </div>
      </div>
    </section>

    <section v-if="campaign.isOwner" class="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)]">
      <p class="text-label-secondary text-[var(--color-primary-600)]">{{ $t("pages.showFundPage.managementEyebrow") }}</p>
      <div class="mt-4 grid gap-2">
        <button class="h-10 rounded-[16px] bg-[var(--color-primary-50)] text-[13px] font-bold text-[var(--color-primary-600)]" type="button" @click="ownerMessage = t('pages.showFundPage.editMessage')">{{ $t("pages.showFundPage.edit") }}</button>
        <button class="h-10 rounded-[16px] bg-[var(--color-secondary-100)] text-[13px] font-bold text-[var(--text-secondary)]" type="button" @click="ownerMessage = t('pages.showFundPage.deleteMessage')">{{ $t("pages.showFundPage.delete") }}</button>
      </div>
      <p v-if="ownerMessage" class="mt-3 text-[12px] font-semibold text-[var(--color-primary-600)]">{{ ownerMessage }}</p>
    </section>
  </aside>
</template>

<script setup lang="ts">
import type { MockFundingCampaign } from "~/composables/useMockFundingData"
import { formatFundingCurrency } from "~/composables/useMockFundingData"

defineProps<{ campaign: MockFundingCampaign }>()
defineEmits<{ donate: [campaign: MockFundingCampaign] }>()
const { t, locale } = useI18n()
const ownerMessage = ref("")
</script>
