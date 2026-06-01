// English description: Domain types for PHP-backed public CMS pages rendered by Nuxt.

export type CmsPageKind = "terms" | "custom"

export type CmsTermsType = "terms" | "privacy-policy" | "about-us" | "refund"

export interface CmsPageQuery {
  kind: CmsPageKind
  type?: CmsTermsType | string
  pageName?: string
}

export interface CmsPage {
  id?: number
  kind: CmsPageKind
  type?: CmsTermsType | string
  name?: string
  title: string
  contentHtml: string
  pageType: 0 | 1
  href: string
}

export interface CmsPageListItem {
  id?: number
  kind: "custom"
  name: string
  title: string
  href: string
}
