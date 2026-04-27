export function parseBlogTags(input: string, limit = 8) {
  return input
    .split(",")
    .map(tag => tag.trim().replace(/^#/, ""))
    .filter(Boolean)
    .slice(0, limit)
}

export function calculateBlogReadMinutes(content: string, wordsPerMinute = 180) {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / wordsPerMinute))
}

export function calculateCreateBlogCompletion(state: {
  title: string
  content: string
  category: string
  tags: string[]
  hasThumbnail: boolean
}) {
  return [
    state.title.trim().length >= 12,
    state.content.trim().length >= 80,
    Boolean(state.category),
    state.tags.length > 0,
    state.hasThumbnail,
  ].filter(Boolean).length
}

export function createBlogPreviewExcerpt(content: string, fallback: string, maxLength = 180) {
  const clean = content.replace(/[#>*-]/g, "").trim()
  if (!clean) return fallback
  return clean.length > maxLength ? `${clean.slice(0, maxLength)}...` : clean
}

export function appendEditorToken(content: string, token: string) {
  return content.trim()
    ? `${content.trim()}\n\n${token}`
    : token
}
