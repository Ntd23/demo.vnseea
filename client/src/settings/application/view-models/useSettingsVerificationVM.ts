// English description: Coordinates phtml-compatible user and shop verification request forms.

import { createApiSettingsRepository } from "../../infrastructure/repositories/ApiSettingsRepository"
import type {
  SettingsVerificationState,
  VerificationProfileType,
} from "../../domain/types/settings.types"

type VerificationFileKey = "passport" | "photo" | "shop_image" | "license"

const fileKeysByType: Record<VerificationProfileType, VerificationFileKey[]> = {
  user: ["passport", "photo"],
  shop: ["passport", "photo", "shop_image", "license"],
}

const supportedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/bmp",
  "image/x-ms-bmp",
  "image/webp",
])
const supportedImageExtensions = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "bmp",
  "webp",
])

const fileExtension = (file: File | null) =>
  file?.name.split(".").pop()?.toLowerCase() ?? ""

const isImageFile = (file: File | null) =>
  Boolean(file && (supportedImageTypes.has(file.type) || supportedImageExtensions.has(fileExtension(file))))

const isLicenseFile = (file: File | null) =>
  Boolean(file && (isImageFile(file) || file.type === "application/pdf" || fileExtension(file) === "pdf"))

const missingFiles = (fileList: Array<File | null>) =>
  fileList.some(file => !file)

const unsupportedImages = (fileList: Array<File | null>) =>
  fileList.some(file => Boolean(file && !isImageFile(file)))

export function useSettingsVerificationVM() {
  const repository = createApiSettingsRepository()
  const { t } = useI18n()
  const toast = useToast()
  const submitting = ref(false)
  const errorMessage = ref("")
  const successMessage = ref("")
  const files = reactive<Record<VerificationFileKey, File | null>>({
    passport: null,
    photo: null,
    shop_image: null,
    license: null,
  })
  const userForm = reactive({
    fullName: "",
    dob: "",
    cccd: "",
  })
  const shopForm = reactive({
    name: "",
    message: "",
  })

  const { data, status, error, refresh } = useAsyncData(
    "settings:verification",
    () => repository.getVerificationState(),
    {
      default: () => null,
    },
  )

  const verification = computed<SettingsVerificationState | null>(() => data.value)
  const profileType = computed<VerificationProfileType>(() => verification.value?.profileType ?? "user")
  const isShop = computed(() => profileType.value === "shop")
  const isLoading = computed(() => status.value === "pending")
  const isPending = computed(() => verification.value?.status === "pending")
  const isVerified = computed(() => verification.value?.status === "verified")
  const canSubmit = computed(() => verification.value?.status === "none")

  watch(verification, (next) => {
    if (!next) return

    if (!userForm.fullName) {
      userForm.fullName = next.user.name
    }

    if (!shopForm.name) {
      shopForm.name = next.profileType === "shop" ? "" : next.user.name
    }
  }, { immediate: true })

  function setFile(key: VerificationFileKey, file: File | null) {
    files[key] = file
  }

  function validate() {
    errorMessage.value = ""

    if (profileType.value === "user") {
      const fullName = userForm.fullName.trim()

      if (fullName.length < 5 || fullName.length > 50) {
        return t("settings.verification.errors.fullName")
      }
      if (!userForm.dob) {
        return t("settings.verification.errors.dob")
      }
      if (!/^\d{9,12}$/.test(userForm.cccd.trim())) {
        return t("settings.verification.errors.cccd")
      }
      if (missingFiles([files.passport, files.photo])) {
        return t("settings.verification.errors.userFiles")
      }
      if (unsupportedImages([files.passport, files.photo])) {
        return t("settings.verification.errors.imageFormat")
      }

      return ""
    }

    const shopName = shopForm.name.trim()

    if (shopName.length < 5 || shopName.length > 50) {
      return t("settings.verification.errors.shopName")
    }
    if (shopForm.message.trim().length < 5) {
      return t("settings.verification.errors.shopMessage")
    }
    if (missingFiles([files.passport, files.photo, files.shop_image, files.license])) {
      return t("settings.verification.errors.shopFiles")
    }
    if (unsupportedImages([files.passport, files.photo, files.shop_image]) || !isLicenseFile(files.license)) {
      return t("settings.verification.errors.imageFormat")
    }

    return ""
  }

  function buildFormData() {
    const formData = new FormData()

    formData.append("profileType", profileType.value)

    if (profileType.value === "shop") {
      formData.append("name", shopForm.name.trim())
      formData.append("text_shop", shopForm.message.trim())
    }
    else {
      formData.append("full_name", userForm.fullName.trim())
      formData.append("dob", userForm.dob)
      formData.append("cccd", userForm.cccd.trim())
    }

    for (const key of fileKeysByType[profileType.value]) {
      const file = files[key]

      if (file) {
        formData.append(key, file)
      }
    }

    return formData
  }

  async function submit() {
    if (submitting.value || !canSubmit.value) return false

    const validationError = validate()

    if (validationError) {
      errorMessage.value = validationError
      return false
    }

    submitting.value = true
    errorMessage.value = ""
    successMessage.value = ""

    try {
      const result = await repository.submitVerification(buildFormData())
      successMessage.value = result.message
      toast.add({
        color: "success",
        icon: "i-ph-check-circle-fill",
        title: result.message,
      })
      await refresh()
      return true
    }
    catch (err) {
      errorMessage.value = err instanceof Error ? err.message : t("settings.verification.errors.submit")
      return false
    }
    finally {
      submitting.value = false
    }
  }

  return {
    verification,
    profileType,
    isShop,
    isLoading,
    isPending,
    isVerified,
    canSubmit,
    loadError: error,
    userForm,
    shopForm,
    files,
    submitting,
    errorMessage,
    successMessage,
    setFile,
    submit,
    refresh,
  }
}
