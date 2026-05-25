// Description: Implements message calls repository against Nuxt server API bridges.

import { apiRoutes } from "#shared-kernel/application/constants/route-registry"
import { useNuxtApiClient } from "#shared-kernel/infrastructure/http/nuxt-api-client"
import type { MessageCallsRepository } from "../../domain/repositories/MessageCallsRepository"
import type {
  MessageCallCreateResult,
  MessageCallSession,
  MessageCallType,
  MessageIncomingCall,
} from "../../domain/types/calls.types"

const createCallQuery = (input: { id: number, type: MessageCallType }) => ({
  id: input.id,
  type: input.type,
})

export function createApiMessageCallsRepository(): MessageCallsRepository {
  const client = useNuxtApiClient()

  return {
    async createCall(input) {
      return await client.post<MessageCallCreateResult, Record<string, unknown>>(
        apiRoutes.messages.calls.create,
        input,
      )
    },
    async getOutgoingStatus(input) {
      return await client.get<{ status: number, url?: string, text?: string }>(
        apiRoutes.messages.calls.status,
        createCallQuery(input),
      )
    },
    async getSessionPayload(input) {
      return await client.get<MessageCallSession>(
        apiRoutes.messages.calls.payload,
        createCallQuery(input),
      )
    },
    async answerCall(input) {
      return await client.post<MessageCallSession, Record<string, unknown>>(
        apiRoutes.messages.calls.answer,
        input,
      )
    },
    async declineCall(input) {
      return await client.post<{ ok: boolean }, Record<string, unknown>>(
        apiRoutes.messages.calls.decline,
        input,
      )
    },
    async endCall(input) {
      return await client.post<{ ok: boolean }, Record<string, unknown>>(
        apiRoutes.messages.calls.end,
        input,
      )
    },
    async getIncomingCall(type) {
      return await client.get<MessageIncomingCall | null>(
        apiRoutes.messages.calls.incoming,
        { type },
      )
    },
  }
}
