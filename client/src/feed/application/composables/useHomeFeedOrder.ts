// English description: Shares the active home-feed order between desktop navigation and the mobile feed control.

export type HomeFeedOrderKey = "all" | "following"

export function useHomeFeedOrder() {
  return useState<HomeFeedOrderKey>("home-feed:order", () => "all")
}
