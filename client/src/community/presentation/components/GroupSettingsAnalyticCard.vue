<!-- Description: Displays group member analytics with period filtering for the group settings page. -->
<template>
  <CommunitySettingsSectionCard
    eyebrow=""
    title="Phân tích trang"
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
          <span>Tổng số thành viên</span>
        </div>

        <USelect
          :model-value="period"
          :items="periodOptions"
          size="lg"
          class="group-analytics__period"
          :ui="selectUi"
          @update:model-value="handlePeriodChange"
        />
      </div>

      <div v-if="loading" class="group-analytics__state">
        <Icon name="i-ph-spinner-gap-bold" class="h-5 w-5 animate-spin" />
        <span>Đang tải dữ liệu phân tích...</span>
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
          Đã tham gia
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

const selectUi = {
  base: "h-11 min-w-[160px] rounded-[8px] text-[13px]",
}

const periodOptions: Array<{ value: AnalyticsPeriod; label: string }> = [
  { value: "day", label: "Hôm nay" },
  { value: "week", label: "Tuần này" },
  { value: "month", label: "Tháng này" },
  { value: "year", label: "Năm nay" },
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

const chartOption = computed<EChartsOption>(() => {
  const points = props.analytics?.chart ?? []

  return {
    color: ["#6abd46"],
    grid: {
      top: 26,
      right: 18,
      bottom: 28,
      left: 30,
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(15, 23, 42, 0.92)",
      borderWidth: 0,
      textStyle: {
        color: "#ffffff",
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
        color: "#94a3b8",
        fontSize: 10,
      },
    },
    yAxis: {
      type: "value",
      minInterval: 1,
      splitLine: {
        lineStyle: {
          color: "#eef2f7",
        },
      },
      axisLabel: {
        color: "#94a3b8",
        fontSize: 10,
      },
    },
    series: [{
      name: "Đã tham gia",
      type: "line",
      data: points.map(point => point.likes),
      smooth: true,
      symbol: "circle",
      symbolSize: 6,
      lineStyle: {
        width: 3,
      },
      areaStyle: {
        color: "rgba(106, 189, 70, 0.12)",
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
  color: #6abd46;
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
  background: #dbf4d0;
}

.group-analytics__period {
  min-width: 160px;
}

.group-analytics__state {
  align-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  color: #475569;
  display: flex;
  font-size: 13px;
  font-weight: 800;
  gap: 8px;
  margin-top: 32px;
  padding: 14px 16px;
}

.group-analytics__state--error {
  border-color: #fecaca;
  background: #fef2f2;
  color: #dc2626;
}

.group-analytics__chart-wrap {
  margin-top: 28px;
  position: relative;
}

.group-analytics__timezone {
  color: #111827;
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
  color: #334155;
  display: flex;
  font-size: 11px;
  font-weight: 700;
  gap: 8px;
  justify-content: center;
}

.group-analytics__legend span {
  background: #6abd46;
  border-radius: 999px;
  display: inline-flex;
  height: 8px;
  width: 8px;
}
</style>
