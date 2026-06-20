// English description: Loads backend advertising analytics and derives chart rows for the ads stats route.

import { createApiAdsRepository } from "../../infrastructure/repositories/ApiAdsRepository"

export function useAdsChartPageVM(campaignId: number) {
  const repository = createApiAdsRepository()
  const { data, pending, error } = useAsyncData(
    () => `ads:stats:${campaignId}`,
    () => repository.getStats(campaignId),
    {
      default: () => ({ campaign: null, points: [] }),
    },
  )

  const campaign = computed(() => data.value.campaign)
  const points = computed(() => data.value.points)
  const maxValue = computed(() => Math.max(1, ...points.value.flatMap(point => [point.clicks, point.views, point.spend])))
  const totals = computed(() => points.value.reduce(
    (total, point) => ({
      clicks: total.clicks + point.clicks,
      views: total.views + point.views,
      spend: total.spend + point.spend,
    }),
    { clicks: 0, views: 0, spend: 0 },
  ))

  return {
    campaign,
    error,
    maxValue,
    pending,
    points,
    totals,
  }
}
