export function usePopularSeo() {
  const { t } = useI18n()

  useSeoMeta({
    title: () => t("pages.popularPage.seoTitle"),
    description: () => t("pages.popularPage.seoDescription"),
  })
}
