// English description: Coordinates public CMS page loading, SEO, canonical metadata, and render state.

import type { PublicSeoMeta } from "../../../seo/domain/types/public-seo.types"
import { cleanSeoText } from "../../../seo/domain/services/seo-text.service"
import type { CmsRepository } from "../../domain/repositories/CmsRepository"
import type { CmsPageKind } from "../../domain/types/cms.types"
import { getCmsPageCanonicalPath, getCmsPageKey } from "../../domain/services/cms-route.service"
import { createApiCmsRepository } from "../../infrastructure/repositories/ApiCmsRepository"

interface CmsPageVMInput {
  kind: CmsPageKind
  identifier: string
}

export async function useCmsPageVM(
  input: CmsPageVMInput,
  repository: CmsRepository = createApiCmsRepository(),
) {
  const requestURL = useRequestURL()
  const pageIdentifier = computed(() => input.identifier)
  const { data: page, pending: isLoading, error: loadError, refresh } = await useAsyncData(
    () => getCmsPageKey(input.kind, pageIdentifier.value),
    () => input.kind === "terms"
      ? repository.getPage({ kind: "terms", type: pageIdentifier.value })
      : repository.getPage({ kind: "custom", pageName: pageIdentifier.value }),
    {
      watch: [pageIdentifier],
      default: () => null,
    },
  )

  if (loadError.value) {
    throw createError({
      statusCode: loadError.value.statusCode || 404,
      statusMessage: loadError.value.statusMessage || "CMS page not found.",
    })
  }

  const canonicalUrl = computed(() => {
    if (!page.value) return ""

    return new URL(getCmsPageCanonicalPath(page.value), requestURL.origin).toString()
  })

  const seoMeta = computed<PublicSeoMeta | null>(() => {
    if (!page.value || !canonicalUrl.value) return null

    const description = cleanSeoText(page.value.contentHtml, 160)

    return {
      title: page.value.title,
      description: description || undefined,
      canonicalUrl: canonicalUrl.value,
      type: "website",
      robots: "index, follow",
    }
  })

  const hasHero = computed(() => page.value?.pageType === 1)
  const isAboutPage = computed(() => page.value?.kind === "terms" && page.value.type === "about-us")

  return {
    page,
    isLoading,
    loadError,
    refresh,
    canonicalUrl,
    seoMeta,
    hasHero,
    isAboutPage,
  }
}
