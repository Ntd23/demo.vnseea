<!-- English description: Wallet page that mirrors the PHP wallet order using backend-backed data. -->
<template>
  <div class="mx-auto max-w-5xl space-y-5 pb-10">
    <section class="surface-card p-5 sm:p-6">
      <div class="flex flex-col gap-3 sm:flex-row items-center justify-between">
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
          :transactions-count="overview.transactions.length"
          :topup-methods-count="overview.topupMethods.length"
          :currency="overview.currency"
          :currency-symbol="overview.currencySymbol"
          :currency-rule="overview.currencyRule"
        >
          <button
            type="button"
            class="wallet-action wallet-action--primary"
            :class="{ 'wallet-action--active': topupFormOpen }"
            @click="openTopupForm"
          >
            <span class="wallet-action__icon">
              <Icon name="i-ph-plus-circle-duotone" class="h-5 w-5" />
            </span>
            <span>{{ t("pages.walletPage.addFunds") }}</span>
          </button>
          <button
            type="button"
            class="wallet-action"
            :class="{ 'wallet-action--active': sendModalOpen }"
            @click="openSendModal"
          >
            <span class="wallet-action__icon">
              <Icon name="i-ph-paper-plane-tilt-duotone" class="h-5 w-5" />
            </span>
            <span>{{ t("pages.walletPage.sendMoney") }}</span>
          </button>
          <button
            type="button"
            class="wallet-action"
            :class="{ 'wallet-action--active': receiveQrOpen }"
            @click="openReceiveQr()"
          >
            <span class="wallet-action__icon">
              <Icon name="i-ph-qr-code-duotone" class="h-5 w-5" />
            </span>
            <span>{{ t("pages.walletPage.receiveQr") }}</span>
          </button>
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

        <section v-if="topupFormOpen" class="wallet-inline-panel">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div>
              <p class="text-label-secondary">{{ t("pages.walletPage.addFunds") }}</p>
              <h2 class="text-heading text-[var(--text-primary)]">{{ t("pages.walletPage.topupTitle") }}</h2>
            </div>
            <button type="button" class="wallet-panel-close" @click="closeTopupForm">
              <Icon name="i-ph-x-duotone" class="h-5 w-5" />
            </button>
          </div>
          <WalletTopupForm
            :methods="overview.topupMethods"
            :submitting="toppingUp"
            @topup="createTopup"
          />

          <div v-if="sepayTopup?.qrUrl" class="wallet-sepay-result">
            <img
              :src="sepayTopup.qrUrl"
              :alt="t('pages.walletPage.sepayTitle')"
              class="wallet-sepay-result__qr"
            >
            <div class="wallet-sepay-result__details">
              <p class="wallet-sepay-result__title">{{ t("pages.walletPage.sepayTitle") }}</p>
              <dl class="wallet-sepay-result__list">
                <div>
                  <dt>{{ t("pages.walletPage.sepayOrderCode") }}</dt>
                  <dd>{{ sepayTopup.orderCode || "-" }}</dd>
                </div>
                <div>
                  <dt>{{ t("pages.walletPage.sepayBank") }}</dt>
                  <dd>{{ sepayTopup.bankCode || "-" }}</dd>
                </div>
                <div>
                  <dt>{{ t("pages.walletPage.sepayAccountNumber") }}</dt>
                  <dd>{{ sepayTopup.accountNumber || "-" }}</dd>
                </div>
                <div>
                  <dt>{{ t("pages.walletPage.sepayAccountName") }}</dt>
                  <dd>{{ sepayTopup.accountName || "-" }}</dd>
                </div>
                <div>
                  <dt>{{ t("pages.walletPage.sepayAmount") }}</dt>
                  <dd>{{ formattedSepayAmount }}</dd>
                </div>
              </dl>
              <p class="wallet-sepay-result__hint">{{ t("pages.walletPage.sepayDescription") }}</p>
              <UButton
                block
                color="primary"
                class="rounded-full font-semibold"
                :loading="toppingUp"
                icon="i-ph-arrows-clockwise-duotone"
                @click="checkSepayTopup"
              >
                {{ t("pages.walletPage.sepayCheck") }}
              </UButton>
            </div>
          </div>
        </section>

        <section v-if="sendModalOpen" class="wallet-inline-panel">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div>
              <p class="text-label-secondary">{{ t("pages.walletPage.sendEyebrow") }}</p>
              <h2 class="text-heading text-[var(--text-primary)]">{{ t("pages.walletPage.sendMoneyTitle") }}</h2>
            </div>
            <button type="button" class="wallet-panel-close" @click="closeSendModal">
              <Icon name="i-ph-x-duotone" class="h-5 w-5" />
            </button>
          </div>
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
        </section>

        <section v-if="receiveQrOpen" class="wallet-inline-panel">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div>
              <p class="text-label-secondary">{{ t("pages.walletPage.receiveQr") }}</p>
              <h2 class="text-heading text-[var(--text-primary)]">{{ t("pages.walletPage.receiveQrTitle") }}</h2>
            </div>
            <button type="button" class="wallet-panel-close" @click="closeReceiveQr">
              <Icon name="i-ph-x-duotone" class="h-5 w-5" />
            </button>
          </div>
          <div class="space-y-4 text-center">
            <div class="grid gap-2 text-left sm:grid-cols-[1fr_auto]">
              <UFormField :label="t('pages.walletPage.receiveAmount')">
                <UInputNumber
                  v-model="receiveAmount"
                  :min="0"
                  class="w-full"
                />
              </UFormField>
              <UButton
                color="neutral"
                variant="soft"
                class="self-end rounded-full font-semibold"
                icon="i-ph-arrows-clockwise-duotone"
                @click="openReceiveQr(receiveAmount)"
              >
                {{ t("pages.walletPage.updateQr") }}
              </UButton>
            </div>
            <img
              v-if="receiveQr?.imageUrl"
              :src="receiveQr.imageUrl"
              :alt="t('pages.walletPage.receiveQrTitle')"
              class="mx-auto h-64 w-64 rounded-2xl bg-white p-4 shadow-md"
            >
            <p class="text-body-secondary">{{ t("pages.walletPage.receiveQrDescription") }}</p>
          </div>
        </section>

        <WalletTransactions
          :transactions="overview.transactions"
          :currency="overview.currency"
          :currency-symbol="overview.currencySymbol"
          :currency-rule="overview.currencyRule"
        />
      </template>
    </template>

  </div>
</template>

<script setup lang="ts">
import { formatCurrency } from "#shared-kernel/application/utils/formatCurrency"
import { useWalletPageVM } from "../../application/view-models/useWalletPageVM"
import WalletHero from "../components/WalletHero.vue"
import WalletSendForm from "../components/WalletSendForm.vue"
import WalletTopupForm from "../components/WalletTopupForm.vue"
import WalletTransactions from "../components/WalletTransactions.vue"

const { t, locale } = useI18n()
const receiveAmount = ref<number | null>(null)

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
  sepayTopup,
  mutationError,
  mutationMessage,
  sending,
  toppingUp,
  openTopupForm,
  closeTopupForm,
  openSendModal,
  closeSendModal,
  openReceiveQr,
  closeReceiveQr,
  searchRecipients,
  sendMoney,
  createTopup,
  checkSepayTopup,
} = useWalletPageVM()

const formattedSepayAmount = computed(() =>
  formatCurrency(sepayTopup.value?.amount ?? 0, {
    currency: overview.value.currency,
    currencySymbol: overview.value.currencySymbol,
    currencyRule: overview.value.currencyRule,
    locale: locale.value,
  }),
)

useSeoMeta({
  title: () => t("pages.walletPage.seoTitle"),
  description: () => t("pages.walletPage.seoDescription"),
})
</script>

<style scoped>
.wallet-action {
  display: flex;
  min-height: 54px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  padding: 12px 14px;
  color: #334155;
  font-size: 13px;
  font-weight: 700;
  transition: all 0.15s ease;
}

.wallet-action:hover {
  border-color: rgba(0, 0, 255, 0.16);
  background: rgba(0, 0, 255, 0.03);
  color: #0000ff;
}

.wallet-action--active {
  border-color: rgba(0, 0, 255, 0.22);
  background: rgba(0, 0, 255, 0.05);
  color: #0000ff;
}

.wallet-action--primary {
  border-color: #0000ff;
  background: linear-gradient(180deg, #2233ff 0%, #0000ff 100%);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(0, 0, 255, 0.2);
}

.wallet-action--primary:hover {
  background: linear-gradient(180deg, #2233ff 0%, #0000ff 100%);
  color: #ffffff;
  box-shadow: 0 6px 20px rgba(0, 0, 255, 0.28);
}

.wallet-action--primary.wallet-action--active {
  color: #ffffff;
}

.wallet-action__icon {
  display: flex;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #f1f5f9;
  color: #0000ff;
}

.wallet-action--primary .wallet-action__icon {
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
}

.wallet-action--active:not(.wallet-action--primary) .wallet-action__icon {
  background: rgba(0, 0, 255, 0.08);
  color: #0000ff;
}

.wallet-inline-panel {
  border: 1px solid rgba(0, 0, 255, 0.06);
  border-radius: 16px;
  background: #ffffff;
  padding: 18px;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.04);
}

.wallet-panel-close {
  display: flex;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  color: #64748b;
  transition: all 0.15s ease;
}

.wallet-panel-close:hover {
  border-color: rgba(0, 0, 255, 0.16);
  background: rgba(0, 0, 255, 0.03);
  color: #0000ff;
}

.wallet-sepay-result {
  display: grid;
  gap: 16px;
  margin-top: 18px;
  border-radius: 16px;
  background: #fafbfe;
  padding: 16px;
}

.wallet-sepay-result__qr {
  width: min(100%, 280px);
  aspect-ratio: 1;
  justify-self: center;
  border-radius: 14px;
  background: #ffffff;
  padding: 12px;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.06);
}

.wallet-sepay-result__details {
  min-width: 0;
}

.wallet-sepay-result__title {
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
}

.wallet-sepay-result__list {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}

.wallet-sepay-result__list div {
  display: grid;
  gap: 3px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 8px;
}

.wallet-sepay-result__list dt {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
}

.wallet-sepay-result__list dd {
  overflow-wrap: anywhere;
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
}

.wallet-sepay-result__hint {
  margin: 12px 0;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
  color: #334155;
}

@media (min-width: 768px) {
  .wallet-sepay-result {
    grid-template-columns: 300px minmax(0, 1fr);
    align-items: start;
  }
}
</style>
