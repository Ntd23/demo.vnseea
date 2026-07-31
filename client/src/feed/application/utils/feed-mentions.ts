// English description: Centralizes feed mention parsing and rendering helpers for publisher and post surfaces.

import type { FeedPostMention } from "../../domain/types/feed.types"

export type FeedMentionSegment = {
  key: string
  text: string
  isMention: boolean
  mentionUsername?: string
  isHashtag: boolean
  hashtag: string
}

const feedInlineMentionPattern = "@[\\p{L}\\p{N}_][\\p{L}\\p{N}_.-]*"
const feedHashtagPattern = "#[\\p{L}\\p{N}_][\\p{L}\\p{N}_-]*"

export function normalizeFeedMentionSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

export function escapeMentionRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function createMentionSegments(
  text: string,
  knownMentionLabels: Set<string> | Record<string, string> = {},
  options: { highlightUnknownMentions?: boolean } = {},
) {
  const labelSet = knownMentionLabels instanceof Set
    ? knownMentionLabels
    : new Set(Object.keys(knownMentionLabels).map(label => label.toLowerCase()))
  const highlightUnknownMentions = options.highlightUnknownMentions ?? true
  const knownLabelPattern = [...labelSet]
    .sort((left, right) => right.length - left.length)
    .map(escapeMentionRegExp)
    .join("|")
  const tokenPattern = new RegExp(
    [
      knownLabelPattern
        ? `(?:${knownLabelPattern})(?=$|[\\s\\p{P}\\p{S}])`
        : "",
      feedInlineMentionPattern,
      feedHashtagPattern,
    ].filter(Boolean).join("|"),
    "giu",
  )
  const rawSegments: string[] = []
  let cursor = 0

  for (const match of text.matchAll(tokenPattern)) {
    const index = match.index ?? 0
    const token = match[0] ?? ""

    if (index > cursor) {
      rawSegments.push(text.slice(cursor, index))
    }
    if (token) {
      rawSegments.push(token)
    }
    cursor = index + token.length
  }

  if (cursor < text.length) {
    rawSegments.push(text.slice(cursor))
  }

  return rawSegments
    .filter(segment => segment.length > 0)
    .map<FeedMentionSegment>((segment, index) => {
      const isHashtag = segment.startsWith("#")

      return {
        key: `${index}:${segment}`,
        text: segment,
        isMention: segment.startsWith("@")
          && (labelSet.has(segment.toLowerCase()) || (labelSet.size === 0 && highlightUnknownMentions)),
        isHashtag,
        hashtag: isHashtag ? segment.slice(1) : "",
      }
    })
}

export function getFeedMentionDisplayName(mention: FeedPostMention) {
  return mention.displayName || mention.name.trim() || mention.username
}

export function createFeedMentionLabelSet(mentions: FeedPostMention[] = []) {
  const labels = new Set<string>()

  for (const mention of mentions) {
    const displayName = getFeedMentionDisplayName(mention)
    const rawLabels = [
      displayName,
      mention.username,
      mention.name,
    ]

    for (const label of rawLabels) {
      const normalized = label?.replace(/^@/, "").trim()

      if (normalized) {
        labels.add(`@${normalized}`.toLowerCase())
      }
    }
  }

  return labels
}

export function normalizePostTextMentions(text: string, mentions: FeedPostMention[] = []) {
  return mentions.reduce((nextText, mention) => {
    const displayName = getFeedMentionDisplayName(mention)
    const replacements = [
      mention.name,
      mention.username,
    ]

    return replacements.reduce((currentText, label) => {
      const normalized = label.replace(/^@/, "").trim()

      if (!normalized || normalized === displayName) {
        return currentText
      }

      return currentText.replace(
        new RegExp(`(^|\\s)@${escapeMentionRegExp(normalized)}(?=$|[\\s\\p{P}\\p{S}])`, "gu"),
        `$1@${displayName}`,
      )
    }, nextText)
  }, text)
}

export function createPostTextMentionSegments(text: string, mentions: FeedPostMention[] = []) {
  const usernameByLabel = new Map<string, string>()

  for (const mention of mentions) {
    for (const label of [getFeedMentionDisplayName(mention), mention.name, mention.username]) {
      const normalized = label?.replace(/^@/, "").trim()

      if (normalized) {
        usernameByLabel.set(`@${normalized}`.toLowerCase(), mention.username.replace(/^@/, ""))
      }
    }
  }

  return createMentionSegments(
    normalizePostTextMentions(text, mentions),
    createFeedMentionLabelSet(mentions),
  ).map(segment => ({
    ...segment,
    mentionUsername: segment.isMention
      ? usernameByLabel.get(segment.text.toLowerCase())
      : undefined,
  }))
}
