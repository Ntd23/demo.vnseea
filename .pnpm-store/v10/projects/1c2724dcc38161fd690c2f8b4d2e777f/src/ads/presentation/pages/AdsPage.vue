<!-- English description: Displays the current user's backend-backed ads manager dashboard. -->
<template>
  <main class="ads-page">
    <section class="ads-page__hero">
      <div>
        <p class="ads-page__eyebrow">Advertising</p>
        <h1>Quảng cáo</h1>
        <p>Quản lý chiến dịch, ngân sách, lượt nhấp và lượt xem từ dữ liệu backend.</p>
      </div>
      <NuxtLink v-if="canCreateAds" :to="appRoutes.adsCreate" class="ads-page__create">
        <Icon name="i-ph-plus-bold" class="h-4 w-4" />
        <span>Tạo quảng cáo</span>
      </NuxtLink>
    </section>

    <section class="ads-page__summary">
      <article class="ads-summary-card">
        <Icon name="i-ph-wallet-fill" class="ads-summary-card__icon" />
        <div>
          <p>Số dư ví</p>
          <strong>{{ formattedBalance }}</strong>
        </div>
      </article>
      <article class="ads-summary-card">
        <Icon name="i-ph-megaphone-fill" class="ads-summary-card__icon" />
        <div>
          <p>Chiến dịch</p>
          <strong>{{ campaigns.length }}</strong>
        </div>
      </article>
      <article class="ads-summary-card">
        <Icon name="i-ph-chart-line-up-fill" class="ads-summary-card__icon" />
        <div>
          <p>Tương tác</p>
          <strong>{{ totalInteractions }}</strong>
        </div>
      </article>
    </section>

    <UAlert
      v-if="error"
      color="warning"
      variant="soft"
      icon="i-ph-warning-circle-fill"
      title="Không tải được quảng cáo"
      :description="String(error.message || error)"
    />

    <section v-else class="ads-page__content">
      <div class="ads-page__section-head">
        <div>
          <h2>Chiến dịch của tôi</h2>
          <p>Theo dõi trạng thái và hiệu quả quảng cáo hiện tại.</p>
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
          title="Không cập nhật được quảng cáo"
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
              <button
                type="button"
                class="ads-status"
                :class="`ads-status--${campaign.status}`"
                :disabled="mutatingId === campaign.id"
                @click="toggleStatus(campaign.id)"
              >
                {{ campaign.status === "active" ? "Đang chạy" : "Tạm dừng" }}
              </button>
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
            <NuxtLink :to="campaign.chartUrl" class="ads-card__action" aria-label="Xem thống kê">
              <Icon name="i-ph-chart-bar-fill" />
            </NuxtLink>
            <NuxtLink :to="campaign.editUrl" class="ads-card__action" aria-label="Sửa quảng cáo">
              <Icon name="i-ph-pencil-simple-fill" />
            </NuxtLink>
            <button
              type="button"
              class="ads-card__action"
              aria-label="Xóa quảng cáo"
              :disabled="mutatingId === campaign.id"
              @click="deleteCampaign(campaign.id)"
            >
              <Icon name="i-ph-trash-fill" />
            </button>
          </div>
        </article>

        <UAlert
          v-if="loadMoreError"
          color="warning"
          variant="soft"
          icon="i-ph-warning-circle-fill"
          title="Không tải thêm được"
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
            Tải thêm
          </UButton>
        </div>
      </div>

      <div v-else class="ads-page__empty">
        <Icon name="i-ph-megaphone-simple-slash-duotone" class="ads-page__empty-icon" />
        <h2>Chưa có quảng cáo</h2>
        <p>Tạo chiến dịch đầu tiên để bắt đầu hiển thị quảng cáo.</p>
        <NuxtLink v-if="canCreateAds" :to="appRoutes.adsCreate" class="ads-page__empty-link">
          Tạo quảng cáo
        </NuxtLink>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"
import { useAdsPageVM } from "../../application/view-models/useAdsPageVM"

const { n, locale } = useI18n()
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

const biddingLabel = (value: string) => value === "views" ? "Theo lượt xem" : "Theo lượt nhấp"

const placementLabel = (value: string) => {
  const labels: Record<string, string> = {
    entire: "Toàn site",
    forum: "Diễn đàn",
    funding: "Gây quỹ",
    jobs: "Việc làm",
    movies: "Phim",
    offer: "Ưu đãi",
    post: "Bài viết",
    sidebar: "Sidebar",
    story: "Tin",
    video: "Video",
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
  margin: 0 auto;
  padding: 18px 12px 40px;
}

.ads-page__hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #fff;
  padding: 22px;
  box-shadow: 0 12px 32px rgba(15, 35, 110, 0.08);
}

.ads-page__eyebrow {
  margin: 0 0 6px;
  color: #0000ff;
  font-size: 12px;
  font-weight: 800;
}

.ads-page__hero h1,
.ads-page__section-head h2,
.ads-page__empty h2 {
  margin: 0;
  color: #0f172a;
  font-weight: 800;
}

.ads-page__hero h1 {
  font-size: 28px;
}

.ads-page__hero p,
.ads-page__section-head p,
.ads-page__empty p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.55;
}

.ads-page__create,
.ads-page__empty-link {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 999px;
  background: #0000ff;
  padding: 10px 16px;
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;
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
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #fff;
  padding: 18px;
}

.ads-summary-card__icon {
  height: 24px;
  width: 24px;
  color: #0000ff;
}

.ads-summary-card p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}

.ads-summary-card strong {
  color: #0f172a;
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
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #fff;
  padding: 14px;
  box-shadow: 0 10px 26px rgba(15, 35, 110, 0.06);
}

.ads-card__media {
  display: grid;
  overflow: hidden;
  height: 88px;
  width: 88px;
  place-items: center;
  border-radius: 14px;
  background: #f1f5f9;
}

.ads-card__media-fallback {
  height: 30px;
  width: 30px;
  color: #94a3b8;
}

.ads-card__title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.ads-card h3 {
  margin: 0;
  color: #0f172a;
  font-size: 16px;
  font-weight: 800;
}

.ads-card__title-row p,
.ads-card__meta,
.ads-card__stats p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 13px;
}

.ads-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ads-card__meta span {
  border-radius: 999px;
  background: #f1f5f9;
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

.ads-status--active {
  background: #dcfce7;
  color: #15803d;
}

.ads-status--inactive {
  background: #fee2e2;
  color: #b91c1c;
}

.ads-card__stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(64px, 1fr));
  gap: 10px;
}

.ads-card__stats div {
  border-radius: 14px;
  background: #f8fafc;
  padding: 10px;
  text-align: center;
}

.ads-card__stats span {
  color: #0f172a;
  font-weight: 800;
}

.ads-card__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ads-card__action {
  display: grid;
  height: 38px;
  width: 38px;
  place-items: center;
  border: 1px solid #dbe4f0;
  border-radius: 999px;
  background: #fff;
  color: #334155;
}

.ads-page__load-more {
  display: flex;
  justify-content: center;
  padding-top: 6px;
}

.ads-page__empty {
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #fff;
  padding: 36px 20px;
  text-align: center;
}

.ads-page__empty-icon {
  margin: 0 auto 10px;
  height: 42px;
  width: 42px;
  color: #94a3b8;
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
