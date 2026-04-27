import type { ProfileUser, MutualFriend } from "../domain/types/profile.types"

export const createProfileSnapshot = () => {
  const { t } = useI18n()

  const user: ProfileUser = {
    id: "1",
    fullName: "Administrator",
    username: "admin",
    avatar: "https://i.pravatar.cc/300",
    cover: "https://images.unsplash.com/photo-1542831371-29b0f74f9713",
    bio: "Love coding and building awesome things.",
    stats: {
      posts: 125,
      friends: 850,
      photos: 42
    }
  }

  const mutualFriends: MutualFriend[] = [
    { initials: "TH", name: "Thu Hà", meta: t("pages.profilePage.mutualFriendsMeta", { count: 8 }) },
    { initials: "BT", name: "Bảo Trân", meta: t("pages.profilePage.mutualFriendsMeta", { count: 12 }) },
    { initials: "NP", name: "Nam Phạm", meta: t("pages.profilePage.mutualFriendsMeta", { count: 5 }) },
    { initials: "LD", name: "Linh Đào", meta: t("pages.profilePage.mutualFriendsMeta", { count: 9 }) },
  ]

  const highlightPhotos = [1, 2, 3, 4]

  return {
    user,
    mutualFriends,
    highlightPhotos
  }
}
