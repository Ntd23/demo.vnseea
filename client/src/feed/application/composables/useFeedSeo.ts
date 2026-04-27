import { computed } from "vue"

export function useFeedSeo(path = "/feed") {
  const { t } = useI18n()
  const requestURL = useRequestURL()

  const canonicalUrl = computed(() =>
    new URL(path, requestURL.origin).toString(),
  )

  useSeoMeta({
    title: () => t("pages.homeFeedPage.seoTitle"),
    description: () => t("pages.homeFeedPage.seoDescription"),
    ogTitle: () => t("pages.homeFeedPage.seoTitle"),
    ogDescription: () => t("pages.homeFeedPage.seoDescription"),
    ogUrl: () => canonicalUrl.value,
  })

  useHead({
    link: [
      {
        rel: "canonical",
        href: canonicalUrl,
      },
    ],
  })

  return {
    canonicalUrl,
  }
}
