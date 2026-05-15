<!-- English description: Backend-backed funding detail page for the show_fund route. -->
<template>
  <main class="mx-auto w-full max-w-5xl space-y-5 px-3 py-4 sm:px-5">
    <USkeleton v-if="pending" class="h-[520px] rounded-[var(--radius-xl)]" />

    <UAlert v-else-if="error" color="error" variant="soft" :title="String(error.message || error)" />

    <article v-else-if="campaign" class="surface-card overflow-hidden">
      <NuxtImg
        v-if="campaign.imageUrl"
        :src="campaign.imageUrl"
        :alt="campaign.title"
        width="1100"
        height="520"
        class="h-auto max-h-[520px] w-full object-cover"
      />

      <div class="space-y-5 p-4 sm:p-6">
        <div class="flex items-start gap-3">
          <NuxtImg
            v-if="campaign.ownerAvatarUrl"
            :src="campaign.ownerAvatarUrl"
            :alt="campaign.ownerName"
            width="48"
            height="48"
            class="h-12 w-12 rounded-full object-cover"
          />
          <div class="min-w-0">
            <h1 class="text-heading">{{ campaign.title }}</h1>
            <p class="text-caption-secondary mt-1">{{ campaign.ownerName }}</p>
          </div>
        </div>

        <p class="text-body-primary whitespace-pre-line">{{ campaign.description }}</p>

        <div>
          <div class="mb-2 flex justify-between text-caption-secondary">
            <span>{{ formatMoney(campaign.raised) }}</span>
            <span>{{ formatMoney(campaign.amount) }}</span>
          </div>
          <UProgress :model-value="campaign.progress" color="primary" />
        </div>

        <UButton color="primary" class="rounded-[var(--radius-full)]" @click="openDonate">
          {{ t("pages.fundingPage.donate") }}
        </UButton>
      </div>
    </article>

    <UModal v-model:open="donationOpen" :title="campaign?.title || t('pages.fundingPage.donateTitle')">
      <template #body>
        <UInput
          v-model.number="donationAmount"
          type="number"
          min="1"
          :placeholder="t('pages.fundingPage.amountPlaceholder')"
          class="w-full"
        />
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="soft" @click="donationOpen = false">
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
import { ApiFundingRepository } from "../../infrastructure/repositories/ApiFundingRepository"
import type { FundingCampaign } from "../../domain/types/funding.types"

const route = useRoute()
const toast = useToast()
const { t, locale } = useI18n()
const repository = new ApiFundingRepository()
const donationOpen = ref(false)
const donationAmount = ref<number | null>(null)
const donating = ref(false)

const { data, pending, error, refresh } = useAsyncData(
  () => `funding-detail:${route.params.id}`,
  () => $fetch<{
    campaign: FundingCampaign
    currency: string
    currencySymbol: string
  }>(`/_api/funding/${route.params.id}`),
  { watch: [() => route.params.id] },
)

const campaign = computed(() => data.value?.campaign ?? null)

const formatMoney = (amount: number) =>
  formatCurrency(amount, {
    currency: data.value?.currency,
    currencySymbol: data.value?.currencySymbol,
    locale: locale.value,
  })

const openDonate = () => {
  donationOpen.value = true
  donationAmount.value = null
}

const submitDonation = async () => {
  if (!campaign.value || !donationAmount.value) return
  donating.value = true

  try {
    await repository.donate({
      id: campaign.value.id,
      amount: donationAmount.value,
    })
    donationOpen.value = false
    await refresh()
  }
  catch (err) {
    toast.add({
      color: "error",
      title: err instanceof Error ? err.message : "Unable to donate.",
    })
  }
  finally {
    donating.value = false
  }
}
</script>
