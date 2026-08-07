// English description: Remembers the feed sound preference while keeping audio on only the active preview video.
let activePreviewVideo: HTMLVideoElement | null = null

export function useFeedVideoSound() {
  const isMuted = useState<boolean>("feed-video-preview-muted", () => true)

  function activateVideo(video: HTMLVideoElement) {
    if (activePreviewVideo && activePreviewVideo !== video) {
      activePreviewVideo.muted = true
      activePreviewVideo.pause()
    }

    activePreviewVideo = video
    video.volume = 1
    video.muted = isMuted.value
  }

  function deactivateVideo(video: HTMLVideoElement) {
    video.muted = true
    video.pause()

    if (activePreviewVideo === video) {
      activePreviewVideo = null
    }
  }

  function toggleSound(video: HTMLVideoElement) {
    isMuted.value = !isMuted.value

    if (isMuted.value) {
      if (activePreviewVideo) activePreviewVideo.muted = true
      video.muted = true
      return
    }

    activateVideo(video)
  }

  return {
    isMuted,
    activateVideo,
    deactivateVideo,
    toggleSound,
  }
}
