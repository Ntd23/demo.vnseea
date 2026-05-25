// Description: Types for one-to-one message calls backed by the PHP call tables and LiveKit.
export type MessageCallType = "audio" | "video"
export type MessageCallDirection = "incoming" | "outgoing"
export type MessageCallStatus = "idle" | "ringing" | "connecting" | "active" | "ended" | "busy" | "declined" | "no_answer" | "error"

export type MessageCallPeer = {
  id: number
  name: string
  avatar?: string
}

export type MessageCallSession = {
  id: number
  type: MessageCallType
  direction: MessageCallDirection
  provider: "livekit"
  roomName: string
  wsUrl: string
  token: string
  currentUser: MessageCallPeer
  peer: MessageCallPeer
}

export type MessageIncomingCall = {
  id: number
  type: MessageCallType
  peer: MessageCallPeer
}

export type MessageCallCreateResult = {
  status: number
  id: number
  type: MessageCallType
  provider?: string
  busy?: boolean
  message?: string
}
