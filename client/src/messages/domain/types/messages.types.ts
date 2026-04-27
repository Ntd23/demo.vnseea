export type MessageTabKey = "group" | "user" | "teams"

export type MessageTab = {
  id: MessageTabKey
  label: string
  icon: string
}

export type MessageContact = {
  id: number
  name: string
  status: string
  isOnline: boolean
  avatarUrl: string
  tab: MessageTabKey
}

export type MessageItem = {
  id: number
  text: string
  isMine: boolean
  isLast?: boolean
  time?: string
  showTime?: boolean
  avatar?: string
}
