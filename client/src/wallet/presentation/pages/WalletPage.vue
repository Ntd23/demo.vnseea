<!-- English description: Wallet page that mirrors the PHP wallet order using backend-backed data. -->
<template>
  <div class="mx-auto max-w-5xl space-y-5 pb-10">
    <section class="surface-card p-5 sm:p-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--bg-surface-active)] text-[var(--text-brand)]">
            <Icon name="i-ph-wallet-duotone" class="h-6 w-6" />
          </div>
          <div>
            <p class="text-label-secondary">{{ t("pages.walletPage.title") }}</p>
            <h1 class="text-heading text-[var(--text-primary)]">{{ t("pages.walletPage.myWallet") }}</h1>
          </div>
        </div>

        <NuxtLink
          v-if="overview.canWithdraw"
          :to="overview.withdrawalUrl"
          class="btn-secondary w-fit"
        >
          <Icon name="i-ph-bank-duotone" class="h-4 w-4" />
          {{ t("pages.walletPage.withdrawal") }}
        </NuxtLink>
      </div>
    </section>

    <div v-if="loading" class="space-y-5">
      <USkeleton class="h-32 rounded-3xl" />
      <USkeleton class="h-64 rounded-3xl" />
    </div>

    <template v-else>
      <UAlert
        v-if="errorMessage"
        color="error"
        variant="subtle"
        class="rounded-2xl"
        :description="errorMessage"
      />

      <template v-else>
        <WalletHero
          :balance="overview.balance"
          :currency="overview.currency"
          :currency-symbol="overview.currencySymbol"
          :currency-rule="overview.currencyRule"
        >
          <div class="flex flex-wrap gap-2">
            <UButton
              color="primary"
              class="rounded-full font-semibold"
              icon="i-ph-paper-plane-tilt-duotone"
              @click="openSendModal"
            >
              {{ t("pages.walletPage.sendMoney") }}
            </UButton>
            <UButton
              color="neutral"
              variant="soft"
              class="rounded-full font-semibold"
              icon="i-ph-plus-circle-duotone"
              @click="toggleTopupForm"
            >
              {{ t("pages.walletPage.addFunds") }}
            </UButton>
            <UButton
              color="neutral"
              variant="soft"
              class="rounded-full font-semibold"
              icon="i-ph-qr-code-duotone"
              @click="openReceiveQr()"
            >
              {{ t("pages.walletPage.receiveQr") }}
            </UButton>
          </div>
        </WalletHero>

        <UAlert
          v-if="mutationError"
          color="error"
          variant="subtle"
          class="rounded-2xl"
          :description="mutationError"
        />
        <UAlert
          v-if="mutationMessage"
          color="primary"
          variant="subtle"
          class="rounded-2xl"
          :description="mutationMessage"
        />

        <WalletTopupForm
          v-if="topupFormOpen"
          :methods="overview.topupMethods"
          :submitting="toppingUp"
          @topup="createTopup"
        />

        <WalletTransactions
          :transactions="overview.transactions"
          :currency="overview.currency"
          :currency-symbol="overview.currencySymbol"
          :currency-rule="overview.currencyRule"
        />
      </template>
    </template>

    <WalletSendForm
      :open="sendModalOpen"
      :recipients="recipientResults"
      :searching="recipientSearching"
      :submitting="sending"
      :balance="overview.balance"
      @update:open="value => value ? openSendModal() : closeSendModal()"
      @search="searchRecipients"
      @send="sendMoney"
    />

    <FoundationModalShell
      :open="receiveQrOpen"
      :title="t('pages.walletPage.receiveQrTitle')"
      size="md"
      @close="closeReceiveQr"
    >
      <div class="space-y-4 text-center">
          <img
            v-if="receiveQr?.imageUrl"
            :src="receiveQr.imageUrl"
            :alt="t('pages.walletPage.receiveQrTitle')"
            class="mx-auto h-64 w-64 rounded-3xl bg-white p-4 shadow-md"
          >
          <p class="text-body-secondary">{{ t("pages.walletPage.receiveQrDescription") }}</p>
      </div>
    </FoundationModalShell>
  </div>
</template>

<script setup lang="ts">
import { useWalletPageVM } from "../../application/view-models/useWalletPageVM"
import WalletHero from "../components/WalletHero.vue"
import WalletSendForm from "../components/WalletSendForm.vue"
import WalletTopupForm from "../components/WalletTopupForm.vue"
import WalletTransactions from "../components/WalletTransactions.vue"

const { t } = useI18n()

const {
  overview,
  loading,
  errorMessage,
  sendModalOpen,
  topupFormOpen,
  receiveQrOpen,
  recipientResults,
  recipientSearching,
  receiveQr,
  mutationError,
  mutationMessage,
  sending,
  toppingUp,
  openSendModal,
  closeSendModal,
  toggleTopupForm,
  openReceiveQr,
  closeReceiveQr,
  searchRecipients,
  sendMoney,
  createTopup,
} = useWalletPageVM()

useSeoMeta({
  title: () => t("pages.walletPage.seoTitle"),
  description: () => t("pages.walletPage.seoDescription"),
})
</script>
