// Description: Normalizes message text, inline reply metadata, and display snippets for shared chat bubble surfaces.

import type { MessageItem, MessageProductCard } from "../../domain/types/messages.types"

export const MESSAGE_REPLY_PREFIX = "__VNSEEA_MINI_REPLY__:"
export const MESSAGE_PRODUCT_PREFIX = "__VNSEEA_PRODUCT__:"

export type MessageReplyMeta = {
  author: string
  quote: string
  mediaUrl: string
  mediaType: MessageItem["mediaType"] | ""
  body: string
}

export type MessageProductMeta = {
  card: MessageProductCard
  body: string
}

function normalizeSafeUrl(value: unknown) {
  const url = typeof value === "string" ? value.trim() : ""

  return url.startsWith("/") || /^https?:\/\//i.test(url) ? url : ""
}

function normalizeProductPrice(value: unknown) {
  return normalizeMessageText(typeof value === "string" ? value : "")
    .replace(/\s*(?:vnd|vnđ|₫)$/iu, "VND")
}

export function normalizeMessageText(value = "") {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&nbsp;/gi, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

export function getMessageReplyMeta(message: Pick<MessageItem, "text">): MessageReplyMeta | null {
  const normalizedText = normalizeMessageText(message.text)
  const [replyLine, ...bodyLines] = normalizedText.split("\n")

  if (replyLine?.startsWith(MESSAGE_REPLY_PREFIX)) {
    try {
      const payload = JSON.parse(decodeURIComponent(replyLine.slice(MESSAGE_REPLY_PREFIX.length))) as {
        author?: string
        quote?: string
        mediaUrl?: string
        mediaType?: MessageItem["mediaType"]
      }

      return {
        author: normalizeMessageText(payload.author || ""),
        quote: normalizeMessageText(payload.quote || ""),
        mediaUrl: payload.mediaUrl || "",
        mediaType: payload.mediaType || "",
        body: normalizeMessageText(bodyLines.join("\n")),
      }
    }
    catch {
      return null
    }
  }

  if (!replyLine?.startsWith("\u21AA ")) {
    return null
  }

  const rawReply = replyLine.slice(2).trim()
  const separatorIndex = rawReply.indexOf(": ")
  const author = separatorIndex > 0 ? rawReply.slice(0, separatorIndex) : ""
  const quote = separatorIndex > 0 ? rawReply.slice(separatorIndex + 2) : rawReply

  return {
    author: normalizeMessageText(author),
    quote: normalizeMessageText(quote),
    mediaUrl: "",
    mediaType: "",
    body: normalizeMessageText(bodyLines.join("\n")),
  }
}

export function getMessageProductMeta(message: Pick<MessageItem, "text">): MessageProductMeta | null {
  const normalizedText = normalizeMessageText(message.text)
  const [productLine, ...bodyLines] = normalizedText.split("\n")

  if (!productLine?.startsWith(MESSAGE_PRODUCT_PREFIX)) {
    return null
  }

  try {
    const payload = JSON.parse(decodeURIComponent(productLine.slice(MESSAGE_PRODUCT_PREFIX.length))) as Partial<MessageProductCard>
    const title = normalizeMessageText(payload.title || "")
    const href = normalizeSafeUrl(payload.href)

    if (!title || !href) {
      return null
    }

    return {
      card: {
        id: String(payload.id || ""),
        title,
        imageUrl: normalizeSafeUrl(payload.imageUrl) || undefined,
        price: normalizeProductPrice(payload.price),
        href,
      },
      body: normalizeMessageText(bodyLines.join("\n")),
    }
  }
  catch {
    return null
  }
}

export function getMessageDisplayText(
  message: MessageItem,
  options?: {
    selfDeletedLabel?: string
    otherDeletedLabel?: string
  },
) {
  if (message.isDeleted) {
    return message.isMine
      ? options?.selfDeletedLabel || ""
      : options?.otherDeletedLabel || ""
  }

  const replyMeta = getMessageReplyMeta(message)
  if (replyMeta) {
    return replyMeta.body
  }

  const productMeta = getMessageProductMeta(message)

  if (productMeta) {
    return productMeta.body
  }

  return normalizeMessageText(message.text)
}

export function buildProductMessageText(input: {
  text: string
  product: MessageProductCard
}) {
  const payload = encodeURIComponent(JSON.stringify({
    id: String(input.product.id || ""),
    title: normalizeMessageText(input.product.title),
    imageUrl: normalizeSafeUrl(input.product.imageUrl),
    price: normalizeProductPrice(input.product.price),
    href: normalizeSafeUrl(input.product.href),
  }))

  return `${MESSAGE_PRODUCT_PREFIX}${payload}\n${normalizeMessageText(input.text)}`
}

export function buildReplyMessageText(input: {
  text: string
  target?: MessageItem | null
  author: string
  fallbackLabel: string
}) {
  if (!input.target) {
    return normalizeMessageText(input.text)
  }

  const isImageReply = Boolean(
    input.target.mediaUrl
    && (input.target.mediaType === "image" || input.target.mediaType === "gif"),
  )
  const source = normalizeMessageText(
    isImageReply
      ? input.fallbackLabel
      : getMessageDisplayText(input.target) || input.target.mediaName || input.fallbackLabel,
  )
  const snippet = source.length > 72 ? `${source.slice(0, 72)}...` : source
  const payload = encodeURIComponent(JSON.stringify({
    author: input.author || input.fallbackLabel,
    quote: snippet,
    mediaUrl: isImageReply ? input.target.mediaUrl : "",
    mediaType: isImageReply ? input.target.mediaType : "",
  }))

  return `${MESSAGE_REPLY_PREFIX}${payload}\n${normalizeMessageText(input.text)}`
}

export function formatMessageClock(seconds?: number) {
  if (!seconds) {
    return ""
  }

  return new Date(seconds * 1000).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })
}
