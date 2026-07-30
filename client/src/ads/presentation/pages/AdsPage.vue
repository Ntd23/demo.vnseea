<!-- English description: Displays the current user's backend-backed ads manager dashboard. -->
<template>
  <main class="ads-page mt-1.5">
    <section class="ads-page__hero">
      <div>
        <p class="ads-page__eyebrow">{{ $t("ads.page.eyebrow") }}</p>
        <h1>{{ $t("ads.page.title") }}</h1>
        <p>{{ $t("ads.page.subtitle") }}</p>
      </div>
      <UButton
        v-if="canCreateAds"
        :to="appRoutes.adsCreate"
        color="primary"
        icon="i-ph-plus-bold"
        :label="$t('ads.page.createBtn')"
        class="ads-page__create rounded-full"
      />
    </section>

    <section class="ads-page__summary">
      <article class="ads-summary-card">
        <Icon name="i-ph-wallet-fill" class="ads-summary-card__icon" />
        <div>
          <p>{{ $t("ads.page.walletBalance") }}</p>
          <strong>{{ formattedBalance }}</strong>
        </div>
      </article>
      <article class="ads-summary-card">
        <Icon name="i-ph-megaphone-fill" class="ads-summary-card__icon" />
        <div>
          <p>{{ $t("ads.page.campaignsCount") }}</p>
          <strong>{{ campaigns.length }}</strong>
        </div>
      </article>
      <article class="ads-summary-card">
        <Icon name="i-ph-chart-line-up-fill" class="ads-summary-card__icon" />
        <div>
          <p>{{ $t("ads.page.interactions") }}</p>
          <strong>{{ totalInteractions }}</strong>
        </div>
      </article>
    </section>

    <UAlert
      v-if="error"
      color="warning"
      variant="soft"
      icon="i-ph-warning-circle-fill"
      :title="$t('ads.page.loadError')"
      :description="String(error.message || error)"
    />

    <section v-else class="ads-page__content">
      <div class="ads-page__section-head">
        <div>
          <h2>{{ $t("ads.page.myCampaigns") }}</h2>
          <p>{{ $t("ads.page.myCampaignsDesc") }}</p>
        </div>
      </div>

      <div v-if="pending" class="ads-page__skeletons">
        <USkeleton v-for="item in 4" :key="item" class="h-24 rounded-[18px]" />
      </div>

      <div v-else-if="campaigns.length" class="ads-list">
        <UAlert
          v-if="mutationError"
          color="warning"
          variant="soft"
          icon="i-ph-warning-circle-fill"
          :title="$t('ads.page.updateError')"
          :description="mutationError"
        />

        <article v-for="campaign in campaigns" :key="campaign.id" class="ads-card">
          <div class="ads-card__media">
            <NuxtImg
              v-if="isImageMedia(campaign.mediaUrl)"
              :src="campaign.mediaUrl"
              :alt="campaign.name"
              class="h-full w-full object-cover"
              width="88"
              height="88"
              loading="lazy"
            />
            <Icon v-else :name="campaign.mediaUrl ? 'i-ph-video-duotone' : 'i-ph-image-square-duotone'" class="ads-card__media-fallback" />
          </div>

          <div class="ads-card__main">
            <div class="ads-card__title-row">
              <div>
                <h3>{{ campaign.name || campaign.headline }}</h3>
                <p>{{ campaign.headline || campaign.websiteUrl }}</p>
              </div>
              <UButton
                type="button"
                class="ads-status"
                :color="campaign.status === 'active' ? 'success' : 'error'"
                variant="soft"
                size="xs"
                :disabled="mutatingId === campaign.id"
                @click="toggleStatus(campaign.id)"
              >
                {{ campaign.status === "active" ? $t("ads.page.statusRunning") : $t("ads.page.statusPaused") }}
              </UButton>
            </div>

            <div class="ads-card__meta">
              <span>{{ biddingLabel(campaign.bidding) }}</span>
              <span>{{ placementLabel(campaign.placement) }}</span>
              <span v-if="campaign.location">{{ campaign.location }}</span>
            </div>
          </div>

          <div class="ads-card__stats">
            <div>
              <span>{{ campaign.clicks }}</span>
              <p>Clicks</p>
            </div>
            <div>
              <span>{{ campaign.views }}</span>
              <p>Views</p>
            </div>
          </div>

          <div class="ads-card__actions">
            <UButton
              :to="campaign.chartUrl"
              color="neutral"
              variant="outline"
              icon="i-ph-chart-bar-fill"
              class="ads-card__action"
              :aria-label="$t('ads.page.viewChart')"
            />
            <UButton
              :to="campaign.editUrl"
              color="neutral"
              variant="outline"
              icon="i-ph-pencil-simple-fill"
              class="ads-card__action"
              :aria-label="$t('ads.page.editAd')"
            />
            <UButton
              type="button"
              color="error"
              variant="soft"
              icon="i-ph-trash-fill"
              class="ads-card__action"
              :aria-label="$t('ads.page.deleteAd')"
              :disabled="mutatingId === campaign.id"
              @click="deleteCampaign(campaign.id)"
            />
          </div>
        </article>

        <UAlert
          v-if="loadMoreError"
          color="warning"
          variant="soft"
          icon="i-ph-warning-circle-fill"
          :title="$t('ads.page.loadMoreError')"
          :description="loadMoreError"
        />

        <div v-if="hasMore" class="ads-page__load-more">
          <UButton
            color="neutral"
            variant="soft"
            icon="i-ph-caret-down-bold"
            :loading="loadingMore"
            @click="loadMore"
          >
            {{ $t("ads.page.loadMore") }}
          </UButton>
        </div>
      </div>

      <div v-else class="ads-page__empty">
        <Icon name="i-ph-megaphone-simple-slash-duotone" class="ads-page__empty-icon" />
        <h2>{{ $t("ads.page.emptyTitle") }}</h2>
        <p>{{ $t("ads.page.emptyDesc") }}</p>
        <UButton
          v-if="canCreateAds"
          :to="appRoutes.adsCreate"
          color="primary"
          icon="i-ph-plus-bold"
          :label="$t('ads.page.createBtn')"
          class="ads-page__empty-link rounded-full"
        />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"
import { useAdsPageVM } from "../../application/view-models/useAdsPageVM"

const { t, n, locale } = useI18n()
const {
  balance,
  campaigns,
  canCreateAds,
  currency,
  currencySymbol,
  error,
  hasMore,
  loadMore,
  loadMoreError,
  loadingMore,
  mutationError,
  mutatingId,
  pending,
  toggleStatus,
  deleteCampaign,
} = useAdsPageVM()

const totalInteractions = computed(() =>
  n(campaigns.value.reduce((total, campaign) => total + campaign.clicks + campaign.views, 0)),
)

const formattedBalance = computed(() => {
  const formatter = new Intl.NumberFormat(locale.value === "vi" ? "vi-VN" : "en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })
  const suffix = currency.value ? ` ${currency.value}` : ""

  return `${currencySymbol.value}${formatter.format(balance.value)}${suffix}`
})

const biddingLabel = (value: string) => value === "views" ? t("ads.page.bidding.views") : t("ads.page.bidding.clicks")

const placementLabel = (value: string) => {
  const labels: Record<string, string> = {
    entire: t("ads.page.placements.entire"),
    forum: t("ads.page.placements.forum"),
    funding: t("ads.page.placements.funding"),
    jobs: t("ads.page.placements.jobs"),
    movies: t("ads.page.placements.movies"),
    offer: t("ads.page.placements.offer"),
    post: t("ads.page.placements.post"),
    sidebar: t("ads.page.placements.sidebar"),
    story: t("ads.page.placements.story"),
    video: t("ads.page.placements.video"),
  }

  return labels[value] ?? value
}

const isImageMedia = (value: string) => /\.(avif|gif|jpe?g|png|webp)(\?|#|$)/i.test(value)
</script>

<style scoped>
.ads-page {
  display: flex;
  width: min(100%, 1120px);
  flex-direction: column;
  gap: 18px;
}

.ads-page__hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border: 1px solid var(--border-light);
  border-radius: 18px;
  background: var(--bg-surface);
  padding: 22px;
  box-shadow: var(--shadow-lg);
}

.ads-page__eyebrow {
  margin: 0 0 6px;
  color: var(--text-brand);
  font-size: 12px;
  font-weight: 800;
}

.ads-page__hero h1,
.ads-page__section-head h2,
.ads-page__empty h2 {
  margin: 0;
  color: var(--text-primary);
  font-weight: 800;
}

.ads-page__hero h1 {
  font-size: 28px;
}

.ads-page__hero p,
.ads-page__section-head p,
.ads-page__empty p {
  margin: 6px 0 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.55;
}

.ads-page__create {
  flex-shrink: 0;
}

.ads-page__summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.ads-summary-card {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid var(--border-light);
  border-radius: 18px;
  background: var(--bg-surface);
  padding: 18px;
}

.ads-summary-card__icon {
  height: 24px;
  width: 24px;
  color: var(--icon-brand);
}

.ads-summary-card p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 13px;
}

.ads-summary-card strong {
  color: var(--text-primary);
  font-size: 20px;
  font-weight: 800;
}

.ads-page__content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ads-page__skeletons,
.ads-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ads-card {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr) minmax(148px, auto) auto;
  align-items: center;
  gap: 16px;
  border: 1px solid var(--border-light);
  border-radius: 18px;
  background: var(--bg-surface);
  padding: 14px;
  box-shadow: var(--shadow-md);
}

.ads-card__media {
  display: grid;
  overflow: hidden;
  height: 88px;
  width: 88px;
  place-items: center;
  border-radius: 14px;
  background: var(--bg-muted);
}

.ads-card__media-fallback {
  height: 30px;
  width: 30px;
  color: var(--text-tertiary);
}

.ads-card__title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.ads-card h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 800;
}

.ads-card__title-row p,
.ads-card__meta,
.ads-card__stats p {
  margin: 4px 0 0;
  color: var(--text-secondary);
  font-size: 13px;
}

.ads-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ads-card__meta span {
  border-radius: 999px;
  background: var(--bg-muted);
  padding: 5px 9px;
}

.ads-status {
  flex-shrink: 0;
  border: 0;
  border-radius: 999px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.ads-card__stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(64px, 1fr));
  gap: 10px;
}

.ads-card__stats div {
  border-radius: 14px;
  background: var(--bg-muted);
  padding: 10px;
  text-align: center;
}

.ads-card__stats span {
  color: var(--text-primary);
  font-weight: 800;
}

.ads-card__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ads-card__action {
  height: 38px;
  width: 38px;
  border-radius: 999px;
}

.ads-page__load-more {
  display: flex;
  justify-content: center;
  padding-top: 6px;
}

.ads-page__empty {
  border: 1px solid var(--border-light);
  border-radius: 18px;
  background: var(--bg-surface);
  padding: 36px 20px;
  text-align: center;
}

.ads-page__empty-icon {
  margin: 0 auto 10px;
  height: 42px;
  width: 42px;
  color: var(--text-tertiary);
}

.ads-page__empty-link {
  margin-top: 16px;
}

@media (max-width: 820px) {
  .ads-page__hero {
    align-items: flex-start;
    flex-direction: column;
  }

  .ads-page__summary {
    grid-template-columns: 1fr;
  }

  .ads-card {
    grid-template-columns: 72px minmax(0, 1fr);
  }

  .ads-card__media {
    height: 72px;
    width: 72px;
  }

  .ads-card__stats,
  .ads-card__actions {
    grid-column: 1 / -1;
  }

  .ads-card__actions {
    justify-content: flex-end;
  }
}
</style>
