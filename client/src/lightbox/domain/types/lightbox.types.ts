export interface LightboxItem {
  type: "image" | "video"
  src: string
  alt?: string
  mime?: string
}
