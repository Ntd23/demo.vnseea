import type { Reel } from "../../domain/types/reels.types"

export function useReelsPage() {
  const { t } = useI18n()

  const reels = computed<Reel[]>(() => [
    {
      id: 1,
      title: t("pages.reelsPage.reelOneTitle"),
      author: "Thanh Hà",
      subtitle: t("pages.reelsPage.reelOneSubtitle"),
      description: t("pages.reelsPage.reelOneDescription"),
      music: t("pages.reelsPage.reelOneMusic"),
      likes: 120,
      comments: 18,
      shares: 9,
      views: 2400,
      tags: ["#workspace", "#dailyflow"],
      cover: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&h=1600&q=80",
      avatar: "https://i.pravatar.cc/150?u=reel-1",
    },
    {
      id: 2,
      title: t("pages.reelsPage.reelTwoTitle"),
      author: "Minh Anh",
      subtitle: t("pages.reelsPage.reelTwoSubtitle"),
      description: t("pages.reelsPage.reelTwoDescription"),
      music: t("pages.reelsPage.reelTwoMusic"),
      likes: 218,
      comments: 44,
      shares: 21,
      views: 5200,
      tags: ["#travel", "#weekend"],
      cover: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&h=1600&q=80",
      avatar: "https://i.pravatar.cc/150?u=reel-2",
    },
    {
      id: 3,
      title: t("pages.reelsPage.reelThreeTitle"),
      author: "Hà My",
      subtitle: t("pages.reelsPage.reelThreeSubtitle"),
      description: t("pages.reelsPage.reelThreeDescription"),
      music: t("pages.reelsPage.reelThreeMusic"),
      likes: 95,
      comments: 12,
      shares: 7,
      views: 1800,
      tags: ["#camera", "#behindthescenes"],
      cover: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=900&h=1600&q=80",
      avatar: "https://i.pravatar.cc/150?u=reel-3",
    },
  ])

  const activeIndex = ref(0)
  const activeReel = computed(() => reels.value[activeIndex.value])

  const nextReel = () => {
    activeIndex.value = (activeIndex.value + 1) % reels.value.length
  }

  const prevReel = () => {
    activeIndex.value = (activeIndex.value - 1 + reels.value.length) % reels.value.length
  }

  return {
    activeIndex,
    activeReel,
    reels,
    nextReel,
    prevReel,
  }
}
