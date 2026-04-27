export function useWatchSeo() {
  const { t } = useI18n()

  useSeoMeta({
    title: () => t("pages.watchPage.seoTitle"),
    description: () => t("pages.watchPage.seoDescription"),
  })
}
