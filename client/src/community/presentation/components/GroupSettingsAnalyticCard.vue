<!-- Description: Displays group member analytics with period filtering for the group settings page. -->
<template>
  <CommunitySettingsSectionCard
    eyebrow=""
    :title="$t('community.groupSettings.analytics.title')"
    icon="i-ph-trend-up-bold"
    :translate-text="false"
  >
    <div class="group-analytics">
      <div class="group-analytics__toolbar">
        <div class="group-analytics__stat">
          <span class="group-analytics__stat-icon">
            <Icon name="i-ph-users-three-fill" class="h-5 w-5" />
          </span>
          <strong>{{ memberTotalLabel }}</strong>
          <span>{{ $t('community.groupSettings.analytics.membersTotal') }}</span>
        </div>

        <USelect
          :model-value="period"
          :items="periodOptions"
          size="lg"
          class="group-analytics__period"
          @update:model-value="handlePeriodChange"
        />
      </div>

      <div v-if="loading" class="group-analytics__state">
        <Icon name="i-ph-spinner-gap-bold" class="h-5 w-5 animate-spin" />
        <span>{{ $t('community.groupSettings.analytics.loading') }}</span>
      </div>

      <div v-else-if="errorMessage" class="group-analytics__state group-analytics__state--error">
        <Icon name="i-ph-warning-circle-bold" class="h-5 w-5" />
        <span>{{ errorMessage }}</span>
      </div>

      <div v-else class="group-analytics__chart-wrap">
        <p class="group-analytics__timezone">(Based on UTC timezone)</p>
        <ClientOnly>
          <VChart
            class="group-analytics__chart"
            :option="chartOption"
            autoresize
          />
        </ClientOnly>
        <div class="group-analytics__legend">
          <span></span>
          {{ $t('community.groupSettings.analytics.joined') }}
        </div>
      </div>
    </div>
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

type AnalyticsPeriod = CommunityPageAnalyticsPeriod

const props = defineProps<{
  analytics: CommunityPageAnalyticsOverview | null
  period: AnalyticsPeriod
  loading?: boolean
  errorMessage?: string
}>()

const emit = defineEmits<{
  "update:period": [period: AnalyticsPeriod]
}>()



const periodOptions: Array<{ value: AnalyticsPeriod; label: string }> = [
  { value: "day", label: t("community.groupSettings.analytics.periods.today") },
  { value: "week", label: t("community.groupSettings.analytics.periods.week") },
  { value: "month", label: t("community.groupSettings.analytics.periods.month") },
  { value: "year", label: t("community.groupSettings.analytics.periods.year") },
]

function handlePeriodChange(value: unknown) {
  const nextPeriod = String(value || "day") as AnalyticsPeriod

  if (periodOptions.some(option => option.value === nextPeriod)) {
    emit("update:period", nextPeriod)
  }
}

const formatNumber = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(Math.max(0, Math.round(value)))

const memberTotalLabel = computed(() =>
  formatNumber(props.analytics?.followers ?? 0),
)

const resolveToken = (varName: string) => {
  if (!import.meta.client) return ""
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
}

const chartOption = computed<EChartsOption>(() => {
  const points = props.analytics?.chart ?? []

  return {
    color: [resolveToken('--color-success')],
    grid: {
      top: 26,
      right: 18,
      bottom: 28,
      left: 30,
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: resolveToken('--color-secondary-900'),
      borderWidth: 0,
      textStyle: {
        color: resolveToken('--text-inverse'),
        fontSize: 12,
        fontWeight: 700,
      },
    },
    xAxis: {
      type: "category",
      data: points.map(point => point.label),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: resolveToken('--text-tertiary'),
        fontSize: 10,
      },
    },
    yAxis: {
      type: "value",
      minInterval: 1,
      splitLine: {
        lineStyle: {
          color: resolveToken('--border-light'),
        },
      },
      axisLabel: {
        color: resolveToken('--text-tertiary'),
        fontSize: 10,
      },
    },
    series: [{
      name: "{{ $t('community.groupSettings.analytics.joined') }}",
      type: "line",
      data: points.map(point => point.likes),
      smooth: true,
      symbol: "circle",
      symbolSize: 6,
      lineStyle: {
        width: 3,
      },
      areaStyle: {
        color: `color-mix(in srgb, ${resolveToken('--color-success')} 12%, transparent)`,
      },
    }],
  }
})
</script>

<style scoped>
.group-analytics {
  min-height: 420px;
}

.group-analytics__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: space-between;
}

.group-analytics__stat {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--color-success);
  font-size: 16px;
  font-weight: 900;
}

.group-analytics__stat span:last-child {
  font-size: 14px;
}

.group-analytics__stat-icon {
  display: inline-flex;
  height: 34px;
  width: 34px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-success) 18%, transparent);
}

.group-analytics__period {
  min-width: 160px;
}

.group-analytics__state {
  align-items: center;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  color: var(--text-secondary);
  display: flex;
  font-size: 13px;
  font-weight: 800;
  gap: 8px;
  margin-top: 32px;
  padding: 14px 16px;
}

.group-analytics__state--error {
  border-color: color-mix(in srgb, var(--color-error) 20%, transparent); background: color-mix(in srgb, var(--color-error) 10%, transparent); color: var(--color-error);
}

.group-analytics__chart-wrap {
  margin-top: 28px;
  position: relative;
}

.group-analytics__timezone {
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 900;
  margin: 0;
  text-align: center;
}

.group-analytics__chart {
  height: 300px;
  width: 100%;
}

.group-analytics__legend {
  align-items: center;
  color: var(--text-primary);
  display: flex;
  font-size: 11px;
  font-weight: 700;
  gap: 8px;
  justify-content: center;
}

.group-analytics__legend span {
  background: var(--color-success);
  border-radius: 999px;
  display: inline-flex;
  height: 8px;
  width: 8px;
}
</style>
