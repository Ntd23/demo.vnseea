// English description: Owns the backend-backed live studio flow for /live, including bootstrap, host create/end mutations, and heartbeat-driven activity updates.

import { useIntervalFn } from "@vueuse/core"
import { createApiLiveRepository } from "../../infrastructure/repositories/ApiLiveRepository"
import type { LiveRepository } from "../../domain/repositories/LiveRepository"
import type {
  GoLiveDraft,
  LiveStudioBootstrap,
  LiveStudioComment,
  LiveStudioSession,
  LiveStudioState,
} from "../../domain/types/live.types"

const EMPTY_BOOTSTRAP: LiveStudioBootstrap = {
  enabled: false,
  canUseLive: false,
  blockedReason: "",
  host: null,
  streamName: "",
  roomName: "",
  wsUrl: "",
  token: "",
  destination: "timeline",
  currentPrivacy: "0",
  destinationOptions: [],
  privacyOptions: [],
}

const toErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message
    ? error.message
    : fallback

const isAuthError = (error: unknown) =>
  typeof error === "object"
  && error !== null
  && "statusCode" in error
  && Number((error as { statusCode?: unknown }).statusCode) === 401

const activityKey = (item: LiveStudioComment) =>
  item.id > 0
    ? `${item.kind}:${item.id}`
    : `${item.kind}:${item.username}:${item.message}:${item.timeText}`

export function useLiveStudioPageVM(
  repository: LiveRepository = createApiLiveRepository(),
) {
  const router = useRouter()

  const title = ref("")
  const description = ref("")
  const privacy = ref("0")
  const thumbnailFile = ref<File | null>(null)

  const session = ref<LiveStudioSession | null>(null)
  const liveState = ref<LiveStudioState>("offline")
  const viewerCount = ref(0)
  const reactionsCount = ref(0)
  const sharesCount = ref(0)
  const clipsCount = ref(0)
  const heartbeatAge = ref(0)
  const activityItems = ref<LiveStudioComment[]>([])
  const starting = ref(false)
  const ending = ref(false)
  const heartbeatLoading = ref(false)
  const uploadLoading = ref(false)
  const statusMessage = ref("")
  const errorMessage = ref("")
  const knownCommentIds = ref<number[]>([])

  const { data, status, error, refresh } = useAsyncData(
    "live:studio-bootstrap",
    () => repository.getBootstrap(),
    {
      default: () => EMPTY_BOOTSTRAP,
    },
  )

  const bootstrap = computed(() => data.value ?? EMPTY_BOOTSTRAP)
  const bootstrapLoading = computed(() => status.value === "pending")
  const bootstrapErrorMessage = computed(() =>
    error.value ? toErrorMessage(error.value, "Không thể tải studio phát trực tiếp.") : "",
  )

  const blockedReasonMessage = computed(() => {
    switch (bootstrap.value.blockedReason) {
      case "live_video_disabled":
        return "Tính năng phát trực tiếp đang tắt trong cấu hình hệ thống."
      case "live_permission_disabled":
        return "Tài khoản hiện tại chưa được cấp quyền phát trực tiếp."
      case "livekit_not_ready":
        return "LiveKit backend chưa sẵn sàng."
      case "live_already_running":
        return "Bạn đang có một buổi phát trực tiếp khác đang hoạt động."
      case "bootstrap_failed":
        return "Không thể cấp thông tin host studio từ backend."
      default:
        return ""
    }
  })

  const canInteract = computed(() =>
    bootstrap.value.enabled
    && bootstrap.value.canUseLive
    && !starting.value
    && !ending.value,
  )

  const canStart = computed(() =>
    canInteract.value
    && !session.value
    && Boolean(bootstrap.value.streamName)
    && Boolean(bootstrap.value.wsUrl)
    && Boolean(bootstrap.value.token),
  )

  const recentCommentCount = computed(() =>
    activityItems.value.filter(item => item.kind === "comment").length,
  )

  const livePostUrl = computed(() => session.value?.postUrl ?? "")
  const currentTitle = computed(() => session.value?.title || title.value.trim())
  const currentDescription = computed(() => session.value?.description || description.value.trim())
  const isLive = computed(() => Boolean(session.value) && liveState.value !== "offline")

  const { pause: pauseHeartbeat, resume: resumeHeartbeat } = useIntervalFn(
    async () => {
      if (!session.value || heartbeatLoading.value) {
        return
      }

      heartbeatLoading.value = true

      try {
        const heartbeat = await repository.getHeartbeat(
          session.value.postId,
          knownCommentIds.value,
        )

        liveState.value = heartbeat.stillLive
        viewerCount.value = heartbeat.viewerCount
        reactionsCount.value = heartbeat.reactionsCount
        sharesCount.value = heartbeat.sharesCount
        clipsCount.value = heartbeat.clipsCount
        heartbeatAge.value = heartbeat.heartbeatAge

        const nextItems = [
          ...heartbeat.comments,
          ...heartbeat.joinedUsers,
          ...heartbeat.leftUsers,
        ]

        if (nextItems.length > 0) {
          const existingKeys = new Set(activityItems.value.map(activityKey))
          const freshItems = nextItems.filter((item) => {
            const key = activityKey(item)

            if (existingKeys.has(key)) {
              return false
            }

            existingKeys.add(key)
            return true
          })

          if (freshItems.length > 0) {
            activityItems.value = [...activityItems.value, ...freshItems].slice(-24)
          }
        }

        const nextCommentIds = new Set(knownCommentIds.value)

        heartbeat.comments.forEach((item) => {
          if (item.id > 0) {
            nextCommentIds.add(item.id)
          }
        })

        knownCommentIds.value = Array.from(nextCommentIds).slice(-48)

        if (heartbeat.stillLive === "offline") {
          pauseHeartbeat()
          statusMessage.value = "Buổi phát trực tiếp đã kết thúc trên backend."
        }
      }
      catch (heartbeatError) {
        if (isAuthError(heartbeatError)) {
          await router.push("/welcome")
          return
        }

        statusMessage.value = toErrorMessage(
          heartbeatError,
          "Không thể đồng bộ hoạt động livestream.",
        )
      }
      finally {
        heartbeatLoading.value = false
      }
    },
    4000,
    { immediate: false },
  )

  pauseHeartbeat()

  watch(
    bootstrap,
    (value) => {
      if (!privacy.value) {
        privacy.value = value.currentPrivacy || "0"
      }
      else if (!session.value && value.currentPrivacy && privacy.value === "0") {
        privacy.value = value.currentPrivacy
      }
    },
    { immediate: true },
  )

  watch(
    error,
    async (nextError) => {
      if (nextError && isAuthError(nextError)) {
        await router.push("/welcome")
      }
    },
  )

  function setThumbnail(nextFile: File | null) {
    thumbnailFile.value = nextFile
  }

  async function startLive(connectToRoom: (session: LiveStudioSession) => Promise<void>) {
    if (!canStart.value) {
      return null
    }

    starting.value = true
    errorMessage.value = ""
    statusMessage.value = "Đang khởi tạo phòng phát trực tiếp..."

    const draft: GoLiveDraft = {
      title: title.value.trim(),
      description: description.value.trim(),
      privacy: privacy.value || bootstrap.value.currentPrivacy || "0",
      streamName: bootstrap.value.streamName,
      thumbnailFile: thumbnailFile.value,
    }

    try {
      const createdSession = await repository.createSession(draft)

      try {
        await connectToRoom(createdSession)
      }
      catch (connectError) {
        try {
          await repository.endSession(createdSession.postId)
        }
        catch {
        }

        throw connectError
      }

      session.value = createdSession
      liveState.value = "live"
      knownCommentIds.value = []
      activityItems.value = []
      viewerCount.value = 0
      reactionsCount.value = 0
      sharesCount.value = 0
      clipsCount.value = 0
      heartbeatAge.value = 0

      if (thumbnailFile.value) {
        uploadLoading.value = true

        try {
          await repository.uploadThumbnail(createdSession.postId, thumbnailFile.value)
        }
        catch (thumbnailError) {
          statusMessage.value = toErrorMessage(
            thumbnailError,
            "Livestream đã được tạo nhưng chưa tải được thumbnail.",
          )
        }
        finally {
          uploadLoading.value = false
        }
      }

      statusMessage.value = "Đang phát trực tiếp."
      await refreshHeartbeatNow()
      resumeHeartbeat()
      return createdSession
    }
    catch (startError) {
      if (isAuthError(startError)) {
        await router.push("/welcome")
        return null
      }

      errorMessage.value = toErrorMessage(
        startError,
        "Không thể bắt đầu phát trực tiếp.",
      )
      statusMessage.value = ""
      session.value = null
      liveState.value = "offline"
      pauseHeartbeat()
      return null
    }
    finally {
      starting.value = false
    }
  }

  async function refreshHeartbeatNow() {
    if (!session.value) {
      return
    }

    heartbeatLoading.value = false
    await repository.getHeartbeat(session.value.postId, knownCommentIds.value).then((heartbeat) => {
      liveState.value = heartbeat.stillLive
      viewerCount.value = heartbeat.viewerCount
      reactionsCount.value = heartbeat.reactionsCount
      sharesCount.value = heartbeat.sharesCount
      clipsCount.value = heartbeat.clipsCount
      heartbeatAge.value = heartbeat.heartbeatAge

      activityItems.value = [
        ...heartbeat.comments,
        ...heartbeat.joinedUsers,
        ...heartbeat.leftUsers,
      ].slice(-24)

      knownCommentIds.value = heartbeat.comments
        .map(item => item.id)
        .filter(id => id > 0)
        .slice(-48)
    }).catch(async (heartbeatError) => {
      if (isAuthError(heartbeatError)) {
        await router.push("/welcome")
        return
      }

      statusMessage.value = toErrorMessage(
        heartbeatError,
        "Không thể lấy hoạt động livestream.",
      )
    })
  }

  async function endLive(disconnectFromRoom: () => void) {
    if (!session.value || ending.value) {
      return
    }

    ending.value = true
    errorMessage.value = ""

    try {
      const result = await repository.endSession(session.value.postId)

      disconnectFromRoom()
      pauseHeartbeat()
      session.value = null
      liveState.value = "offline"
      knownCommentIds.value = []
      viewerCount.value = 0
      reactionsCount.value = 0
      sharesCount.value = 0
      clipsCount.value = 0
      heartbeatAge.value = 0
      activityItems.value = []
      statusMessage.value = result.message
      await refresh()
    }
    catch (endError) {
      if (isAuthError(endError)) {
        await router.push("/welcome")
        return
      }

      errorMessage.value = toErrorMessage(
        endError,
        "Không thể kết thúc livestream.",
      )
    }
    finally {
      ending.value = false
    }
  }

  async function uploadThumbnailNow() {
    if (!session.value || !thumbnailFile.value || uploadLoading.value) {
      return
    }

    uploadLoading.value = true
    errorMessage.value = ""

    try {
      const result = await repository.uploadThumbnail(session.value.postId, thumbnailFile.value)
      statusMessage.value = result.message
    }
    catch (uploadError) {
      if (isAuthError(uploadError)) {
        await router.push("/welcome")
        return
      }

      errorMessage.value = toErrorMessage(
        uploadError,
        "Không thể cập nhật thumbnail livestream.",
      )
    }
    finally {
      uploadLoading.value = false
    }
  }

  return {
    bootstrap,
    bootstrapLoading,
    bootstrapErrorMessage,
    blockedReasonMessage,
    title,
    description,
    privacy,
    thumbnailFile,
    session,
    liveState,
    viewerCount,
    reactionsCount,
    sharesCount,
    clipsCount,
    heartbeatAge,
    activityItems,
    recentCommentCount,
    livePostUrl,
    currentTitle,
    currentDescription,
    isLive,
    canInteract,
    canStart,
    starting,
    ending,
    heartbeatLoading,
    uploadLoading,
    statusMessage,
    errorMessage,
    setThumbnail,
    startLive,
    refreshHeartbeatNow,
    endLive,
    uploadThumbnailNow,
    refreshBootstrap: refresh,
  }
}
