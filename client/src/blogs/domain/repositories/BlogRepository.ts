import type { BlogArticle, ReadBlogArticle } from "../types/blog.types"

export interface BlogRepository {
  listArticles(): BlogArticle[]
  listReadArticles(): ReadBlogArticle[]
}
