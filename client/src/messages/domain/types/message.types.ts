export type MessageTabKey = "group" | "user" | "teams"

export interface MessageTab {
  id: MessageTabKey
  label: string
  icon: string
}

export interface MessageContact {
  id: string
  name: string
  status: string
  isOnline: boolean
  avatarUrl?: string
}

export interface ChatMessage {
  id: string
  text: string
  isMine: boolean
  isLast?: boolean
  time?: string
  showTime?: boolean
  avatar?: string
}

export interface MessageConversation {
  id: string
  participant: MessageContact
  messages: ChatMessage[]
  isTyping: boolean
}
