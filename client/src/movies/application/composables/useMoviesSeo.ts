export function useMoviesSeo() {
  const { t } = useI18n()

  useSeoMeta({
    title: () => t("pages.moviesPage.seoTitle"),
    description: () => t("pages.moviesPage.seoDescription"),
  })
}
