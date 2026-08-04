// English description: Lazily hydrates tagged-profile relationship state and follows users from the tagged people modal.

import { computed, ref, toValue, watch, type MaybeRefOrGetter } from "vue"
import { useCurrentAuthUserStore } from "../../../auth/application/stores/useCurrentAuthUserStore"
import { createApiProfileRepository } from "../../../profile/infrastructure/repositories/ApiProfileRepository"
import type { FeedTaggedUser } from "../../domain/types/feed.types"

export type TaggedPeopleModalUser = FeedTaggedUser & {
  relationshipLoaded: boolean
  relationshipLoading: boolean
  followPending: boolean
  isOwner: boolean
  isFollowing: boolean
  isFollowRequested: boolean
}

const createModalUser = (user: FeedTaggedUser): TaggedPeopleModalUser => ({
  ...user,
  relationshipLoaded: false,
  relationshipLoading: false,
  followPending: false,
  isOwner: false,
  isFollowing: false,
  isFollowRequested: false,
})

export function useTaggedPeopleModal(source: MaybeRefOrGetter<FeedTaggedUser[]>) {
  const authStore = useCurrentAuthUserStore()
  const profileRepository = createApiProfileRepository()
  const users = ref<TaggedPeopleModalUser[]>([])

  watch(
    () => toValue(source),
    taggedUsers => {
      const previousById = new Map(users.value.map(user => [user.id, user]))
      users.value = taggedUsers.map(user => {
        const previous = previousById.get(user.id)
        return previous ? { ...previous, ...user } : createModalUser(user)
      })
    },
    { immediate: true, deep: true },
  )

  const isAuthenticated = computed(() => Boolean(authStore.user?.id))

  async function loadRelationships() {
    await authStore.hydrate()
    if (!authStore.user) return

    await Promise.all(users.value.map(async user => {
      if (user.relationshipLoaded || user.relationshipLoading || !user.username) return

      user.relationshipLoading = true
      try {
        const profile = await profileRepository.getProfileByUsername(user.username)
        if (!profile) return

        user.isOwner = profile.isOwner || profile.id === authStore.user?.id
        user.isFollowing = profile.isFollowing
        user.isFollowRequested = profile.isFollowRequested
        user.relationshipLoaded = true
      }
      catch {
        // Keep profile navigation available when relationship hydration fails.
      }
      finally {
        user.relationshipLoading = false
      }
    }))
  }

  async function followUser(user: TaggedPeopleModalUser) {
    if (user.followPending || !user.relationshipLoaded || user.isOwner || user.isFollowing || user.isFollowRequested) return null

    user.followPending = true
    try {
      const result = await profileRepository.runProfileAction({ action: "follow", userId: user.id })
      if (!result.ok) throw new Error("Follow action was rejected")

      const status = result.status.toLowerCase()
      const requested = status.includes("request")
      const unfollowed = /unfollow|remove|delete|not_follow|none|0/.test(status)

      user.isFollowRequested = !unfollowed && requested
      user.isFollowing = !unfollowed && !requested
      return { requested: user.isFollowRequested }
    }
    finally {
      user.followPending = false
    }
  }

  return { users, isAuthenticated, loadRelationships, followUser }
}
