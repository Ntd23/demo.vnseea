// English description: Returns real group analytics for the Nuxt group settings analytics tab.

import { createError, getQuery, getRouterParam } from "h3"
import { createBackendApiClient } from "../../../../utils/backend-api-client"
import { assertBackendApiSuccess } from "../../../../utils/backend-api-response"
import { resolveGroupRecordBySlug } from "../../_shared"
import type {
  CommunityPageAnalyticsOverview,
  CommunityPageAnalyticsPeriod,
  CommunityPageAnalyticsPoint,
} from "../../../../../src/community/domain/types/community.types"

type BackendGroupAnalyticsResponse = {
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
  const period = String(Array.isArray(value) ? value[0] : value || "day")

  return allowedPeriods.has(period as CommunityPageAnalyticsPeriod)
    ? period as CommunityPageAnalyticsPeriod
    : "day"
}

const mapChartPoint = (point: NonNullable<BackendGroupAnalyticsResponse["chart"]>[number]): CommunityPageAnalyticsPoint => ({
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
      statusMessage: "Group slug is required.",
    })
  }

  const group = await resolveGroupRecordBySlug(event, slug)

  if (!group.canManage) {
    throw createError({
      statusCode: 403,
      statusMessage: "You do not have permission to view this group analytics.",
    })
  }

  const response = assertBackendApiSuccess(
    await createBackendApiClient(event).post<BackendGroupAnalyticsResponse, { group_id: number; period: CommunityPageAnalyticsPeriod }>(
      "group-analytics",
      {
        group_id: group.id,
        period,
      },
    ),
    "Unable to load group analytics.",
  )

  const members = asNumber(response.followers ?? response.likes)
  const membersInPeriod = asNumber(response.likes_in_period)
  const posts = asNumber(response.posts)
  const postsInPeriod = asNumber(response.posts_in_period)
  const interactions = asNumber(response.interactions)
  const views = asNumber(response.views)
  const engagementRate = asNumber(response.engagement_rate)
  const hasViewSource = isTruthy(response.has_view_source)

  return {
    period: response.period && allowedPeriods.has(response.period) ? response.period : period,
    likes: members,
    likesInPeriod: membersInPeriod,
    followers: members,
    posts,
    postsInPeriod,
    interactions,
    views,
    engagementRate,
    hasViewSource,
    stats: [
      {
        key: "members",
        label: "Tổng số thành viên",
        value: formatNumber(members),
        rawValue: members,
        icon: "i-ph-users-three-bold",
        color: "bg-green-50 text-green-600",
      },
      {
        key: "posts",
        label: "Tổng bài viết",
        value: formatNumber(posts),
        rawValue: posts,
        icon: "i-ph-newspaper-bold",
        color: "bg-amber-50 text-amber-600",
      },
      {
        key: "interactions",
        label: "Tổng tương tác bài viết",
        value: formatNumber(interactions),
        rawValue: interactions,
        icon: "i-ph-hand-heart-bold",
        color: "bg-rose-50 text-rose-600",
      },
    ],
    chart: (response.chart ?? []).map(mapChartPoint),
  }
})
