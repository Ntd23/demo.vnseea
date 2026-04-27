import type { ChatMessage } from "../types/message.types"

interface OutgoingMessageOptions {
  id: string
  time?: string
  showTime?: boolean
}

export function canSendMessage(text: string) {
  return text.trim().length > 0
}

export function markConversationTails(messages: ChatMessage[]) {
  return messages.map((message, index) => ({
    ...message,
    isLast: index === messages.length - 1 || messages[index + 1]?.isMine !== message.isMine,
  }))
}

export function createOutgoingMessage(text: string, options: OutgoingMessageOptions): ChatMessage {
  return {
    id: options.id,
    text: text.trim(),
    isMine: true,
    showTime: options.showTime,
    time: options.time,
  }
}

export function appendOutgoingMessage(
  messages: ChatMessage[],
  text: string,
  options: OutgoingMessageOptions,
) {
  return markConversationTails([
    ...messages,
    createOutgoingMessage(text, options),
  ])
}
