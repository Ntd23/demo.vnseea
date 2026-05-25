// Description: Declares the frontend repository contract for one-to-one message call flows.

import type {
  MessageCallCreateResult,
  MessageCallSession,
  MessageCallType,
  MessageIncomingCall,
} from "../types/calls.types"

export interface MessageCallsRepository {
  createCall(input: {
    userId: number
    type: MessageCallType
  }): Promise<MessageCallCreateResult>
  getOutgoingStatus(input: {
    id: number
    type: MessageCallType
  }): Promise<{ status: number, url?: string, text?: string }>
  getSessionPayload(input: {
    id: number
    type: MessageCallType
  }): Promise<MessageCallSession>
  answerCall(input: {
    id: number
    type: MessageCallType
  }): Promise<MessageCallSession>
  declineCall(input: {
    id: number
    type: MessageCallType
  }): Promise<{ ok: boolean }>
  endCall(input: {
    id: number
    type: MessageCallType
    status: string
    duration?: number
    provider?: string
  }): Promise<{ ok: boolean }>
  getIncomingCall(type: MessageCallType): Promise<MessageIncomingCall | null>
}
