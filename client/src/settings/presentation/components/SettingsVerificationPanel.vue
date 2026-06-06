<!-- English description: Renders the phtml-compatible verification request flow for users and shops. -->
<template>
  <section class="verification-panel">
    <USkeleton v-if="isLoading && !verification" class="h-[520px] rounded-[20px]" />

    <UAlert
      v-else-if="loadError"
      color="error"
      variant="soft"
      icon="i-ph-warning-circle-fill"
      :title="t('settings.verification.errors.load')"
      :description="String(loadError.message || loadError)"
      class="rounded-[18px]"
    />

    <template v-else-if="verification">
      <header class="verification-panel__hero">
        <NuxtLink :to="profileHref" class="verification-panel__avatar-wrap">
          <img
            v-if="verification.user.avatar"
            :src="verification.user.avatar"
            :alt="verification.user.name"
            class="verification-panel__avatar"
          >
          <span v-else class="verification-panel__avatar verification-panel__avatar--empty">
            {{ verification.user.name.slice(0, 2).toUpperCase() }}
          </span>
          <span class="verification-panel__seal" aria-hidden="true">
            <Icon name="i-ph-seal-check-fill" class="h-5 w-5" />
          </span>
        </NuxtLink>
        <div class="verification-panel__hero-copy">
          <NuxtLink :to="profileHref" class="verification-panel__username">
            {{ verification.user.username || verification.user.name }}
          </NuxtLink>
          <h2>
            {{ t("settings.verification.heroTitle") }}
            <span>{{ isShop ? t("settings.verification.shopTitleSuffix") : t("settings.verification.userTitleSuffix") }}</span>
          </h2>
        </div>
      </header>

      <section v-if="verification.availableFeatures.length" class="verification-panel__features">
        <h3>{{ t("settings.verification.afterVerified") }}</h3>
        <ol>
          <li v-for="feature in verification.availableFeatures" :key="feature.key">
            {{ feature.label }}
          </li>
        </ol>
      </section>

      <UAlert
        v-if="isPending"
        color="primary"
        variant="soft"
        icon="i-ph-user-check-duotone"
        :title="t('settings.verification.pendingTitle')"
        :description="t('settings.verification.pendingDescription')"
        class="rounded-[18px]"
      />
      <UAlert
        v-else-if="isVerified"
        color="success"
        variant="soft"
        icon="i-ph-seal-check-fill"
        :title="t('settings.verification.verifiedTitle')"
        :description="t('settings.verification.verifiedDescription')"
        class="rounded-[18px]"
      />

      <form v-else class="verification-panel__form" @submit.prevent="submit">
        <UAlert
          v-if="errorMessage"
          color="error"
          variant="soft"
          icon="i-ph-warning-circle-fill"
          :title="t('settings.verification.errors.title')"
          :description="errorMessage"
          class="rounded-[16px]"
        />
        <UAlert
          v-if="successMessage"
          color="success"
          variant="soft"
          icon="i-ph-check-circle-fill"
          :title="successMessage"
          class="rounded-[16px]"
        />
        <UAlert
          color="warning"
          variant="soft"
          icon="i-ph-clock-countdown-duotone"
          :title="t('settings.verification.deadlineTitle')"
          :description="t('settings.verification.deadlineDescription')"
          class="rounded-[16px]"
        />

        <div v-if="isShop" class="verification-panel__fields">
          <UFormField :label="t('settings.verification.shopName')">
            <UInput v-model="shopForm.name" size="lg" />
          </UFormField>
          <UFormField :label="t('settings.verification.message')" class="verification-panel__field-full">
            <UTextarea v-model="shopForm.message" :rows="5" />
          </UFormField>
        </div>
        <div v-else class="verification-panel__fields">
          <UFormField :label="t('settings.verification.fullName')">
            <UInput v-model="userForm.fullName" size="lg" />
          </UFormField>
          <UFormField :label="t('settings.verification.dob')">
            <UInput v-model="userForm.dob" type="date" size="lg" />
          </UFormField>
          <UFormField :label="t('settings.verification.cccd')" class="verification-panel__field-full">
            <UInput
              v-model="userForm.cccd"
              inputmode="numeric"
              maxlength="12"
              pattern="[0-9]{9,12}"
              :placeholder="t('settings.verification.cccdPlaceholder')"
              size="lg"
            />
          </UFormField>
        </div>

        <div class="verification-panel__upload-copy">
          <h3>{{ t("settings.verification.uploadDocs") }}</h3>
          <p>{{ t("settings.verification.selectImages") }}</p>
        </div>

        <div class="verification-panel__upload-grid">
          <button
            v-for="tile in uploadTiles"
            :key="tile.key"
            type="button"
            class="verification-panel__upload-tile"
            @click="openFilePicker(tile.key)"
          >
            <img
              v-if="previews[tile.key]?.kind === 'image'"
              :src="previews[tile.key]?.url"
              :alt="tile.label"
              class="verification-panel__preview"
            >
            <span v-else-if="previews[tile.key]?.kind === 'pdf'" class="verification-panel__pdf-chip">
              {{ previews[tile.key]?.name }}
            </span>
            <span v-else class="verification-panel__empty-state">
              <span class="verification-panel__empty-icon">
                <Icon :name="tile.icon" class="h-8 w-8" />
              </span>
              <span>{{ tile.label }}</span>
            </span>
          </button>
          <input
            v-for="tile in uploadTiles"
            :key="`input-${tile.key}`"
            :ref="el => setFileInputRef(tile.key, el)"
            type="file"
            class="verification-panel__hidden-file"
            :accept="tile.accept"
            @change="event => handleFileChange(tile.key, event)"
          >
        </div>

        <div class="verification-panel__actions">
          <UButton
            type="submit"
            color="primary"
            size="lg"
            class="rounded-full px-8"
            :loading="submitting"
          >
            {{ t("settings.verification.send") }}
          </UButton>
        </div>
      </form>
    </template>
  </section>
</template>

<script setup lang="ts">
import type { ComponentPublicInstance } from "vue"
import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"
import { useSettingsVerificationVM } from "../../application/view-models/useSettingsVerificationVM"

type FileKey = "passport" | "photo" | "shop_image" | "license"
type PreviewState = {
  kind: "image" | "pdf"
  url: string
  name: string
}

const { t } = useI18n()
const {
  verification,
  isShop,
  isLoading,
  isPending,
  isVerified,
  loadError,
  userForm,
  shopForm,
  submitting,
  errorMessage,
  successMessage,
  setFile,
  submit,
} = useSettingsVerificationVM()
const fileInputs = shallowReactive<Partial<Record<FileKey, HTMLInputElement>>>({})
const previews = reactive<Partial<Record<FileKey, PreviewState>>>({})

const profileHref = computed(() => {
  const username = verification.value?.user.username

  return username ? appRoutes.profile(username) : appRoutes.settings
})

const imageAccept = ".jpg,.jpeg,.png,.gif,.bmp,.webp,image/jpeg,image/png,image/gif,image/bmp,image/x-ms-bmp,image/webp"

const uploadTiles = computed<Array<{ key: FileKey; label: string; icon: string; accept: string }>>(() => {
  const common = [
    {
      key: "passport" as const,
      label: isShop.value ? t("settings.verification.passportId") : t("settings.verification.identityDocument"),
      icon: "i-ph-identification-card-duotone",
      accept: imageAccept,
    },
    {
      key: "photo" as const,
      label: isShop.value ? t("settings.verification.personalPic") : t("settings.verification.portrait"),
      icon: "i-ph-camera-duotone",
      accept: imageAccept,
    },
  ]

  if (!isShop.value) return common

  return [
    ...common,
    {
      key: "shop_image" as const,
      label: t("settings.verification.shopImage"),
      icon: "i-ph-storefront-duotone",
      accept: imageAccept,
    },
    {
      key: "license" as const,
      label: t("settings.verification.license"),
      icon: "i-ph-file-text-duotone",
      accept: `${imageAccept},.pdf,application/pdf`,
    },
  ]
})

watch(verification, (next) => {
  if (!next?.isAdmin) return

  const url = next.adminRedirectUrl || "/admincp/s_requests"

  if (import.meta.client) {
    window.location.href = url
  }
}, { immediate: true })

function setFileInputRef(key: FileKey, element: Element | ComponentPublicInstance | null) {
  if (element instanceof HTMLInputElement) {
    fileInputs[key] = element
  }
}

function openFilePicker(key: FileKey) {
  fileInputs[key]?.click()
}

function revokePreview(key: FileKey) {
  const preview = previews[key]

  if (preview?.url && preview.kind === "image") {
    URL.revokeObjectURL(preview.url)
  }

  delete previews[key]
}

function handleFileChange(key: FileKey, event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null

  revokePreview(key)
  setFile(key, file)

  if (!file) return

  if (file.type === "application/pdf") {
    previews[key] = {
      kind: "pdf",
      url: "",
      name: file.name,
    }
    return
  }

  previews[key] = {
    kind: "image",
    url: URL.createObjectURL(file),
    name: file.name,
  }
}

onBeforeUnmount(() => {
  for (const key of Object.keys(previews) as FileKey[]) {
    revokePreview(key)
  }
})
</script>

<style scoped>
.verification-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.verification-panel__hero,
.verification-panel__features,
.verification-panel__form {
  border: 1px solid #dbeafe;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(15, 35, 110, 0.06);
}

.verification-panel__hero {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 18px;
  background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
}

.verification-panel__avatar-wrap {
  position: relative;
  display: inline-flex;
  flex: 0 0 auto;
}

.verification-panel__avatar {
  display: flex;
  width: 92px;
  height: 92px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 999px;
  background: #dbeafe;
  color: #0000ff;
  font-size: 24px;
  font-weight: 900;
  object-fit: cover;
}

.verification-panel__seal {
  position: absolute;
  right: -2px;
  bottom: 6px;
  display: inline-flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border: 3px solid #ffffff;
  border-radius: 999px;
  background: #2196f3;
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(33, 150, 243, 0.28);
}

.verification-panel__hero-copy {
  min-width: 0;
}

.verification-panel__username {
  color: #0000ff;
  font-size: 15px;
  font-weight: 800;
  text-decoration: none;
}

.verification-panel__hero-copy h2 {
  margin: 2px 0 0;
  color: #2196f3;
  font-size: clamp(26px, 4vw, 36px);
  font-weight: 900;
  line-height: 1.15;
}

.verification-panel__features {
  padding: 16px 18px;
}

.verification-panel__features h3,
.verification-panel__upload-copy h3 {
  margin: 0 0 8px;
  color: #0f172a;
  font-size: 17px;
  font-weight: 900;
}

.verification-panel__features ol {
  margin: 0;
  padding-left: 20px;
  color: #475569;
  font-weight: 650;
}

.verification-panel__form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 18px;
}

.verification-panel__fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.verification-panel__field-full {
  grid-column: 1 / -1;
}

.verification-panel__upload-copy p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
}

.verification-panel__upload-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 20px;
}

.verification-panel__upload-tile {
  min-height: 210px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #f8fafc;
  color: #475569;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease, transform 0.15s ease;
}

.verification-panel__upload-tile:hover {
  border-color: #93c5fd;
  background: #eff6ff;
  transform: translateY(-1px);
}

.verification-panel__preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.verification-panel__empty-state {
  display: flex;
  height: 100%;
  min-height: 210px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 18px;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
}

.verification-panel__empty-icon {
  display: inline-flex;
  width: 74px;
  height: 74px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #90a4ae;
  color: #ffffff;
}

.verification-panel__pdf-chip {
  display: inline-flex;
  max-width: calc(100% - 32px);
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #e0f2fe;
  padding: 10px 14px;
  color: #0369a1;
  font-size: 14px;
  font-weight: 800;
}

.verification-panel__actions {
  display: flex;
  justify-content: center;
}

.verification-panel__hidden-file {
  display: none;
}

@media (max-width: 640px) {
  .verification-panel__hero {
    align-items: flex-start;
    gap: 14px;
  }

  .verification-panel__avatar {
    width: 72px;
    height: 72px;
  }

  .verification-panel__seal {
    width: 30px;
    height: 30px;
  }

  .verification-panel__fields,
  .verification-panel__upload-grid {
    grid-template-columns: 1fr;
  }

  .verification-panel__upload-tile,
  .verification-panel__empty-state {
    min-height: 170px;
  }
}
</style>
