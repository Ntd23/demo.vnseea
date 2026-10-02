// Description: v-hls-src plays Bunny Stream HLS playlists in every browser: Safari natively, the others through hls.js loaded on demand.
import type Hls from "hls.js"
import type { Directive } from "vue"

const HLS_URL_PATTERN = /\.m3u8(?:$|[?#])/i

export function isHlsUrl(url?: string | null): url is string {
  return typeof url === "string" && HLS_URL_PATTERN.test(url)
}

interface HlsVideoState {
  src: string
  token: number
  player: Hls | null
  startOnPlay?: () => void
}

const states = new WeakMap<HTMLVideoElement, HlsVideoState>()

function detach(video: HTMLVideoElement, state: HlsVideoState) {
  state.token += 1
  state.player?.destroy()
  state.player = null
  if (state.startOnPlay) {
    video.removeEventListener("play", state.startOnPlay)
    state.startOnPlay = undefined
  }
}

async function attach(video: HTMLVideoElement, value: string | null | undefined) {
  const state = states.get(video) ?? { src: "", token: 0, player: null }
  states.set(video, state)
  const src = isHlsUrl(value) ? value : ""
  if (src === state.src) return

  detach(video, state)
  state.src = src
  if (!src) return

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = src
    return
  }

  const token = state.token
  const { default: HlsPlayer } = await import("hls.js")
  if (token !== state.token) return

  if (!HlsPlayer.isSupported()) {
    video.src = src
    return
  }

  // Videos that wait for a tap only download segments once they play, so a
  // page listing many videos does not fetch all of them.
  const loadAtOnce = video.autoplay || video.preload === "auto"
  const player = new HlsPlayer({ autoStartLoad: loadAtOnce })
  if (!loadAtOnce) {
    state.startOnPlay = () => player.startLoad()
    video.addEventListener("play", state.startOnPlay, { once: true })
  }
  player.loadSource(src)
  player.attachMedia(video)
  state.player = player
}

/**
 * Bind next to `:src="isHlsUrl(url) ? undefined : url"`: the browser keeps
 * playing regular files itself while this directive handles HLS playlists.
 */
export const vHlsSrc: Directive<HTMLVideoElement, string | null | undefined> = {
  mounted(video, binding) {
    void attach(video, binding.value)
  },
  updated(video, binding) {
    if (binding.value !== binding.oldValue) void attach(video, binding.value)
  },
  beforeUnmount(video) {
    const state = states.get(video)
    if (!state) return
    detach(video, state)
    states.delete(video)
  },
}
