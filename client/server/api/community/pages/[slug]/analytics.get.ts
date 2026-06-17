// English description: Returns real page analytics for the Nuxt page settings analytics tab.

import { createError, getQuery, getRouterParam } from "h3"
import { createBackendApiClient } from "../../../../utils/backend-api-client"
import { assertBackendApiSuccess } from "../../../../utils/backend-api-response"
import { resolvePageRecordBySlug } from "../../_shared"
import type {
  CommunityPageAnalyticsOverview,
  CommunityPageAnalyticsPeriod,
  CommunityPageAnalyticsPoint,
} from "../../../../../src/community/domain/types/community.types"

type BackendPageAnalyticsResponse = {
  api_status?: number | string
  period?: CommunityPageAnalyticsPeriod
  likes?: number | string
  likes_in_period?: number | string
  followers?: number | string
  posts?: number | string
  posts_in_period?: number | string
  interactions?: number | string
  views?: number | string
  engagement_rate?: number | string
  has_view_source?: boolean | number | string
  chart?: Array<{
    label?: string
    likes?: number | string
    views?: number | string
    interactions?: number | string
  }>
  errors?: { error_text?: string }
}

const allowedPeriods = new Set<CommunityPageAnalyticsPeriod>(["day", "week", "month", "year"])

const asNumber = (value: unknown) => {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

const isTruthy = (value: unknown) =>
  value === true || value === 1 || value === "1" || value === "true" || value === "yes"

const formatNumber = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(Math.max(0, Math.round(value)))

const normalizePeriod = (value: unknown): CommunityPageAnalyticsPeriod => {
  const period = String(Array.isArray(value) ? value[0] : value || "week")

  return allowedPeriods.has(period as CommunityPageAnalyticsPeriod)
    ? period as CommunityPageAnalyticsPeriod
    : "week"
}

const mapChartPoint = (point: NonNullable<BackendPageAnalyticsResponse["chart"]>[number]): CommunityPageAnalyticsPoint => ({
  label: String(point?.label || ""),
  likes: asNumber(point?.likes),
  views: asNumber(point?.views),
  interactions: asNumber(point?.interactions),
})

export default defineEventHandler(async (event): Promise<CommunityPageAnalyticsOverview> => {
  const slug = String(getRouterParam(event, "slug") || "").trim()
  const period = normalizePeriod(getQuery(event).period)

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Page slug is required.",
    })
  }

  const page = await resolvePageRecordBySlug(event, slug)

  if (!page.canManage) {
    throw createError({
      statusCode: 403,
      statusMessage: "You do not have permission to view this page analytics.",
    })
  }

  const response = assertBackendApiSuccess(
    await createBackendApiClient(event).post<BackendPageAnalyticsResponse, { page_id: number; period: CommunityPageAnalyticsPeriod }>(
      "page-analytics",
      {
        page_id: page.id,
        period,
      },
    ),
    "Unable to load page analytics.",
  )

  const likes = asNumber(response.likes)
  const likesInPeriod = asNumber(response.likes_in_period)
  const followers = asNumber(response.followers)
  const posts = asNumber(response.posts)
  const postsInPeriod = asNumber(response.posts_in_period)
  const interactions = asNumber(response.interactions)
  const views = asNumber(response.views)
  const engagementRate = asNumber(response.engagement_rate)
  const hasViewSource = isTruthy(response.has_view_source)

  return {
    period: response.period && allowedPeriods.has(response.period) ? response.period : period,
    likes,
    likesInPeriod,
    followers,
    posts,
    postsInPeriod,
    interactions,
    views,
    engagementRate,
    hasViewSource,
    stats: [
      {
        key: "likes",
        label: "T\u1ed5ng l\u01b0\u1ee3t th\u00edch",
        value: formatNumber(likes),
        rawValue: likes,
        icon: "i-ph-thumbs-up-bold",
        color: "bg-blue-50 text-blue-600",
      },
      {
        key: "posts",
        label: "T\u1ed5ng b\u00e0i vi\u1ebft",
        value: formatNumber(posts),
        rawValue: posts,
        icon: "i-ph-newspaper-bold",
        color: "bg-amber-50 text-amber-600",
      },
      {
        key: "interactions",
        label: "T\u1ed5ng t\u01b0\u01a1ng t\u00e1c b\u00e0i vi\u1ebft",
        value: formatNumber(interactions),
        rawValue: interactions,
        icon: "i-ph-hand-heart-bold",
        color: "bg-rose-50 text-rose-600",
      },
      {
        key: "views",
        label: "L\u01b0\u1ee3t xem b\u00e0i vi\u1ebft",
        value: formatNumber(views),
        rawValue: views,
        icon: "i-ph-eye-bold",
        color: hasViewSource ? "bg-cyan-50 text-cyan-600" : "bg-slate-100 text-slate-500",
      },
      {
        key: "engagementRate",
        label: "T\u1ef7 l\u1ec7 t\u01b0\u01a1ng t\u00e1c",
        value: `${engagementRate}%`,
        rawValue: engagementRate,
        icon: "i-ph-chart-pie-slice-bold",
        color: "bg-violet-50 text-violet-600",
      },
    ],
    chart: (response.chart ?? []).map(mapChartPoint),
  }
})
