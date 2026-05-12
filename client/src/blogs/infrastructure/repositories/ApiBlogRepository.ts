// English description: Nuxt API backed repository for blog authoring flows.

import { apiRoutes } from "#shared-kernel/application/constants/route-registry"
import { useNuxtApiClient } from "#shared-kernel/infrastructure/http/nuxt-api-client"
import type { BlogRepository } from "../../domain/repositories/BlogRepository"
import type { BlogCreateDraft, BlogCreateResult, BlogListArticle } from "../../domain/types/blog.types"

export function createApiBlogRepository(): BlogRepository {
  const client = useNuxtApiClient()

  return {
    async getBlogs(input) {
      return await client.get<BlogListArticle[]>(apiRoutes.blogs.list, {
        limit: input?.limit,
        offset: input?.offset,
        category: input?.category,
        mine: input?.mineOnly ? "1" : undefined,
      })
    },
    async createBlog(input: BlogCreateDraft) {
      const formData = new FormData()

      formData.append("title", input.title)
      formData.append("content", input.content)
      formData.append("description", input.description)
      formData.append("category", input.category)
      formData.append("tags", input.tags.join(","))
      formData.append("status", input.status)

      if (input.thumbnailFile) {
        formData.append("thumbnail", input.thumbnailFile)
      }

      return await client.post<BlogCreateResult, FormData>(apiRoutes.blogs.create, formData)
    },
  }
}
