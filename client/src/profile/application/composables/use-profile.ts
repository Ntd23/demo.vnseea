import { createProfileSnapshot } from "../use-cases/create-profile-snapshot"

const { user, mutualFriends, highlightPhotos } = createProfileSnapshot()

export const useProfile = () => {
  return {
    user: readonly(ref(user)),
    mutualFriends: readonly(ref(mutualFriends)),
    highlightPhotos: readonly(ref(highlightPhotos))
  }
}
