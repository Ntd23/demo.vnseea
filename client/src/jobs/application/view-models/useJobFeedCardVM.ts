// English description: Loads localized backend job details for a job post rendered inside the social feed.

import { createApiJobsRepository } from "../../infrastructure/repositories/ApiJobsRepository"

export function useJobFeedCardVM(postId: MaybeRefOrGetter<number>) {
  const repository = createApiJobsRepository()
  const resolvedPostId = computed(() => {
    const value = Number(toValue(postId) || 0)
    return Number.isInteger(value) && value > 0 ? value : 0
  })

  const {
    data: detail,
    pending,
    error,
  } = useAsyncData(
    () => `job-feed-card:${resolvedPostId.value}`,
    async () => {
      if (!resolvedPostId.value) {
        return null
      }

      return await repository.getDetailByPostId(resolvedPostId.value)
    },
    {
      watch: [resolvedPostId],
      default: () => null,
    },
  )

  return {
    job: computed(() => detail.value?.job ?? null),
    pending,
    error,
  }
}
