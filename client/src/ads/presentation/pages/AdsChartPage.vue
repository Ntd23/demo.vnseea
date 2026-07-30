<!-- English description: Displays backend advertising analytics for one campaign with phtml-equivalent views, clicks, and spend data. -->
<template>
  <main class="ads-chart-page mt-1.5">
    <section class="ads-chart-page__hero">
      <div>
        <p>{{ $t("ads.chart.eyebrow") }}</p>
        <h1>{{ campaign?.name || $t("ads.chart.pageTitle") }}</h1>
      </div>
      <UButton
        :to="appRoutes.ads"
        color="primary"
        icon="i-ph-arrow-left-bold"
        :label="$t('ads.chart.backBtn')"
        class="ads-chart-page__back rounded-full"
      />
    </section>

    <UAlert
      v-if="error"
      color="warning"
      variant="soft"
      icon="i-ph-warning-circle-fill"
      :title="$t('ads.chart.loadError')"
      :description="String(error.message || error)"
    />

    <template v-else>
      <section class="ads-chart-page__summary">
        <article>
          <Icon name="i-ph-cursor-click-fill" />
          <p>Clicks</p>
          <strong>{{ totals.clicks }}</strong>
        </article>
        <article>
          <Icon name="i-ph-eye-fill" />
          <p>Views</p>
          <strong>{{ totals.views }}</strong>
        </article>
        <article>
          <Icon name="i-ph-coins-fill" />
          <p>Spent</p>
          <strong>{{ totals.spend.toFixed(2) }}</strong>
        </article>
      </section>

      <section class="ads-chart-panel">
        <div class="ads-chart-panel__head">
          <h2>{{ $t("ads.chart.monthlyHeader") }}</h2>
          <p>{{ $t("ads.chart.last30Days") }}</p>
        </div>

        <div v-if="pending" class="ads-chart-panel__loading">
          <USkeleton v-for="item in 8" :key="item" class="h-10 rounded-[12px]" />
        </div>

        <div v-else-if="points.length" class="ads-bars">
          <div v-for="point in points" :key="point.date" class="ads-bars__row">
            <span class="ads-bars__date">{{ point.date }}</span>
            <div class="ads-bars__track">
              <span class="ads-bars__bar ads-bars__bar--views" :style="{ width: `${barWidth(point.views)}%` }" />
            </div>
            <strong>{{ point.views }}</strong>
            <div class="ads-bars__track">
              <span class="ads-bars__bar ads-bars__bar--clicks" :style="{ width: `${barWidth(point.clicks)}%` }" />
            </div>
            <strong>{{ point.clicks }}</strong>
            <div class="ads-bars__track">
              <span class="ads-bars__bar ads-bars__bar--spend" :style="{ width: `${barWidth(point.spend)}%` }" />
            </div>
            <strong>{{ point.spend.toFixed(2) }}</strong>
          </div>
        </div>

        <div v-else class="ads-chart-page__empty">
          <Icon name="i-ph-chart-line-down-duotone" />
          <h2>{{ $t("ads.chart.emptyTitle") }}</h2>
          <p>{{ $t("ads.chart.emptyDesc") }}</p>
        </div>
      </section>
    </template>
  </main>
</template>

<script setup lang="ts">
import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"
import { useAdsChartPageVM } from "../../application/view-models/useAdsChartPageVM"

const props = defineProps<{
  campaignId: number
}>()

const { campaign, error, maxValue, pending, points, totals } = useAdsChartPageVM(props.campaignId)

const barWidth = (value: number) => Math.max(4, Math.round((value / maxValue.value) * 100))
</script>

<style scoped>
.ads-chart-page {
  display: flex;
  width: min(100%, 1120px);
  flex-direction: column;
  gap: 18px;
}

.ads-chart-page__hero,
.ads-chart-panel,
.ads-chart-page__summary article {
  border: 1px solid var(--border-light);
  border-radius: 18px;
  background: var(--bg-surface);
}

.ads-chart-page__hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px;
  box-shadow: var(--shadow-lg);
}

.ads-chart-page__hero p,
.ads-chart-panel__head p,
.ads-chart-page__summary p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 13px;
}

.ads-chart-page__hero h1,
.ads-chart-panel h2,
.ads-chart-page__empty h2 {
  margin: 4px 0 0;
  color: var(--text-primary);
  font-weight: 800;
}

.ads-chart-page__back {
  flex-shrink: 0;
}

.ads-chart-page__summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.ads-chart-page__summary article {
  padding: 18px;
}

.ads-chart-page__summary svg {
  height: 24px;
  width: 24px;
  color: var(--icon-brand);
}

.ads-chart-page__summary strong {
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 800;
}

.ads-chart-panel {
  padding: 22px;
}

.ads-chart-panel__head {
  margin-bottom: 18px;
}

.ads-chart-panel__loading,
.ads-bars {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ads-bars__row {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr) 54px minmax(0, 1fr) 54px minmax(0, 1fr) 64px;
  align-items: center;
  gap: 10px;
}

.ads-bars__date {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 800;
}

.ads-bars__track {
  overflow: hidden;
  height: 12px;
  border-radius: 999px;
  background: var(--bg-muted);
}

.ads-bars__bar {
  display: block;
  height: 100%;
  border-radius: inherit;
}

.ads-bars__bar--views {
  background: var(--color-success);
}

.ads-bars__bar--clicks {
  background: var(--bg-brand);
}

.ads-bars__bar--spend {
  background: var(--color-warning);
}

.ads-bars strong {
  color: var(--text-primary);
  font-size: 13px;
}

.ads-chart-page__empty {
  padding: 30px 16px;
  text-align: center;
}

.ads-chart-page__empty svg {
  margin: 0 auto 10px;
  height: 42px;
  width: 42px;
  color: var(--text-tertiary);
}

.ads-chart-page__empty p {
  color: var(--text-secondary);
}

@media (max-width: 820px) {
  .ads-chart-page__hero {
    align-items: flex-start;
    flex-direction: column;
  }

  .ads-chart-page__summary {
    grid-template-columns: 1fr;
  }

  .ads-bars__row {
    grid-template-columns: 88px minmax(0, 1fr) 48px;
  }

  .ads-bars__row .ads-bars__track:nth-of-type(n + 2),
  .ads-bars__row strong:nth-of-type(n + 2) {
    display: none;
  }
}
</style>
