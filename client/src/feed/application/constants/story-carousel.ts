// English description: Centralizes story carousel UI behavior constants used by the feed presentation layer.

import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"

export const feedStoryCreatePath = appRoutes.statusCreate

export const feedStoryCreateRedirectDelay = 500

export const feedStoryTitleMaxLength = 100

export const feedStoryCaptionMaxLength = 300

export const feedStoryViewerFallbackGradient = "linear-gradient(135deg, var(--bg-media) 0%, var(--bg-brand-hover) 58%, var(--color-accent-500) 100%)"

export const feedStoryCarouselScrollDistance = 220

export const feedStoryPointerTapTolerance = 10

export const feedStorySwipeMinDistance = 50

export const feedStoryViewerSideTapDivisor = 3

export const feedStoryReactionLongPressDelay = 420

export const feedStoryKeyboardKeys = {
  close: "Escape",
  previous: "ArrowLeft",
  next: "ArrowRight",
} as const
