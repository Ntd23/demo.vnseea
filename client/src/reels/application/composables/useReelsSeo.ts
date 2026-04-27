export function useReelsSeo() {
  const { t } = useI18n()

  useSeoMeta({
    title: () => t("pages.reelsPage.seoTitle"),
    description: () => t("pages.reelsPage.seoDescription"),
  })
}
