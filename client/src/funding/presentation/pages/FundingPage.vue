<!-- English description: Backend-backed funding listing page aligned to the WoWonder funding phtml section order. -->
<template>
  <main class="mx-auto w-full max-w-6xl space-y-5 px-3 py-4 sm:px-5">
    <section class="surface-card p-4 sm:p-5">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <span class="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-surface-active)] text-[var(--text-brand)]">
            <Icon name="i-ph-hand-heart-duotone" class="h-6 w-6" />
          </span>
          <div>
            <p class="text-label-secondary">Funding</p>
            <h1 class="text-heading">{{ t("pages.fundingPage.heroTitle") }}</h1>
          </div>
        </div>

        <UButton
          v-if="canCreate"
          to="/create_funding"
          color="primary"
          class="rounded-[var(--radius-full)]"
        >
          <Icon name="i-ph-plus-bold" class="h-4 w-4" />
          {{ t("pages.fundingPage.createCampaign") }}
        </UButton>
      </div>
    </section>

    <section class="surface-card flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex gap-2 overflow-x-auto scrollbar-hide">
        <UButton
          v-for="tab in tabs"
          :key="tab.value"
          :color="activeTab === tab.value ? 'primary' : 'neutral'"
          :variant="activeTab === tab.value ? 'solid' : 'soft'"
          class="shrink-0 rounded-[var(--radius-full)]"
          @click="setTab(tab.value)"
        >
          {{ tab.label }}
        </UButton>
      </div>
    </section>

    <section v-if="pending" class="grid gap-4 md:grid-cols-2">
      <USkeleton v-for="index in 4" :key="index" class="h-80 rounded-[var(--radius-xl)]" />
    </section>

    <UAlert
      v-else-if="error"
      color="error"
      variant="soft"
      :title="String(error.message || error)"
    />

    <section v-else-if="items.length" class="grid gap-4 md:grid-cols-2">
      <article
        v-for="campaign in items"
        :key="campaign.id"
        class="surface-card-hover overflow-hidden"
      >
        <NuxtLink :to="campaign.detailUrl" class="block">
          <div class="relative aspect-[16/9] overflow-hidden bg-[var(--bg-muted)]">
            <NuxtImg
              v-if="campaign.imageUrl"
              :src="campaign.imageUrl"
              :alt="campaign.title"
              width="720"
              height="405"
              class="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </NuxtLink>

        <div class="space-y-4 p-4">
          <div class="flex items-start gap-3">
            <NuxtImg
              v-if="campaign.ownerAvatarUrl"
              :src="campaign.ownerAvatarUrl"
              :alt="campaign.ownerName"
              width="40"
              height="40"
              class="h-10 w-10 rounded-full object-cover"
              loading="lazy"
            />
            <div class="min-w-0">
              <NuxtLink :to="campaign.detailUrl" class="text-title-primary line-clamp-2">
                {{ campaign.title }}
              </NuxtLink>
              <p class="text-caption-secondary mt-1 truncate">
                {{ campaign.ownerName }}
              </p>
            </div>
          </div>

          <p class="text-body-secondary line-clamp-2 whitespace-pre-line">
            {{ campaign.description }}
          </p>

          <div>
            <div class="mb-2 flex items-center justify-between gap-3 text-caption-secondary">
              <span>{{ formatMoney(campaign.raised) }}</span>
              <span>{{ formatMoney(campaign.amount) }}</span>
            </div>
            <UProgress :model-value="campaign.progress" color="primary" />
          </div>

          <div class="flex flex-wrap gap-2">
            <UButton color="primary" class="rounded-[var(--radius-full)]" @click="openDonate(campaign)">
              {{ t("pages.fundingPage.donate") }}
            </UButton>
            <UButton :to="campaign.detailUrl" color="neutral" variant="soft" class="rounded-[var(--radius-full)]">
              {{ t("pages.fundingPage.detail") }}
            </UButton>
          </div>
        </div>
      </article>
    </section>

    <UCard v-else class="surface-card text-center" :ui="{ body: 'p-8' }">
      <Icon name="i-ph-hand-heart-duotone" class="mx-auto h-10 w-10 text-[var(--text-tertiary)]" />
      <h2 class="text-heading mt-3">{{ t("pages.fundingPage.emptyTitle") }}</h2>
      <p class="text-body-secondary mt-2">{{ t("pages.fundingPage.emptyDescription") }}</p>
    </UCard>

    <div v-if="hasMore && !pending" class="flex justify-center">
      <UButton
        color="neutral"
        variant="soft"
        class="rounded-[var(--radius-full)]"
        :loading="loadingMore"
        @click="loadMore"
      >
        {{ t("navigation.leftSidebar.showMore") }}
      </UButton>
    </div>

    <UModal v-model:open="donationOpen" :title="donationTarget?.title || t('pages.fundingPage.donateTitle')">
      <template #body>
        <div class="space-y-4">
          <UInput
            v-model.number="donationAmount"
            type="number"
            min="1"
            :placeholder="t('pages.fundingPage.amountPlaceholder')"
            class="w-full"
          />
        </div>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="soft" @click="donationTarget = null">
            {{ t("pages.fundingPage.close") }}
          </UButton>
          <UButton color="primary" :loading="donating" @click="submitDonation">
            {{ t("pages.fundingPage.donate") }}
          </UButton>
        </div>
      </template>
    </UModal>
  </main>
</template>

<script setup lang="ts">
import { formatCurrency } from "../../../shared-kernel/application/utils/formatCurrency"
import { useFundingPageVM } from "../../application/view-models/useFundingPageVM"

const { t, locale } = useI18n()
const {
  activeTab,
  items,
  canCreate,
  currency,
  currencySymbol,
  hasMore,
  pending,
  error,
  loadingMore,
  donationTarget,
  donationAmount,
  donating,
  setTab,
  loadMore,
  openDonate,
  submitDonation,
} = useFundingPageVM()

const tabs = [
  { value: "browse" as const, label: t("pages.fundingPage.results") },
  { value: "mine" as const, label: t("pages.fundingPage.ownerBadge") },
]

const donationOpen = computed({
  get: () => Boolean(donationTarget.value),
  set: (value) => {
    if (!value) donationTarget.value = null
  },
})

const formatMoney = (amount: number) =>
  formatCurrency(amount, {
    currency: currency.value,
    currencySymbol: currencySymbol.value,
    locale: locale.value,
  })
</script>
