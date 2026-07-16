<!-- English description: Backend-backed funding catalog with public and owner campaign tabs matching the legacy funding information hierarchy. -->
<template>
  <main class="funding-page mt-1.5">
    <section class="funding-toolbar">
      <div class="funding-tabs" role="tablist" :aria-label="t('pages.fundingPage.heroTitle')">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          role="tab"
          class="funding-tab"
          :class="{ 'funding-tab--active': activeTab === tab.value }"
          :aria-selected="activeTab === tab.value"
          @click="setTab(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>

      <NuxtLink
        v-if="canCreate"
        to="/create_funding"
        class="funding-create"
      >
        <Icon name="i-ph-plus-bold" class="h-4 w-4" />
        <span>{{ t("pages.fundingPage.createCampaign") }}</span>
      </NuxtLink>
    </section>

    <section v-if="pending" class="funding-grid" aria-live="polite">
      <article v-for="index in 4" :key="index" class="funding-card funding-card--skeleton">
        <USkeleton class="funding-skeleton__media" />
        <div class="funding-skeleton__body">
          <USkeleton class="h-6 w-2/3 rounded-md" />
          <USkeleton class="h-4 w-1/2 rounded-md" />
          <USkeleton class="h-10 w-full rounded-md" />
        </div>
      </article>
    </section>

    <UAlert
      v-else-if="error"
      color="error"
      variant="soft"
      :title="String(error.message || error)"
      class="funding-alert"
    />

    <section v-else-if="items.length" class="funding-grid">
      <article
        v-for="campaign in items"
        :key="campaign.id"
        class="funding-card"
      >
        <NuxtLink :to="campaign.detailUrl" class="funding-card__media">
          <NuxtImg
            v-if="campaign.imageUrl"
            :src="campaign.imageUrl"
            :alt="campaign.title"
            width="720"
            height="450"
            class="funding-card__image"
            loading="lazy"
          />
          <div v-else class="funding-card__fallback">
            <Icon name="i-ph-image-square-duotone" class="h-9 w-9" />
          </div>
        </NuxtLink>

        <div class="funding-card__content">
          <NuxtLink :to="campaign.detailUrl" class="funding-card__title">
            {{ campaign.title }}
          </NuxtLink>

          <div v-if="activeTab === 'browse'" class="funding-card__owner-row">
            <NuxtLink :to="ownerHref(campaign)" class="funding-card__avatar-link">
              <NuxtImg
                v-if="campaign.ownerAvatarUrl"
                :src="campaign.ownerAvatarUrl"
                :alt="campaign.ownerName"
                width="32"
                height="32"
                class="funding-card__avatar"
                loading="lazy"
              />
              <span v-else class="funding-card__avatar funding-card__avatar--empty">
                {{ ownerInitials(campaign.ownerName) }}
              </span>
            </NuxtLink>

            <p class="funding-card__meta">
              <NuxtLink :to="ownerHref(campaign)" class="funding-card__owner-name">
                {{ campaign.ownerName || "-" }}
              </NuxtLink>
              <span aria-hidden="true">·</span>
              <time :datetime="campaign.createdAt">{{ formatDate(campaign.createdAt) }}</time>
            </p>
          </div>

          <time
            v-else
            class="funding-card__date"
            :datetime="campaign.createdAt"
          >
            {{ formatDate(campaign.createdAt) }}
          </time>
        </div>

        <div v-if="activeTab === 'browse'" class="funding-card__footer">
          <p class="funding-card__amounts">
            <strong>{{ formatMoney(campaign.raised) }}</strong>
            <span>{{ t("pages.fundingPage.raisedOf") }}</span>
            <strong>{{ formatMoney(campaign.amount) }}</strong>
          </p>

          <div
            class="funding-progress"
            :class="{ 'funding-progress--completed': campaign.isCompleted }"
            role="progressbar"
            :aria-label="t('pages.fundingPage.progressAriaLabel', {
              raised: formatMoney(campaign.raised),
              goal: formatMoney(campaign.amount),
              percent: campaign.progress,
            })"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="campaign.progress"
          >
            <span :style="{ width: `${clampProgress(campaign.progress)}%` }"></span>
          </div>

          <div class="funding-card__public-actions">
            <UButton
              v-if="campaign.canDonate"
              type="button"
              color="primary"
              variant="soft"
              icon="i-ph-hand-heart-duotone"
              class="funding-card__action"
              @click="openDonate(campaign)"
            >
              {{ t("pages.fundingPage.donate") }}
            </UButton>
          </div>
        </div>

        <div
          v-else-if="campaign.canManage"
          class="funding-card__manage-actions"
        >
          <UButton
            :to="campaign.editUrl"
            color="success"
            variant="soft"
            icon="i-ph-pencil-simple-duotone"
            class="funding-card__manage-button"
          >
            {{ t("pages.fundingPage.editCampaign") }}
          </UButton>
          <UButton
            type="button"
            color="error"
            variant="soft"
            icon="i-ph-trash-duotone"
            class="funding-card__manage-button"
            @click="openDelete(campaign)"
          >
            {{ t("pages.fundingPage.deleteCampaign") }}
          </UButton>
        </div>
      </article>
    </section>

    <section v-else class="funding-empty">
      <Icon name="i-ph-hand-heart-duotone" class="h-10 w-10" />
      <h2>{{ t("pages.fundingPage.emptyTitle") }}</h2>
      <p>{{ t("pages.fundingPage.emptyDescription") }}</p>
    </section>

    <div v-if="hasMore && !pending" class="funding-load-more">
      <UButton
        type="button"
        color="neutral"
        variant="outline"
        icon="i-ph-arrow-down-duotone"
        :loading="loadingMore"
        @click="loadMore"
      >
        {{ t("navigation.leftSidebar.showMore") }}
      </UButton>
    </div>

    <UModal v-model:open="donationOpen" :title="donationTarget?.title || t('pages.fundingPage.donateTitle')">
      <template #body>
        <div class="funding-donate">
          <p>{{ t("pages.fundingPage.donateModalDescription", { title: donationTarget?.title || "-" }) }}</p>
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
        <div class="funding-modal-actions">
          <UButton color="neutral" variant="soft" @click="donationTarget = null">
            {{ t("pages.fundingPage.close") }}
          </UButton>
          <UButton color="primary" :loading="donating" @click="submitDonation">
            {{ t("pages.fundingPage.donate") }}
          </UButton>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="deleteOpen" :title="t('pages.fundingPage.deleteConfirmTitle')">
      <template #body>
        <p class="funding-delete-copy">
          {{ t("pages.fundingPage.deleteConfirmDescription", { title: deleteTarget?.title || "-" }) }}
        </p>
      </template>
      <template #footer>
        <div class="funding-modal-actions">
          <UButton color="neutral" variant="soft" @click="deleteTarget = null">
            {{ t("pages.fundingPage.close") }}
          </UButton>
          <UButton color="error" :loading="deleting" @click="submitDelete">
            {{ t("pages.fundingPage.deleteCampaign") }}
          </UButton>
        </div>
      </template>
    </UModal>
  </main>
</template>

<script setup lang="ts">
import { formatCurrency } from "../../../shared-kernel/application/utils/formatCurrency"
import type { FundingCampaign } from "../../domain/types/funding.types"
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
  deleteTarget,
  donationOpen,
  deleteOpen,
  donationAmount,
  donating,
  deleting,
  setTab,
  loadMore,
  openDonate,
  submitDonation,
  openDelete,
  submitDelete,
} = useFundingPageVM()

const tabs = computed(() => [
  { value: "browse" as const, label: t("pages.fundingPage.browseFunding") },
  { value: "mine" as const, label: t("pages.fundingPage.myFunding") },
])

const formatMoney = (amount: number) =>
  formatCurrency(amount, {
    currency: currency.value,
    currencySymbol: currencySymbol.value,
    locale: locale.value,
  })

const formatDate = (value: string) => {
  const date = new Date(value)
  if (!value || Number.isNaN(date.getTime())) return "-"

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date)
}

const ownerHref = (campaign: FundingCampaign) =>
  campaign.ownerUrl || campaign.detailUrl

const ownerInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join("") || "VN"

const clampProgress = (value: number) =>
  Math.min(Math.max(value, 0), 100)
</script>

<style scoped>
.funding-page {
  width: min(100%, 1120px);
}

.funding-toolbar,
.funding-card,
.funding-empty {
  border: 1px solid var(--border-default);
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
}

.funding-toolbar {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  border-radius: var(--radius-lg);
  padding: 12px 14px 16px; /* Increased bottom padding to host the scrollbar on mobile */
  overflow-x: scroll;
  scrollbar-width: thin;
  scrollbar-color: #94a3b8 #f1f5f9;
}

.funding-tabs {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  flex-shrink: 0;
}

.funding-tab {
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  border-radius: var(--radius-full);
  padding: 8px 14px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-default), background-color var(--duration-fast) var(--ease-default);
}

.funding-tab:hover {
  color: var(--text-brand);
  background: var(--bg-surface-hover);
}

.funding-tab--active {
  color: var(--text-brand);
  background: var(--bg-surface-active);
  font-weight: 700;
}

.funding-create {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 38px;
  flex: 0 0 auto;
  border-radius: 12px;
  background: var(--bg-brand);
  padding: 0 14px;
  color: var(--text-inverse);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  box-shadow: var(--shadow-brand);
  transition: transform var(--duration-fast) var(--ease-default), background-color var(--duration-fast) var(--ease-default);
}

.funding-create:hover {
  transform: translateY(-1px);
  background: var(--bg-brand-hover);
  color: var(--text-inverse);
}

.funding-grid {
  display: grid;
  gap: var(--space-4);
  margin-top: var(--space-4);
}

.funding-card {
  min-width: 0;
  overflow: hidden;
  border-radius: var(--radius-md);
}

.funding-card__media {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: var(--bg-muted);
}

.funding-card__image,
.funding-card__fallback {
  width: 100%;
  height: 100%;
}

.funding-card__image {
  display: block;
  object-fit: cover;
  transition: transform 0.25s ease;
}

.funding-card:hover .funding-card__image {
  transform: scale(1.015);
}

.funding-card__fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--icon-secondary);
}

.funding-card__content {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-4);
}

.funding-card__title {
  display: -webkit-box;
  overflow: hidden;
  color: var(--text-primary);
  font-size: 19px;
  font-weight: var(--weight-bold);
  line-height: var(--leading-tight);
  text-decoration: none;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.funding-card__title:hover,
.funding-card__owner-name:hover {
  color: var(--text-link);
}

.funding-card__owner-row {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: var(--space-2);
}

.funding-card__avatar-link {
  flex: 0 0 auto;
  border-radius: var(--radius-full);
}

.funding-card__avatar {
  display: flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  object-fit: cover;
}

.funding-card__avatar--empty {
  background: var(--color-primary-50);
  color: var(--text-brand);
  font-size: var(--text-label);
  font-weight: var(--weight-bold);
}

.funding-card__meta {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-secondary);
  font-size: var(--text-caption);
  line-height: var(--leading-normal);
}

.funding-card__owner-name {
  overflow: hidden;
  color: var(--text-secondary);
  font-weight: var(--weight-medium);
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.funding-card__date {
  color: var(--text-secondary);
  font-size: var(--text-body);
}

.funding-card__footer {
  display: grid;
  gap: var(--space-3);
  border-top: 1px solid var(--border-light);
  background: var(--bg-surface-hover);
  padding: var(--space-4);
}

.funding-card__amounts {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--text-body);
}

.funding-card__amounts strong {
  color: var(--text-primary);
  font-weight: var(--weight-semibold);
}

.funding-progress {
  width: 100%;
  height: 7px;
  overflow: hidden;
  border-radius: var(--radius-full);
  background: var(--color-secondary-200);
}

.funding-progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--color-primary-500);
  transition: width 0.25s ease;
}

.funding-progress--completed span {
  background: var(--color-success);
}

.funding-card__public-actions,
.funding-card__manage-actions,
.funding-modal-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
}

.funding-card__public-actions {
  margin-top: var(--space-1);
}

.funding-card__manage-actions {
  border-top: 1px solid var(--border-light);
  background: var(--bg-surface-hover);
  padding: var(--space-4);
}

.funding-card__action,
.funding-card__manage-button {
  width: 100%;
  justify-content: center;
}

.funding-alert,
.funding-empty {
  margin-top: var(--space-4);
}

.funding-empty {
  display: grid;
  justify-items: center;
  gap: var(--space-2);
  border-radius: var(--radius-md);
  padding: var(--space-8) var(--space-4);
  color: var(--text-secondary);
  text-align: center;
}

.funding-empty h2,
.funding-empty p {
  margin: 0;
}

.funding-empty h2 {
  color: var(--text-primary);
  font-size: var(--text-heading);
}

.funding-empty p {
  max-width: 520px;
  font-size: var(--text-body);
  line-height: var(--leading-normal);
}

.funding-load-more {
  display: flex;
  justify-content: center;
  margin-top: var(--space-5);
}

.funding-donate {
  display: grid;
  gap: var(--space-4);
}

.funding-donate p,
.funding-delete-copy {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--text-body);
  line-height: var(--leading-normal);
}

.funding-card--skeleton {
  pointer-events: none;
}

.funding-skeleton__media {
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: 0;
}

.funding-skeleton__body {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-4);
}

@media (min-width: 640px) {
  .funding-toolbar {
    justify-content: space-between;
    overflow-x: visible;
    padding: 12px 14px; /* Reset bottom padding */
  }
}

@media (min-width: 760px) {
  .funding-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>

<style>
/* Global CSS block to style the webkit scrollbar for Funding Toolbar */
.funding-toolbar::-webkit-scrollbar {
  height: 6px !important;
  background-color: #e2e8f0 !important;
  display: block !important;
}

.funding-toolbar::-webkit-scrollbar-track {
  background-color: #e2e8f0 !important;
  border-radius: 999px !important;
}

.funding-toolbar::-webkit-scrollbar-thumb {
  background-color: #475569 !important; /* Higher contrast slate-600 */
  border-radius: 999px !important;
}

.funding-toolbar::-webkit-scrollbar-thumb:hover {
  background-color: #1e293b !important;
}
</style>
