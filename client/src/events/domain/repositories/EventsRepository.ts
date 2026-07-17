// English description: Repository contract for backend-backed event catalog, detail, attendee, creation, RSVP, and event-post operations.

import type {
  EventAttendeeKind,
  EventAttendeeRecord,
  EventCreateDraft,
  EventInviteCandidate,
  EventInviteResult,
  EventPostsRecord,
  EventRecord,
  EventsCatalogRecord,
  EventRsvpResult,
} from "../types/events.types"

export interface EventsRepository {
  getCatalog(): Promise<EventsCatalogRecord>
  getEventById(id: string | number): Promise<EventRecord | null>
  getPosts(id: string | number, input?: { limit?: number; afterPostId?: number }): Promise<EventPostsRecord>
  getAttendees(id: string | number, kind: EventAttendeeKind): Promise<EventAttendeeRecord[]>
  searchInviteCandidates(id: string | number, query: string): Promise<EventInviteCandidate[]>
  inviteUser(id: string | number, userId: string | number): Promise<EventInviteResult>
  createEvent(input: EventCreateDraft): Promise<EventRecord>
  updateEvent(id: string | number, input: EventCreateDraft): Promise<EventRecord>
  deleteEvent(id: string | number): Promise<void>
  setGoing(id: string | number): Promise<EventRsvpResult>
  setInterested(id: string | number): Promise<EventRsvpResult>
}
