export type EventTabKey = "upcoming" | "my" | "going" | "invited" | "interested" | "past"
export type EventRsvpState = "none" | "going" | "interested" | "not_interested" | "invited"
export type EventCategoryKey = "all" | "community" | "education" | "business" | "culture" | "technology"
export type EventCityKey = "all" | "ho-chi-minh" | "ha-noi" | "da-nang" | "online"
export type EventSortKey = "soonest" | "going" | "interested"

export const eventTabKeys: EventTabKey[] = ["upcoming", "my", "going", "invited", "interested", "past"]
export const eventCategoryKeys: EventCategoryKey[] = ["all", "community", "education", "business", "culture", "technology"]
export const eventCityKeys: EventCityKey[] = ["all", "ho-chi-minh", "ha-noi", "da-nang", "online"]
export const eventSortKeys: EventSortKey[] = ["soonest", "going", "interested"]

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

export const useMockEventsData = () => {
  const { t } = useI18n()

  const eventTabs: EventTab[] = [
    { key: "upcoming", label: t("pages.eventsPage.tabUpcoming"), icon: "i-ph-calendar-check" },
    { key: "my", label: t("pages.eventsPage.tabMy"), icon: "i-ph-user-circle-check" },
    { key: "going", label: t("pages.eventsPage.tabGoing"), icon: "i-ph-check-circle" },
    { key: "invited", label: t("pages.eventsPage.tabInvited"), icon: "i-ph-envelope-open" },
    { key: "interested", label: t("pages.eventsPage.tabInterested"), icon: "i-ph-star" },
    { key: "past", label: t("pages.eventsPage.tabPast"), icon: "i-ph-clock-counter-clockwise" },
  ]

  const eventCategories: EventCategory[] = [
    { value: "all", label: t("pages.eventsPage.all"), icon: "i-ph-squares-four" },
    { value: "community", label: t("pages.eventsPage.categoryCommunity"), icon: "i-ph-users-three" },
    { value: "education", label: t("pages.eventsPage.categoryEducation"), icon: "i-ph-graduation-cap" },
    { value: "business", label: t("pages.eventsPage.categoryBusiness"), icon: "i-ph-briefcase" },
    { value: "culture", label: t("pages.eventsPage.categoryCulture"), icon: "i-ph-confetti" },
    { value: "technology", label: t("pages.eventsPage.categoryTechnology"), icon: "i-ph-cpu" },
  ]

  const eventCities: EventCity[] = [
    { value: "all", label: t("pages.eventsPage.anywhere") },
    { value: "ho-chi-minh", label: t("pages.eventsPage.cityHoChiMinh") },
    { value: "ha-noi", label: t("pages.eventsPage.cityHaNoi") },
    { value: "da-nang", label: t("pages.eventsPage.cityDaNang") },
    { value: "online", label: t("pages.eventsPage.cityOnline") },
  ]

  const events: MockEvent[] = [
    {
      id: "tech-community-summit-2026",
      title: t("pages.eventsPage.event1Title"),
      category: "technology",
      categoryLabel: t("pages.eventsPage.categoryTechnology"),
      host: "VNSEEA Community",
      hostRole: t("pages.eventsPage.roleOrganizer"),
      hostInitials: "VC",
      hostGradient: "linear-gradient(135deg,#0000ff 0%,#18a999 100%)",
      location: t("pages.eventsPage.event1Location"),
      city: "ho-chi-minh",
      startsAt: "2026-05-14T09:00",
      endsAt: "2026-05-14T17:30",
      dateLabel: t("pages.eventsPage.event1DateLabel"),
      timeLabel: "09:00 - 17:30",
      month: t("pages.eventsPage.month5"),
      day: "14",
      cover: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80",
      coverFallback: "linear-gradient(135deg,#0000ff 0%,#18a999 58%,#f59e0b 120%)",
      description: t("pages.eventsPage.event1Description"),
      summary: t("pages.eventsPage.event1Summary"),
      tags: ["AI", "Product", "Community"],
      tabKeys: ["upcoming", "my", "going"],
      userState: "going",
      isOwner: true,
      capacity: 320,
      stats: { going: 184, interested: 642, invited: 58 },
      agenda: [
        {
          time: "09:00",
          title: t("pages.eventsPage.event1Agenda1Title"),
          description: t("pages.eventsPage.event1Agenda1Description"),
        },
        {
          time: "10:15",
          title: t("pages.eventsPage.event1Agenda2Title"),
          description: t("pages.eventsPage.event1Agenda2Description"),
        },
        {
          time: "14:00",
          title: t("pages.eventsPage.event1Agenda3Title"),
          description: t("pages.eventsPage.event1Agenda3Description"),
        },
      ],
      attendees: [
        { id: 1, name: "Thu Hà", role: t("pages.eventsPage.attendeeCommunityLead"), initials: "TH", gradient: "linear-gradient(135deg,#0000ff,#18a999)", status: "going" },
        { id: 2, name: "Bảo Trần", role: t("pages.eventsPage.attendeeProductManager"), initials: "BT", gradient: "linear-gradient(135deg,#0f766e,#f59e0b)", status: "going" },
        { id: 3, name: "Minh Anh", role: t("pages.eventsPage.attendeeDesigner"), initials: "MA", gradient: "linear-gradient(135deg,#2563eb,#10b981)", status: "interested" },
        { id: 4, name: "Hoàng Huy", role: t("pages.eventsPage.attendeeFrontendDev"), initials: "HH", gradient: "linear-gradient(135deg,#111827,#0000ff)", status: "invited" },
      ],
    },
    {
      id: "founder-breakfast-ha-noi",
      title: t("pages.eventsPage.event2Title"),
      category: "business",
      categoryLabel: t("pages.eventsPage.categoryBusiness"),
      host: "Hanoi Startup Circle",
      hostRole: t("pages.eventsPage.roleCommunityPartner"),
      hostInitials: "HS",
      hostGradient: "linear-gradient(135deg,#0f766e 0%,#f59e0b 100%)",
      location: t("pages.eventsPage.event2Location"),
      city: "ha-noi",
      startsAt: "2026-05-21T08:00",
      endsAt: "2026-05-21T10:30",
      dateLabel: t("pages.eventsPage.event2DateLabel"),
      timeLabel: "08:00 - 10:30",
      month: t("pages.eventsPage.month5"),
      day: "21",
      cover: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1600&q=80",
      coverFallback: "linear-gradient(135deg,#0f766e 0%,#f59e0b 100%)",
      description: t("pages.eventsPage.event2Description"),
      summary: t("pages.eventsPage.event2Summary"),
      tags: ["Startup", "Sales", "Founder"],
      tabKeys: ["upcoming", "interested"],
      userState: "interested",
      isOwner: false,
      capacity: 80,
      stats: { going: 46, interested: 118, invited: 24 },
      agenda: [
        {
          time: "08:00",
          title: t("pages.eventsPage.event2Agenda1Title"),
          description: t("pages.eventsPage.event2Agenda1Description"),
        },
        {
          time: "08:45",
          title: t("pages.eventsPage.event2Agenda2Title"),
          description: t("pages.eventsPage.event2Agenda2Description"),
        },
        {
          time: "09:45",
          title: t("pages.eventsPage.event2Agenda3Title"),
          description: t("pages.eventsPage.event2Agenda3Description"),
        },
      ],
      attendees: [
        { id: 5, name: "Quỳnh Lan", role: t("pages.eventsPage.attendeeFounder"), initials: "QL", gradient: "linear-gradient(135deg,#f59e0b,#0f766e)", status: "going" },
        { id: 6, name: "Đức Nam", role: t("pages.eventsPage.attendeeGrowth"), initials: "DN", gradient: "linear-gradient(135deg,#0000ff,#f59e0b)", status: "going" },
        { id: 7, name: "Linh Phạm", role: t("pages.eventsPage.attendeeMarketing"), initials: "LP", gradient: "linear-gradient(135deg,#10b981,#2563eb)", status: "interested" },
      ],
    },
    {
      id: "creative-night-da-nang",
      title: t("pages.eventsPage.event3Title"),
      category: "culture",
      categoryLabel: t("pages.eventsPage.categoryCulture"),
      host: "Da Nang Creative Club",
      hostRole: t("pages.eventsPage.roleCreativeClub"),
      hostInitials: "DC",
      hostGradient: "linear-gradient(135deg,#0ea5e9 0%,#f59e0b 100%)",
      location: t("pages.eventsPage.event3Location"),
      city: "da-nang",
      startsAt: "2026-06-06T18:30",
      endsAt: "2026-06-06T22:00",
      dateLabel: t("pages.eventsPage.event3DateLabel"),
      timeLabel: "18:30 - 22:00",
      month: t("pages.eventsPage.month6"),
      day: "06",
      cover: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1600&q=80",
      coverFallback: "linear-gradient(135deg,#0ea5e9 0%,#f59e0b 100%)",
      description: t("pages.eventsPage.event3Description"),
      summary: t("pages.eventsPage.event3Summary"),
      tags: ["Design", "Music", "Local"],
      tabKeys: ["upcoming", "invited"],
      userState: "invited",
      isOwner: false,
      capacity: 180,
      stats: { going: 92, interested: 310, invited: 61 },
      agenda: [
        {
          time: "18:30",
          title: t("pages.eventsPage.event3Agenda1Title"),
          description: t("pages.eventsPage.event3Agenda1Description"),
        },
        {
          time: "19:15",
          title: t("pages.eventsPage.event3Agenda2Title"),
          description: t("pages.eventsPage.event3Agenda2Description"),
        },
        {
          time: "20:30",
          title: t("pages.eventsPage.event3Agenda3Title"),
          description: t("pages.eventsPage.event3Agenda3Description"),
        },
      ],
      attendees: [
        { id: 8, name: "An Nguyễn", role: t("pages.eventsPage.attendeeIllustrator"), initials: "AN", gradient: "linear-gradient(135deg,#0ea5e9,#f59e0b)", status: "going" },
        { id: 9, name: "Mai Chi", role: t("pages.eventsPage.attendeeContentCreator"), initials: "MC", gradient: "linear-gradient(135deg,#0000ff,#0ea5e9)", status: "invited" },
        { id: 10, name: "Phú Lê", role: t("pages.eventsPage.attendeePhotographer"), initials: "PL", gradient: "linear-gradient(135deg,#111827,#f59e0b)", status: "interested" },
      ],
    },
    {
      id: "online-learning-lab",
      title: t("pages.eventsPage.event4Title"),
      category: "education",
      categoryLabel: t("pages.eventsPage.categoryEducation"),
      host: "Learning Guild",
      hostRole: t("pages.eventsPage.roleEducationGroup"),
      hostInitials: "LG",
      hostGradient: "linear-gradient(135deg,#2563eb 0%,#10b981 100%)",
      location: t("pages.eventsPage.event4Location"),
      city: "online",
      startsAt: "2026-06-12T20:00",
      endsAt: "2026-06-12T21:30",
      dateLabel: t("pages.eventsPage.event4DateLabel"),
      timeLabel: "20:00 - 21:30",
      month: t("pages.eventsPage.month6"),
      day: "12",
      cover: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80",
      coverFallback: "linear-gradient(135deg,#2563eb 0%,#10b981 100%)",
      description: t("pages.eventsPage.event4Description"),
      summary: t("pages.eventsPage.event4Summary"),
      tags: ["Online", "Learning", "Workshop"],
      tabKeys: ["upcoming", "going"],
      userState: "going",
      isOwner: false,
      capacity: 500,
      stats: { going: 238, interested: 519, invited: 140 },
      agenda: [
        {
          time: "20:00",
          title: t("pages.eventsPage.event4Agenda1Title"),
          description: t("pages.eventsPage.event4Agenda1Description"),
        },
        {
          time: "20:25",
          title: t("pages.eventsPage.event4Agenda2Title"),
          description: t("pages.eventsPage.event4Agenda2Description"),
        },
        {
          time: "21:00",
          title: t("pages.eventsPage.event4Agenda3Title"),
          description: t("pages.eventsPage.event4Agenda3Description"),
        },
      ],
      attendees: [
        { id: 11, name: "Ngọc Lê", role: t("pages.eventsPage.attendeeTrainer"), initials: "NL", gradient: "linear-gradient(135deg,#2563eb,#10b981)", status: "going" },
        { id: 12, name: "Xu Nguyễn", role: t("pages.eventsPage.attendeeModerator"), initials: "XN", gradient: "linear-gradient(135deg,#10b981,#f59e0b)", status: "going" },
        { id: 13, name: "Trang Đỗ", role: t("pages.eventsPage.attendeeTeacher"), initials: "TD", gradient: "linear-gradient(135deg,#0000ff,#10b981)", status: "interested" },
      ],
    },
    {
      id: "local-volunteer-day",
      title: t("pages.eventsPage.event5Title"),
      category: "community",
      categoryLabel: t("pages.eventsPage.categoryCommunity"),
      host: "Green Neighborhood",
      hostRole: t("pages.eventsPage.roleLocalGroup"),
      hostInitials: "GN",
      hostGradient: "linear-gradient(135deg,#16a34a 0%,#0ea5e9 100%)",
      location: t("pages.eventsPage.event5Location"),
      city: "ho-chi-minh",
      startsAt: "2026-06-20T07:00",
      endsAt: "2026-06-20T11:30",
      dateLabel: t("pages.eventsPage.event5DateLabel"),
      timeLabel: "07:00 - 11:30",
      month: t("pages.eventsPage.month6"),
      day: "20",
      cover: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1600&q=80",
      coverFallback: "linear-gradient(135deg,#16a34a 0%,#0ea5e9 100%)",
      description: t("pages.eventsPage.event5Description"),
      summary: t("pages.eventsPage.event5Summary"),
      tags: ["Volunteer", "Green", "Local"],
      tabKeys: ["upcoming"],
      userState: "none",
      isOwner: false,
      capacity: 120,
      stats: { going: 74, interested: 205, invited: 12 },
      agenda: [
        {
          time: "07:00",
          title: t("pages.eventsPage.event5Agenda1Title"),
          description: t("pages.eventsPage.event5Agenda1Description"),
        },
        {
          time: "08:00",
          title: t("pages.eventsPage.event5Agenda2Title"),
          description: t("pages.eventsPage.event5Agenda2Description"),
        },
        {
          time: "10:45",
          title: t("pages.eventsPage.event5Agenda3Title"),
          description: t("pages.eventsPage.event5Agenda3Description"),
        },
      ],
      attendees: [
        { id: 14, name: "Thanh Hà", role: t("pages.eventsPage.attendeeVolunteer"), initials: "TH", gradient: "linear-gradient(135deg,#16a34a,#0ea5e9)", status: "going" },
        { id: 15, name: "Bình An", role: t("pages.eventsPage.attendeeStudent"), initials: "BA", gradient: "linear-gradient(135deg,#0ea5e9,#f59e0b)", status: "interested" },
        { id: 16, name: "Uyên Phạm", role: t("pages.eventsPage.attendeeOrganizer"), initials: "UP", gradient: "linear-gradient(135deg,#0000ff,#16a34a)", status: "going" },
      ],
    },
    {
      id: "community-retrospective-2025",
      title: t("pages.eventsPage.event6Title"),
      category: "community",
      categoryLabel: t("pages.eventsPage.categoryCommunity"),
      host: "VNSEEA Community",
      hostRole: t("pages.eventsPage.roleOrganizer"),
      hostInitials: "VC",
      hostGradient: "linear-gradient(135deg,#111827 0%,#0000ff 100%)",
      location: t("pages.eventsPage.event6Location"),
      city: "ho-chi-minh",
      startsAt: "2025-12-18T18:00",
      endsAt: "2025-12-18T21:00",
      dateLabel: t("pages.eventsPage.event6DateLabel"),
      timeLabel: "18:00 - 21:00",
      month: t("pages.eventsPage.month12"),
      day: "18",
      cover: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=80",
      coverFallback: "linear-gradient(135deg,#111827 0%,#0000ff 100%)",
      description: t("pages.eventsPage.event6Description"),
      summary: t("pages.eventsPage.event6Summary"),
      tags: ["Review", "Community", "Planning"],
      tabKeys: ["past", "my"],
      userState: "going",
      isOwner: true,
      capacity: 240,
      stats: { going: 201, interested: 490, invited: 80 },
      agenda: [
        {
          time: "18:00",
          title: t("pages.eventsPage.event6Agenda1Title"),
          description: t("pages.eventsPage.event6Agenda1Description"),
        },
        {
          time: "19:15",
          title: t("pages.eventsPage.event6Agenda2Title"),
          description: t("pages.eventsPage.event6Agenda2Description"),
        },
        {
          time: "20:15",
          title: t("pages.eventsPage.event6Agenda3Title"),
          description: t("pages.eventsPage.event6Agenda3Description"),
        },
      ],
      attendees: [
        { id: 17, name: "Khánh Vũ", role: t("pages.eventsPage.attendeeSpeaker"), initials: "KV", gradient: "linear-gradient(135deg,#111827,#0000ff)", status: "going" },
        { id: 18, name: "Phương Linh", role: t("pages.eventsPage.attendeeMember"), initials: "PL", gradient: "linear-gradient(135deg,#0000ff,#f59e0b)", status: "going" },
        { id: 19, name: "Hải Đăng", role: t("pages.eventsPage.attendeeOps"), initials: "HD", gradient: "linear-gradient(135deg,#0f766e,#111827)", status: "going" },
      ],
    },
  ]

  return {
    events,
    eventTabs,
    eventCategories,
    eventCities,
    findEventById: (id: string) => events.find((event) => event.id === id),
  }
}
