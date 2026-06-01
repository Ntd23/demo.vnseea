// English description: Provides public CMS footer links for guest-facing surfaces.

import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import type { CmsRepository } from "../../domain/repositories/CmsRepository"
import { createApiCmsRepository } from "../../infrastructure/repositories/ApiCmsRepository"

export interface CmsFooterLink {
  label: string
  to: string
}

const termsLinks: CmsFooterLink[] = [
  { label: "Điều khoản", to: appRoutes.termsOfUse },
  { label: "Quyền riêng tư", to: appRoutes.privacyPolicy },
  { label: "Giới thiệu", to: appRoutes.terms("about-us") },
]

export function useCmsFooterLinksVM(
  repository: CmsRepository = createApiCmsRepository(),
) {
  const { data: customPages } = useAsyncData(
    "cms:footer-links",
    () => repository.getPages(),
    {
      default: () => [],
    },
  )

  const links = computed<CmsFooterLink[]>(() => [
    ...termsLinks,
    ...customPages.value.map(page => ({
      label: page.title,
      to: page.href,
    })),
  ])

  return {
    links,
  }
}
