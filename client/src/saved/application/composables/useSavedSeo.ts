export function useSavedSeo() {
  const { t } = useI18n()

  useSeoMeta({
    title: () => t("pages.savedPostsPage.seoTitle"),
    description: () => t("pages.savedPostsPage.seoDescription"),
  })
}
