// English description: Nuxt API implementation of the forum repository contract.

import type { ForumRepository } from "../../domain/repositories/ForumRepository"
import type {
  ForumCatalog,
  ForumCatalogQuery,
  ForumMutationResult,
  ForumReplyPayload,
  ForumThreadDetail,
  ForumThreadList,
  ForumThreadPayload,
  ForumThreadQuery,
} from "../../domain/types/forum.types"

export class ApiForumRepository implements ForumRepository {
  async getCatalog(query: ForumCatalogQuery): Promise<ForumCatalog> {
    return await $fetch<ForumCatalog>("/_api/forum", { query })
  }

  async getThreads(query: ForumThreadQuery): Promise<ForumThreadList> {
    return await $fetch<ForumThreadList>("/_api/forum/threads", { query })
  }

  async getMyThreads(query: Omit<ForumThreadQuery, "forumId">): Promise<ForumThreadList> {
    return await $fetch<ForumThreadList>("/_api/forum/my-threads", { query })
  }

  async getThreadDetail(id: number): Promise<ForumThreadDetail> {
    return await $fetch<ForumThreadDetail>(`/_api/forum/threads/${id}`)
  }

  async createThread(payload: ForumThreadPayload): Promise<ForumMutationResult> {
    return await $fetch<ForumMutationResult>("/_api/forum/threads", {
      method: "POST",
      body: payload,
    })
  }

  async replyThread(payload: ForumReplyPayload): Promise<ForumMutationResult> {
    return await $fetch<ForumMutationResult>(`/_api/forum/threads/${payload.threadId}/replies`, {
      method: "POST",
      body: payload,
    })
  }
}

export const createApiForumRepository = () => new ApiForumRepository()
