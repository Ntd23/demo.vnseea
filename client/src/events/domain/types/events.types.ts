export type EventTabKey = "upcoming" | "my" | "going" | "invited" | "interested" | "past"
export type EventRsvpState = "none" | "going" | "interested" | "not_interested" | "invited"
export type EventCategoryKey = "all" | "community" | "education" | "business" | "culture" | "technology"
export type EventCityKey = "all" | "ho-chi-minh" | "ha-noi" | "da-nang" | "online"
export type EventSortKey = "soonest" | "going" | "interested"

export type EventTab = {
  key: EventTabKey
  label: string
  icon: string
}

export type EventCategory = {
  value: EventCategoryKey
  label: string
  icon: string
}

export type EventCity = {
  value: EventCityKey
  label: string
}

export type EventAttendee = {
  id: number
  name: string
  role: string
  initials: string
  gradient: string
  status: "going" | "interested" | "invited"
}

export type MockEvent = {
  id: string
  title: string
  category: Exclude<EventCategoryKey, "all">
  categoryLabel: string
  host: string
  hostRole: string
  hostInitials: string
  hostGradient: string
  location: string
  city: Exclude<EventCityKey, "all">
  startsAt: string
  endsAt: string
  dateLabel: string
  timeLabel: string
  month: string
  day: string
  cover: string
  coverFallback: string
  description: string
  summary: string
  tags: string[]
  tabKeys: EventTabKey[]
  userState: EventRsvpState
  isOwner: boolean
  capacity: number
  stats: {
    going: number
    interested: number
    invited: number
  }
  agenda: {
    time: string
    title: string
    description: string
  }[]
  attendees: EventAttendee[]
}
