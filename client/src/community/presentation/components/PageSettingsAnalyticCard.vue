<!-- English description: Displays page analytics charts and summary cards in page settings. -->
<template>
  <CommunitySettingsSectionCard
    :eyebrow="$t('community.pageSettings.sidebar.analytics.eyebrow')"
    :title="$t('community.pageSettings.sidebar.analytics.title')"
    :description="$t('community.pageSettings.sidebar.analytics.desc')"
    icon="i-ph-chart-line-up-bold"
    :translate-text="false"
  >
    <div v-if="loading" class="analytics-state mt-6">
      <Icon name="i-ph-spinner-gap-bold" class="h-5 w-5 animate-spin" />
      <span>{{ copy.loading }}</span>
    </div>

    <div v-else-if="errorMessage" class="analytics-state analytics-state--error mt-6">
      <Icon name="i-ph-warning-circle-bold" class="h-5 w-5" />
      <span>{{ errorMessage }}</span>
    </div>

    <div v-else-if="!analytics" class="analytics-state mt-6">
      <Icon name="i-ph-chart-line-bold" class="h-5 w-5" />
      <span>{{ copy.empty }}</span>
    </div>

    <template v-else>
      <div class="analytics-grid mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="stat in analytics.stats" :key="stat.key" class="stat-card">
          <div class="mb-3 flex items-center justify-between">
            <div class="stat-icon-wrap" :class="stat.color">
              <Icon :name="stat.icon" class="h-5 w-5" />
            </div>
          </div>
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>

      <div class="analytics-panel mt-6">
        <div class="analytics-panel__header">
          <div>
            <h4 class="analytics-panel__title">{{ chartTitle }}</h4>
            <p class="analytics-panel__subtitle">
              {{ copy.chartSubtitle }}
            </p>
          </div>

          <div class="analytics-toolbar" :aria-label="copy.filterAria">
            <button
              v-for="option in periodOptions"
              :key="option.value"
              type="button"
              class="analytics-period-button"
              :class="{ 'analytics-period-button--active': period === option.value }"
              @click="$emit('update:period', option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div class="analytics-chart">
          <ClientOnly>
            <VChart
              class="analytics-echart"
              :option="chartOption"
              autoresize
            />
          </ClientOnly>

          <div v-if="chartTotal === 0" class="analytics-chart__empty">
            {{ copy.chartEmpty }}
          </div>
        </div>

        <div class="analytics-summary">
          <span>{{ formatNumber(analytics.likesInPeriod) }} {{ copy.likesIn }} {{ periodLabelLower }}</span>
          <span>{{ formatNumber(chartPeak) }} {{ copy.peak }}</span>
        </div>
      </div>
    </template>
  </CommunitySettingsSectionCard>
</template>

<script setup lang="ts">
import { LineChart } from "echarts/charts"
import {
  GridComponent,
  TooltipComponent,
} from "echarts/components"
import { use } from "echarts/core"
import { CanvasRenderer } from "echarts/renderers"
import VChart from "vue-echarts"
import CommunitySettingsSectionCard from "./SettingsSectionCard.vue"
import type { EChartsOption } from "echarts"
import type {
  CommunityPageAnalyticsOverview,
  CommunityPageAnalyticsPeriod,
} from "../../domain/types/community.types"

use([
  CanvasRenderer,
  GridComponent,
  LineChart,
  TooltipComponent,
])

const props = defineProps<{
  analytics: CommunityPageAnalyticsOverview | null
  period: CommunityPageAnalyticsPeriod
  loading?: boolean
  errorMessage?: string
}>()

defineEmits<{
  "update:period": [period: CommunityPageAnalyticsPeriod]
}>()

const { t } = useI18n()

const copy = computed(() => ({
  loading: t("community.pageSettings.analytics.loading"),
  empty: t("community.pageSettings.analytics.empty"),
  filterAria: t("community.pageSettings.analytics.filterAria"),
  chartSubtitle: t("community.pageSettings.analytics.chartSubtitle"),
  chartEmpty: t("community.pageSettings.analytics.chartEmpty"),
  likes: t("community.pageSettings.analytics.likes"),
  likesIn: t("community.pageSettings.analytics.likesIn"),
  peak: t("community.pageSettings.analytics.peak"),
}))

const periodOptions = computed<Array<{ value: CommunityPageAnalyticsPeriod; label: string }>>(() => [
  { value: "day", label: t("community.pageSettings.analytics.periods.day") },
  { value: "week", label: t("community.pageSettings.analytics.periods.week") },
  { value: "month", label: t("community.pageSettings.analytics.periods.month") },
  { value: "year", label: t("community.pageSettings.analytics.periods.year") },
])

const formatNumber = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(Math.max(0, Math.round(value)))

const activePeriodOption = computed(() =>
  periodOptions.value.find(option => option.value === props.period) ?? periodOptions.value[1],
)

const periodLabelLower = computed(() => activePeriodOption.value.label.toLowerCase())

const chartTitle = computed(() => `${copy.value.likes} theo ${periodLabelLower.value}`)

const chartPoints = computed(() => props.analytics?.chart ?? [])

const chartPeak = computed(() =>
  Math.max(0, ...chartPoints.value.map(point => point.likes)),
)

const chartTotal = computed(() =>
  chartPoints.value.reduce((total, point) => total + point.likes, 0),
)

const resolveToken = (varName: string) => {
  if (!import.meta.client) return ""
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
}

const chartOption = computed<EChartsOption>(() => {
  const labels = chartPoints.value.map(point => point.label)
  const values = chartPoints.value.map(point => point.likes)

  const brandColor = resolveToken("--bg-brand")
  const textTertiary = resolveToken("--text-tertiary")
  const borderLight = resolveToken("--border-light")
  const borderDefault = resolveToken("--border-default")
  const bgSurface = resolveToken("--bg-surface")
  const textInverse = resolveToken("--text-inverse")

  return {
    color: [brandColor],
    grid: {
      top: 18,
      right: 18,
      bottom: 30,
      left: 38,
      containLabel: false,
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: resolveToken("--color-secondary-900"),
      borderWidth: 0,
      borderRadius: 10,
      padding: [8, 10],
      textStyle: {
        color: textInverse,
        fontSize: 12,
        fontWeight: 700,
      },
      valueFormatter: value => `${formatNumber(Number(value || 0))} ${copy.value.likes.toLowerCase()}`,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: labels,
      axisLine: {
        lineStyle: {
          color: borderDefault,
        },
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: textTertiary,
        fontSize: 10,
        fontWeight: 800,
        interval: props.period === "month" ? 4 : 0,
      },
    },
    yAxis: {
      type: "value",
      minInterval: 1,
      splitNumber: 4,
      axisLabel: {
        color: textTertiary,
        fontSize: 10,
        fontWeight: 800,
      },
      splitLine: {
        lineStyle: {
          color: borderLight,
        },
      },
    },
    series: [{
      name: copy.value.likes,
      type: "line",
      data: values,
      smooth: true,
      symbol: "circle",
      symbolSize: 7,
      showSymbol: values.length <= 31,
      lineStyle: {
        width: 3,
        color: brandColor,
      },
      itemStyle: {
        color: bgSurface,
        borderColor: brandColor,
        borderWidth: 2,
      },
      areaStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: `color-mix(in srgb, ${brandColor} 22%, transparent)` },
            { offset: 1, color: `color-mix(in srgb, ${brandColor} 2%, transparent)` },
          ],
        },
      },
      emphasis: {
        focus: "series",
      },
    }],
  }
})
</script>

<style scoped>
.stat-card {
  border: 1px solid var(--border-light);
  border-radius: 16px;
  background: var(--bg-surface);
  padding: 20px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  border-color: var(--border-default);
  box-shadow: var(--shadow-sm);
}

.stat-icon-wrap {
  display: flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.stat-icon-wrap :deep(svg),
.stat-icon-wrap :deep(i),
.stat-icon-wrap :deep(span) {
  color: inherit !important;
}

/* Override backend Tailwind background and text utility classes with design tokens. */
.stat-icon-wrap[class*="bg-"] {
  background: color-mix(in srgb, var(--bg-brand) 14%, transparent) !important;
  color: var(--icon-brand) !important;
}

.stat-value {
  margin-top: 8px;
  color: var(--text-primary);
  font-size: 20px;
  font-weight: 900;
}

.stat-label {
  margin-top: 2px;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 700;
}

.analytics-state {
  display: inline-flex;
  width: 100%;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border-light);
  border-radius: 14px;
  background: var(--bg-muted);
  color: var(--text-secondary);
  padding: 14px 16px;
  font-size: 13px;
  font-weight: 800;
}

.analytics-state--error {
  border-color: color-mix(in srgb, var(--color-error) 25%, transparent);
  background: color-mix(in srgb, var(--color-error) 10%, transparent);
  color: var(--text-danger);
}

.analytics-panel {
  border: 1px solid var(--border-light);
  border-radius: 16px;
  background: var(--bg-surface);
  padding: 18px;
}

.analytics-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.analytics-panel__title {
  margin: 0;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 900;
}

.analytics-panel__subtitle {
  margin: 4px 0 0;
  max-width: 520px;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.5;
}

.analytics-toolbar {
  display: inline-flex;
  width: min(100%, 320px);
  flex: 0 0 auto;
  gap: 4px;
  border: 1px solid var(--border-light);
  border-radius: 14px;
  background: var(--bg-muted);
  padding: 4px;
}

.analytics-period-button {
  min-height: 34px;
  flex: 1;
  border-radius: 10px;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 900;
  transition: background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
}

.analytics-period-button--active {
  background: var(--bg-surface);
  color: var(--bg-brand);
  box-shadow: var(--shadow-sm);
}

.analytics-chart {
  position: relative;
  height: 260px;
  margin-top: 20px;
  overflow: hidden;
  border: 1px solid var(--border-light);
  border-radius: 14px;
  background: var(--bg-surface);
}

.analytics-echart {
  width: 100%;
  height: 100%;
}

.analytics-chart__empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  font-size: 13px;
  font-weight: 800;
  pointer-events: none;
}

.analytics-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.analytics-summary span {
  border-radius: 999px;
  background: var(--bg-muted);
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 900;
}

@media (max-width: 640px) {
  .analytics-panel__header {
    flex-direction: column;
  }

  .analytics-toolbar {
    width: 100%;
  }
}
</style>
