// English description: Captures a bounded, aspect-preserving JPEG frame from a browser-selected Feed video.

const FEED_VIDEO_THUMBNAIL_MAX_DIMENSION = 1280
const FEED_VIDEO_THUMBNAIL_CAPTURE_SECOND = 1
const FEED_VIDEO_THUMBNAIL_EVENT_TIMEOUT_MS = 10000

type VideoReadyEvent = "loadedmetadata" | "loadeddata" | "seeked"

function waitForVideoEvent(video: HTMLVideoElement, eventName: VideoReadyEvent) {
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup()
      reject(new Error("Timed out while reading the selected video."))
    }, FEED_VIDEO_THUMBNAIL_EVENT_TIMEOUT_MS)

    const cleanup = () => {
      window.clearTimeout(timeout)
      video.removeEventListener(eventName, handleSuccess)
      video.removeEventListener("error", handleError)
    }
    const handleSuccess = () => {
      cleanup()
      resolve()
    }
    const handleError = () => {
      cleanup()
      reject(new Error("Unable to read the selected video."))
    }

    video.addEventListener(eventName, handleSuccess, { once: true })
    video.addEventListener("error", handleError, { once: true })
  })
}

export async function createFeedVideoThumbnailFile(file: File) {
  const videoUrl = URL.createObjectURL(file)
  const video = document.createElement("video")

  try {
    video.muted = true
    video.playsInline = true
    video.preload = "auto"

    const metadataReady = waitForVideoEvent(video, "loadedmetadata")
    video.src = videoUrl
    video.load()
    await metadataReady

    const duration = Number.isFinite(video.duration) ? video.duration : 0
    const captureTime = duration > 0
      ? Math.min(FEED_VIDEO_THUMBNAIL_CAPTURE_SECOND, Math.max(0, duration - 0.05))
      : 0

    if (captureTime > 0) {
      const frameReady = waitForVideoEvent(video, "seeked")
      video.currentTime = captureTime
      await frameReady
    }
    else if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      await waitForVideoEvent(video, "loadeddata")
    }

    if (!video.videoWidth || !video.videoHeight) {
      throw new Error("The selected video has no readable frame.")
    }

    const scale = Math.min(
      1,
      FEED_VIDEO_THUMBNAIL_MAX_DIMENSION / Math.max(video.videoWidth, video.videoHeight),
    )
    const canvas = document.createElement("canvas")
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale))
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale))

    const context = canvas.getContext("2d")
    if (!context) {
      throw new Error("Unable to create the video thumbnail canvas.")
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, "image/jpeg", 0.86),
    )
    if (!blob) {
      throw new Error("Unable to encode the video thumbnail.")
    }

    const baseName = file.name.replace(/\.[^.]+$/, "") || "feed-video"
    return new File([blob], `${baseName}-thumbnail.jpg`, { type: "image/jpeg" })
  }
  finally {
    video.pause()
    video.removeAttribute("src")
    video.load()
    URL.revokeObjectURL(videoUrl)
  }
}
