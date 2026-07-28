// Description: Parses shared-post references from legacy web links, canonical web routes, and native app deep links.

export type MessageSharedPostReference = {
  postId: number
  body: string
}

const sharedPostLinkPattern = /(?:vnseea:\/\/post\/|https?:\/\/[^\s/]+\/post\/|https?:\/\/[^\s/]+\/home(?:\?[^\s#]*)?#feed-post-|\/post\/)(\d+)(?:[?#][^\s]*)?/i

const decodeLegacyLink = (value: string) => {
  try {
    return decodeURIComponent(value.replace(/\+/g, "%20"))
  }
  catch {
    return value
  }
}

const normalizeMessageBody = (value = "") =>
  value
    // The PHP chat backend wraps auto-linked URLs in [a]...[/a] and
    // percent-encodes the complete URL before persisting the message.
    .replace(/\[a\]([\s\S]*?)\[\/a\]/gi, (_match, link: string) => decodeLegacyLink(link))
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

export function parseMessageSharedPostReference(
  value: string,
): MessageSharedPostReference | null {
  const normalized = normalizeMessageBody(value)
  const match = normalized.match(sharedPostLinkPattern)
  const postId = Number(match?.[1] ?? 0)

  if (!match || !Number.isInteger(postId) || postId <= 0) {
    return null
  }

  return {
    postId,
    body: normalizeMessageBody(
      `${normalized.slice(0, match.index)} ${normalized.slice((match.index ?? 0) + match[0].length)}`,
    ),
  }
}
