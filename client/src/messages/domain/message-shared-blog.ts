// Description: Serializes and parses blog-card metadata embedded in legacy chat text.

export const MESSAGE_SHARED_BLOG_PREFIX = "__VNSEEA_BLOG__:"

export type MessageSharedBlogPayload = {
  id: number
  title: string
  description: string
  imageUrl: string
  href: string
  author: string
  authorAvatarUrl: string
}

const normalizeText = (value = "") =>
  value
    .replace(/\[a\]([\s\S]*?)\[\/a\]/gi, (_match, link: string) => {
      try {
        return decodeURIComponent(link.replace(/\+/g, "%20"))
      }
      catch {
        return link
      }
    })
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

export const serializeMessageSharedBlog = (
  payload: MessageSharedBlogPayload,
  caption = "",
) => {
  const marker = `${MESSAGE_SHARED_BLOG_PREFIX}${encodeURIComponent(JSON.stringify(payload))}`
  return [marker, caption.trim()].filter(Boolean).join("\n")
}

export const parseMessageSharedBlog = (value: string) => {
  const normalized = normalizeText(value)
  const [marker, ...bodyLines] = normalized.split("\n")

  if (!marker?.startsWith(MESSAGE_SHARED_BLOG_PREFIX)) {
    const legacyMatch = normalized.match(
      /(?:https?:\/\/[^\s/]+)?\/read-blog\/(\d+)(?:_[^\s?#]*)?(?:[?#][^\s]*)?/i,
    )
    const id = Number(legacyMatch?.[1] ?? 0)

    if (!legacyMatch || !Number.isInteger(id) || id <= 0) {
      return null
    }

    return {
      payload: {
        id,
        title: "",
        description: "",
        imageUrl: "",
        href: legacyMatch[0],
        author: "",
        authorAvatarUrl: "",
      } satisfies MessageSharedBlogPayload,
      body: normalizeText(
        `${normalized.slice(0, legacyMatch.index)} ${normalized.slice((legacyMatch.index ?? 0) + legacyMatch[0].length)}`,
      ),
    }
  }

  try {
    const payload = JSON.parse(
      decodeURIComponent(marker.slice(MESSAGE_SHARED_BLOG_PREFIX.length)),
    ) as Partial<MessageSharedBlogPayload>
    const id = Number(payload.id)
    const title = String(payload.title ?? "").trim()

    if (!Number.isInteger(id) || id <= 0 || !title) {
      return null
    }

    return {
      payload: {
        id,
        title,
        description: String(payload.description ?? "").trim(),
        imageUrl: String(payload.imageUrl ?? "").trim(),
        href: String(payload.href ?? "").trim(),
        author: String(payload.author ?? "").trim(),
        authorAvatarUrl: String(payload.authorAvatarUrl ?? "").trim(),
      } satisfies MessageSharedBlogPayload,
      body: normalizeText(bodyLines.join("\n")),
    }
  }
  catch {
    return null
  }
}
