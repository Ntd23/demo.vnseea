// English description: Repository contract for forum browsing, search, member lists, replies, and owner mutations.

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
} from "../types/forum.types"

export interface ForumRepository {
  getCatalog(query: ForumCatalogQuery): Promise<ForumCatalog>
  getThreads(query: ForumThreadQuery): Promise<ForumThreadList>
  getMyThreads(query: Omit<ForumThreadQuery, "forumId">): Promise<ForumThreadList>
  getMembers(query: ForumMemberQuery): Promise<ForumMemberList>
  search(query: ForumSearchQuery): Promise<ForumSearchResult>
  getMyMessages(query: { offset?: number | null }): Promise<ForumMessageList>
  getThreadDetail(id: number): Promise<ForumThreadDetail>
  createThread(payload: ForumThreadPayload): Promise<ForumMutationResult>
  replyThread(payload: ForumReplyPayload): Promise<ForumMutationResult>
  updateThread(payload: ForumThreadUpdatePayload): Promise<ForumMutationResult>
  deleteThread(id: number): Promise<ForumMutationResult>
  updateReply(payload: ForumReplyUpdatePayload): Promise<ForumMutationResult>
  deleteReply(id: number): Promise<ForumMutationResult>
}
