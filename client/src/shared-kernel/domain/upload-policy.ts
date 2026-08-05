// English description: Defines the backend-managed upload policy shared by frontend upload flows.

export type UploadPolicy = {
  maxFileSizeBytes: number
  maxFileSizeLabel: string
  allowedExtensions: string[]
  allowedMimeTypes: string[]
}

export const createEmptyUploadPolicy = (): UploadPolicy => ({
  maxFileSizeBytes: 0,
  maxFileSizeLabel: "",
  allowedExtensions: [],
  allowedMimeTypes: [],
})
