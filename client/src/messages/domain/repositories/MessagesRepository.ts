// Description: Declares the frontend repository contract for inbox, thread, typing, recording, and single or multi-send message flows.

import type {
  MessageActionResult,
  MessageContact,
  MessageGroupCandidate,
  MessageGroupCreateCandidate,
  MessageGroupCreateDraft,
  MessageGroupUpdateDraft,
  MessageCreateGroupResult,
  MessageGroupDetails,
  MessageRealtimeToken,
  MessageTypingState,
  MessageTagsPayload,
  MessageItem,
  MessageSendDraft,
  MessageThread,
  MultiMessageSendResult,
  UploadedMessageRecord,
} from "../types/messages.types"

export interface MessagesRepository {
  getInbox(): Promise<MessageContact[]>
  getTags(): Promise<MessageTagsPayload>
  getThread(contact: MessageContact, options?: { beforeId?: number }): Promise<MessageThread>
  sendMessage(contact: MessageContact, input: MessageSendDraft): Promise<MessageItem[]>
  sendMultiMessage(input: {
    recipientIds: number[]
    text: string
    file?: File | null
    record?: UploadedMessageRecord | null
  }): Promise<MultiMessageSendResult>
  uploadRecord(
    blob: Blob,
    filename: string,
    options?: {
      mimeType?: string
      durationMs?: number
    },
  ): Promise<UploadedMessageRecord>
  setTyping(userId: number): Promise<MessageActionResult>
  clearTyping(userId: number): Promise<MessageActionResult>
  getTyping(userId: number): Promise<MessageTypingState>
  setGroupTyping(groupId: number): Promise<MessageActionResult>
  clearGroupTyping(groupId: number): Promise<MessageActionResult>
  getGroupTyping(groupId: number): Promise<MessageTypingState>
  getRealtimeToken(): Promise<MessageRealtimeToken>
  createTagLabel(input: { name: string, color: string }): Promise<MessageActionResult>
  deleteTagLabel(input: { tagId: number }): Promise<MessageActionResult>
  attachTag(input: { userId: number, tagId: number }): Promise<MessageActionResult>
  detachTag(input: { userId: number, tagId: number }): Promise<MessageActionResult>
  markAllAsRead(): Promise<MessageActionResult>
  markPresenceOnline(): Promise<MessageActionResult>
  deleteConversation(contact: MessageContact): Promise<MessageActionResult>
  getGroupDetails(groupId: number): Promise<MessageGroupDetails>
  searchCreateGroupParticipants(query: string): Promise<MessageGroupCreateCandidate[]>
  searchGroupCandidates(groupId: number, query: string): Promise<MessageGroupCandidate[]>
  addGroupMembers(groupId: number, userIds: number[]): Promise<MessageActionResult>
  removeGroupMember(groupId: number, userId: number): Promise<MessageActionResult>
  createGroup(input: MessageGroupCreateDraft): Promise<MessageCreateGroupResult>
  updateGroup(input: MessageGroupUpdateDraft): Promise<MessageActionResult>
}
