// English description: Manages client-only LiveKit viewer room connection and remote video attachment for feed live posts.

import type { RemoteTrack, RemoteTrackPublication, RemoteParticipant, Room } from "livekit-client"
import type { LiveViewerSession } from "../../domain/types/live.types"

type LiveKitModule = typeof import("livekit-client")

export function useLiveKitViewer() {
  const { t } = useI18n()
  const stageHost = ref<HTMLElement | null>(null)
  const connecting = ref(false)
  const connected = ref(false)
  const errorMessage = ref("")
  const videoOrientation = ref<"unknown" | "portrait" | "landscape">("unknown")
  const audioPlaybackBlocked = ref(false)

  let liveKitModule: LiveKitModule | null = null
  let room: Room | null = null
  let activeConnection: Promise<void> | null = null
  let connectionGeneration = 0
  let audioEnabledByUser = false

  async function ensureModule() {
    if (liveKitModule) return liveKitModule
    liveKitModule = await import("livekit-client")
    return liveKitModule
  }

  function clearStage() {
    stageHost.value?.querySelectorAll("video, audio").forEach(element => element.remove())
  }

  function clearTrackElements(kind: "video" | "audio") {
    stageHost.value?.querySelectorAll(kind).forEach(element => element.remove())
  }

  function syncVideoOrientation(element: HTMLVideoElement) {
    if (element.videoWidth <= 0 || element.videoHeight <= 0) {
      return
    }

    videoOrientation.value = element.videoHeight > element.videoWidth
      ? "portrait"
      : "landscape"
  }

  function attachRemoteTrack(track: RemoteTrack) {
    const host = stageHost.value
    if (!host) return

    if (track.kind === "audio") {
      clearTrackElements("audio")
      const element = track.attach() as HTMLAudioElement
      element.autoplay = true
      element.defaultMuted = !audioEnabledByUser
      element.muted = !audioEnabledByUser
      element.volume = 1
      element.hidden = true
      element.className = "feed-live-player__audio"
      host.appendChild(element)
      void element.play()
        .then(() => {
          audioPlaybackBlocked.value = false
        })
        .catch(() => {
          audioPlaybackBlocked.value = audioEnabledByUser
        })
      return
    }

    if (track.kind !== "video") return

    clearTrackElements("video")
    const element = track.attach() as HTMLVideoElement
    element.autoplay = true
    // Feed previews must remain silent until the viewer explicitly taps them.
    // LiveKit publishes microphone audio as a separate audio track.
    element.defaultMuted = true
    element.muted = true
    element.volume = 1
    element.playsInline = true
    element.className = "feed-live-player__video"
    element.addEventListener("loadedmetadata", () => syncVideoOrientation(element), { once: true })
    element.addEventListener("resize", () => syncVideoOrientation(element))
    host.appendChild(element)
    syncVideoOrientation(element)
    void element.play().catch(() => {
      // A click on the preview retries playback through enableAudio().
    })
  }

  function attachPublishedTracks() {
    room?.remoteParticipants.forEach((participant: RemoteParticipant) => {
      participant.trackPublications.forEach((publication: RemoteTrackPublication) => {
        if (publication.track) attachRemoteTrack(publication.track)
      })
    })
  }

  async function establishConnection(session: LiveViewerSession, generation: number) {
    const module = await ensureModule()
    const previousRoom = room
    room = null

    if (previousRoom) {
      try {
        await previousRoom.disconnect(false)
      }
      catch {
      }
    }

    if (generation !== connectionGeneration) return

    videoOrientation.value = "unknown"
    audioPlaybackBlocked.value = false
    const nextRoom = new module.Room({
      adaptiveStream: true,
      dynacast: true,
    })
    room = nextRoom

    nextRoom.on(module.RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
      if (room === nextRoom) {
        attachRemoteTrack(track)
      }
    })

    nextRoom.on(module.RoomEvent.Disconnected, () => {
      if (room === nextRoom) {
        room = null
        connected.value = false
        clearStage()
      }
    })

    try {
      await nextRoom.connect(session.wsUrl, session.token)

      if (generation !== connectionGeneration || room !== nextRoom) {
        await nextRoom.disconnect(false)
        return
      }

      connected.value = true
      attachPublishedTracks()
    }
    catch (error) {
      if (room === nextRoom) {
        room = null
        connected.value = false
      }

      try {
        await nextRoom.disconnect(false)
      }
      catch {
      }

      throw error
    }
  }

  async function connect(session: LiveViewerSession) {
    if (!import.meta.client || connected.value) return

    if (activeConnection) {
      return await activeConnection
    }

    connecting.value = true
    errorMessage.value = ""
    const generation = ++connectionGeneration
    const connection = establishConnection(session, generation)
    activeConnection = connection

    try {
      await connection
    }
    catch (error) {
      errorMessage.value = error instanceof Error ? error.message : t("pages.livePage.viewer.connectError")
    }
    finally {
      if (activeConnection === connection) {
        activeConnection = null
      }
      connecting.value = false
    }
  }

  function disconnect() {
    connectionGeneration += 1
    const currentRoom = room
    room = null
    connected.value = false
    audioPlaybackBlocked.value = false
    audioEnabledByUser = false
    clearStage()

    if (currentRoom) {
      void currentRoom.disconnect().catch(() => {
      })
    }
  }

  function setStageHost(element: HTMLElement | null) {
    stageHost.value = element
    if (element && connected.value) {
      attachPublishedTracks()
    }
  }

  async function enableAudio() {
    audioEnabledByUser = true
    const activeRoom = room
    if (!activeRoom) return

    try {
      await activeRoom.startAudio()

      const mediaElements = Array.from(
        stageHost.value?.querySelectorAll("audio, video") ?? [],
      ) as HTMLMediaElement[]

      await Promise.all(mediaElements.map((element) => {
        const isAudio = element instanceof HTMLAudioElement
        element.defaultMuted = !isAudio
        element.muted = !isAudio
        element.volume = 1
        return element.play()
      }))
      audioPlaybackBlocked.value = false
    }
    catch {
      audioPlaybackBlocked.value = true
    }
  }

  onBeforeUnmount(() => {
    disconnect()
  })

  return {
    connecting,
    connected,
    errorMessage,
    videoOrientation,
    connect,
    disconnect,
    enableAudio,
    setStageHost,
  }
}
