// English description: Nuxt API implementation for all backend-backed forum tabs and mutations.

import { useNuxtApiClient } from "#shared-kernel/infrastructure/http/nuxt-api-client"
import { apiRoutes } from "#shared-kernel/application/constants/route-registry"
import type { ForumRepository } from "../../domain/repositories/ForumRepository"
import type {
  ForumCatalog,
  ForumCatalogQuery,
  ForumMemberList,
  ForumMemberQuery,
  ForumMessageList,
  ForumMutationResult,
  ForumReplyPayload,
  ForumReplyUpdatePayload,
  ForumSearchQuery,
  ForumSearchResult,
  ForumThreadDetail,
  ForumThreadList,
  ForumThreadPayload,
  ForumThreadQuery,
  ForumThreadUpdatePayload,
} from "../../domain/types/forum.types"

export class ApiForumRepository implements ForumRepository {
  private readonly api = useNuxtApiClient()

  async getCatalog(query: ForumCatalogQuery): Promise<ForumCatalog> {
    return await this.api.get<ForumCatalog>(apiRoutes.forum.catalog, query)
  }

  async getThreads(query: ForumThreadQuery): Promise<ForumThreadList> {
    return await this.api.get<ForumThreadList>(apiRoutes.forum.threads, query)
  }

  async getMyThreads(query: Omit<ForumThreadQuery, "forumId">): Promise<ForumThreadList> {
    return await this.api.get<ForumThreadList>(apiRoutes.forum.myThreads, query)
  }

  async getMembers(query: ForumMemberQuery): Promise<ForumMemberList> {
    return await this.api.get<ForumMemberList>(apiRoutes.forum.members, query)
  }

  async search(query: ForumSearchQuery): Promise<ForumSearchResult> {
    return await this.api.get<ForumSearchResult>(apiRoutes.forum.search, query)
  }

  async getMyMessages(query: { offset?: number | null }): Promise<ForumMessageList> {
    return await this.api.get<ForumMessageList>(apiRoutes.forum.myMessages, query)
  }

  async getThreadDetail(id: number): Promise<ForumThreadDetail> {
    return await this.api.get<ForumThreadDetail>(apiRoutes.forum.thread(id))
  }

  async createThread(payload: ForumThreadPayload): Promise<ForumMutationResult> {
    return await this.api.post<ForumMutationResult, ForumThreadPayload>(apiRoutes.forum.threads, payload)
  }

  async replyThread(payload: ForumReplyPayload): Promise<ForumMutationResult> {
    return await this.api.post<ForumMutationResult, ForumReplyPayload>(apiRoutes.forum.threadReplies(payload.threadId), payload)
  }

  async updateThread(payload: ForumThreadUpdatePayload): Promise<ForumMutationResult> {
    return await this.api.put<ForumMutationResult, ForumThreadUpdatePayload>(apiRoutes.forum.thread(payload.id), payload)
  }

  async deleteThread(id: number): Promise<ForumMutationResult> {
    return await this.api.delete<ForumMutationResult>(apiRoutes.forum.thread(id))
  }

  async updateReply(payload: ForumReplyUpdatePayload): Promise<ForumMutationResult> {
    return await this.api.put<ForumMutationResult, ForumReplyUpdatePayload>(apiRoutes.forum.reply(payload.id), payload)
  }

  async deleteReply(id: number): Promise<ForumMutationResult> {
    return await this.api.delete<ForumMutationResult>(apiRoutes.forum.reply(id))
  }
}

export const createApiForumRepository = () => new ApiForumRepository()
