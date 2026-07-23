<!-- Description: Displays page analytics charts and summary cards in page settings. -->
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

const copy = {
  loading: "\u0110ang t\u1ea3i d\u1eef li\u1ec7u ph\u00e2n t\u00edch...",
  empty: "Ch\u01b0a c\u00f3 d\u1eef li\u1ec7u ph\u00e2n t\u00edch cho trang n\u00e0y.",
  filterAria: "L\u1ecdc bi\u1ec3u \u0111\u1ed3",
  chartSubtitle: "B\u1ed9 l\u1ecdc ch\u1ec9 \u00e1p d\u1ee5ng cho bi\u1ec3u \u0111\u1ed3, c\u00e1c ch\u1ec9 s\u1ed1 ph\u00eda tr\u00ean l\u00e0 t\u1ed5ng to\u00e0n th\u1eddi gian.",
  chartEmpty: "Ch\u01b0a c\u00f3 l\u01b0\u1ee3t th\u00edch m\u1edbi trong kho\u1ea3ng n\u00e0y.",
  likes: "L\u01b0\u1ee3t th\u00edch",
  likesIn: "l\u01b0\u1ee3t th\u00edch trong",
  peak: "cao nh\u1ea5t",
} as const

const periodOptions: Array<{ value: CommunityPageAnalyticsPeriod; label: string }> = [
  { value: "day", label: "Ng\u00e0y" },
  { value: "week", label: "Tu\u1ea7n" },
  { value: "month", label: "Th\u00e1ng" },
  { value: "year", label: "N\u0103m" },
]

const formatNumber = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(Math.max(0, Math.round(value)))

const activePeriodOption = computed(() =>
  periodOptions.find(option => option.value === props.period) ?? periodOptions[1],
)

const periodLabelLower = computed(() => activePeriodOption.value.label.toLowerCase())

const chartTitle = computed(() => `${copy.likes} theo ${periodLabelLower.value}`)

const chartPoints = computed(() => props.analytics?.chart ?? [])

const chartPeak = computed(() =>
  Math.max(0, ...chartPoints.value.map(point => point.likes)),
)

const chartTotal = computed(() =>
  chartPoints.value.reduce((total, point) => total + point.likes, 0),
)

const chartOption = computed<EChartsOption>(() => {
  const labels = chartPoints.value.map(point => point.label)
  const values = chartPoints.value.map(point => point.likes)

  return {
    color: ["var(--bg-brand)"],
    grid: {
      top: 18,
      right: 18,
      bottom: 30,
      left: 38,
      containLabel: false,
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(15, 23, 42, 0.92)",
      borderWidth: 0,
      borderRadius: 10,
      padding: [8, 10],
      textStyle: {
        color: "#ffffff",
        fontSize: 12,
        fontWeight: 700,
      },
      valueFormatter: value => `${formatNumber(Number(value || 0))} ${copy.likes.toLowerCase()}`,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: labels,
      axisLine: {
        lineStyle: {
          color: "#e2e8f0",
        },
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: "#94a3b8",
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
        color: "#94a3b8",
        fontSize: 10,
        fontWeight: 800,
      },
      splitLine: {
        lineStyle: {
          color: "#eef2f7",
        },
      },
    },
    series: [{
      name: copy.likes,
      type: "line",
      data: values,
      smooth: true,
      symbol: "circle",
      symbolSize: 7,
      showSymbol: values.length <= 31,
      lineStyle: {
        width: 3,
        color: "var(--bg-brand)",
      },
      itemStyle: {
        color: "#ffffff",
        borderColor: "var(--bg-brand)",
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
            { offset: 0, color: "color-mix(in srgb, var(--bg-brand) 22%, transparent)" },
            { offset: 1, color: "color-mix(in srgb, var(--bg-brand) 2%, transparent)" },
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
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  background: var(--bg-surface);
  padding: 20px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  border-color: #e2e8f0;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
}

.stat-icon-wrap {
  display: flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
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
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: var(--bg-muted);
  color: var(--text-secondary);
  padding: 14px 16px;
  font-size: 13px;
  font-weight: 800;
}

.analytics-state--error {
  border-color: #fecaca;
  background: #fef2f2;
  color: #dc2626;
}

.analytics-panel {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
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
  border: 1px solid #e2e8f0;
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
  box-shadow: 0 1px 5px rgba(15, 23, 42, 0.08);
}

.analytics-chart {
  position: relative;
  height: 260px;
  margin-top: 20px;
  overflow: hidden;
  border: 1px solid #eef2f7;
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
  background: var(--color-primary-50);
  color: var(--bg-brand-hover);
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
