export function useMemoriesSeo() {
  const { t } = useI18n()

  useSeoMeta({
    title: () => t("pages.memoriesPage.seoTitle"),
    description: () => t("pages.memoriesPage.seoDescription"),
  })
}
