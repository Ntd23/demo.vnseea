// English description: Repository contract for blog authoring and article workflows.

import type { BlogCreateDraft, BlogCreateResult, BlogListArticle, BlogListQuery } from "../types/blog.types"

export interface BlogRepository {
  getBlogs(input?: BlogListQuery): Promise<BlogListArticle[]>
  createBlog(input: BlogCreateDraft): Promise<BlogCreateResult>
}
