export function usePhotosSeo() {
  const { t } = useI18n()

  useSeoMeta({
    title: () => t("pages.photosPage.seoTitle"),
    description: () => t("pages.photosPage.seoDescription"),
  })
}
