import type { ComputedRef } from "vue"
import { useMockReadBlogData } from "../../../../app/composables/useMockReadBlogData"
import type { ReadBlogArticle } from "../../domain/types/blog.types"

export function useReadBlogDataSource() {
  const { articles } = useMockReadBlogData()

  return {
    articles: articles as ComputedRef<ReadBlogArticle[]>,
  }
}
