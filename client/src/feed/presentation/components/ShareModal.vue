<!-- English description: Renders the feed share dialog for sharing a post to external platforms, timeline, pages, groups, or messages. -->
<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="share-modal"
        @click.self="closeModal"
      >
        <div class="share-modal__scrim" @click="closeModal" />

        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 translate-y-4 scale-[0.98]"
          enter-to-class="opacity-100 translate-y-0 scale-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0 scale-100"
          leave-to-class="opacity-0 translate-y-4 scale-[0.98]"
        >
          <section
            v-if="open"
            class="share-modal__panel"
            role="dialog"
            aria-modal="true"
            :aria-label="t('feed.shareModal.title')"
          >
            <header class="share-modal__header">
              <div class="share-modal__title-row">
                <span class="share-modal__title-icon">
                  <Icon name="i-ph-share-network-duotone" />
                </span>
                <span class="share-modal__title-copy">
                  <strong>{{ t("feed.shareModal.title") }}</strong>
                </span>
              </div>
              <button
                type="button"
                class="share-modal__icon-button"
                :aria-label="t('feed.postCard.reactionModalClose')"
                @click="closeModal"
              >
                <Icon name="i-ph-x-bold" />
              </button>
            </header>

            <div class="share-modal__body">
              <UAlert
                v-if="status !== 'idle' && statusMessage"
                class="share-modal__alert"
                :color="status === 'error' ? 'warning' : status === 'success' ? 'success' : 'primary'"
                variant="subtle"
                :icon="status === 'error'
                  ? 'i-ph-warning-circle-fill'
                  : status === 'success'
                    ? 'i-ph-check-circle-fill'
                    : 'i-ph-spinner-gap-bold'"
                :description="statusMessage"
              />

              <section class="share-modal__section">
                <div class="share-modal__section-head">
                  <p>{{ t("feed.shareModal.shareVia") }}</p>
                </div>
                <div class="share-modal__platform-grid">
                  <button
                    v-for="platform in platforms"
                    :key="platform.label"
                    class="share-modal__platform"
                    type="button"
                    :disabled="!canShare"
                    @click="platform.action"
                  >
                    <span class="share-modal__platform-icon" :style="{ color: platform.color }">
                      <Icon :name="platform.icon" class="w-7 h-7"/>
                    </span>
                    <span>{{ platform.label }}</span>
                  </button>
                </div>
                <Transition
                  enter-active-class="transition duration-200 ease-out"
                  enter-from-class="opacity-0 -translate-y-1"
                  enter-to-class="opacity-100 translate-y-0"
                  leave-active-class="transition duration-150"
                  leave-to-class="opacity-0"
                >
                  <p v-if="copied" class="share-modal__inline-success">
                    <Icon name="i-ph-check-circle-fill" class="w-7 h-7"/>
                    <span>{{ t("feed.shareModal.copied") }}</span>
                  </p>
                </Transition>
              </section>

              <section class="share-modal__section">
                <div class="share-modal__section-head">
                  <p>{{ t("feed.shareModal.orShareTo") }}</p>
                </div>
                <UTextarea
                  v-model="caption"
                  autoresize
                  :rows="3"
                  :placeholder="t('feed.shareModal.captionPlaceholder')"
                  class="share-modal__textarea"
                  :ui="{
                    base: 'resize-none rounded-[16px] border-[var(--border-light)] bg-[var(--bg-muted)] px-4 py-3 text-sm leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:bg-[var(--bg-surface)] focus:ring-2 focus:ring-[var(--color-primary-200)]',
                  }"
                  @update:model-value="clearErrorState"
                />
              </section>

              <section class="share-modal__section">
                <div class="share-modal__section-head">
                  <p>{{ t("feed.shareModal.destinationTitle") }}</p>
                  <small v-if="shareDisabledMessage">{{ shareDisabledMessage }}</small>
                </div>
                <div class="share-modal__destination-grid">
                  <button
                    v-for="dest in destinations"
                    :key="dest.value"
                    class="share-modal__destination"
                    :class="{ 'share-modal__destination--active': selectedDestination === dest.value }"
                    type="button"
                    @click="handleDestinationChange(dest.value)"
                  >
                    <Icon :name="dest.icon" class="w-7 h-7" />
                    <span>{{ dest.label }}</span>
                  </button>
                </div>

                <div class="share-modal__target-panel">
                  <div v-if="selectedDestination === 'timeline'" class="share-modal__target-card share-modal__target-card--selected">
                    <TargetAvatar :target="currentProfileTarget" />
                    <span class="share-modal__target-copy">
                      <strong>{{ currentProfileTarget.title }}</strong>
                      <small>{{ currentProfileTarget.subtitle }}</small>
                    </span>
                    <Icon name="i-ph-check-circle-fill" class="share-modal__target-check" />
                  </div>

                  <div v-else class="share-modal__target-search">
                    <UInput
                      v-if="selectedDestination === 'page'"
                      v-model="pageSearch"
                      size="lg"
                      icon="i-ph-magnifying-glass-bold"
                      class="w-7 h-7"
                      :placeholder="t('feed.shareModal.pageSearchPlaceholder')"
                      :ui="{ base: 'rounded-[14px] bg-[var(--bg-surface)] text-sm font-semibold' }"
                      @update:model-value="clearErrorState"
                    />
                    <UInput
                      v-else-if="selectedDestination === 'group'"
                      v-model="groupSearch"
                      size="lg"
                      icon="i-ph-magnifying-glass-bold"
                      class="w-7 h-7"
                      :placeholder="t('feed.shareModal.groupSearchPlaceholder')"
                      :ui="{ base: 'rounded-[14px] bg-[var(--bg-surface)] text-sm font-semibold' }"
                      @update:model-value="clearErrorState"
                    />
                    <UInput
                      v-else
                      v-model="messageSearch"
                      size="lg"
                      icon="i-ph-magnifying-glass-bold"
                      class="w-7 h-7"
                      :placeholder="t('feed.shareModal.messageSearchPlaceholder')"
                      :ui="{ base: 'rounded-[14px] bg-[var(--bg-surface)] text-sm font-semibold' }"
                      @update:model-value="clearErrorState"
                    />

                    <div v-if="destinationPending" class="share-modal__target-state">
                      <Icon name="i-ph-spinner-gap-bold" class="animate-spin w-7 h-7" />
                      <span>{{ t("feed.shareModal.searchLoading") }}</span>
                    </div>

                    <div v-else-if="destinationTargets.length" class="share-modal__target-list">
                      <button
                        v-for="target in destinationTargets"
                        :key="`${target.kind}-${target.id}`"
                        type="button"
                        class="share-modal__target-card"
                        :class="{ 'share-modal__target-card--selected': selectedTargetId === target.id }"
                        @click="handleTargetSelect(target.id)"
                      >
                        <TargetAvatar :target="target" />
                        <span class="share-modal__target-copy">
                          <strong>{{ target.title }}</strong>
                          <small>{{ target.subtitle }}</small>
                        </span>
                        <Icon
                          v-if="selectedTargetId === target.id"
                          name="i-ph-check-circle-fill"
                          class="share-modal__target-check w-7 h-7"
                        />
                      </button>
                    </div>

                    <div v-else class="share-modal__target-empty">
                      {{ destinationEmptyMessage }}
                    </div>
                  </div>
                </div>
              </section>

            </div>

            <footer class="share-modal__footer">
              <button
                type="button"
                class="share-modal__secondary"
                @click="closeModal"
              >
                {{ t("feed.postCard.reactionModalClose") }}
              </button>
              <UButton
                size="lg"
                class="share-modal__submit"
                icon="i-ph-paper-plane-tilt-fill"
                :loading="status === 'loading'"
                :disabled="status === 'loading' || !canShare"
                @click="onShare"
              >
                {{ shared ? t("feed.shareModal.shared") : status === "loading" ? t("feed.shareModal.submitLoading") : t("feed.shareModal.submit") }}
              </UButton>
            </footer>
          </section>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import {
  useFeedShareModalVM,
} from "../../application/view-models/useFeedShareModalVM"
import type { FeedShareDestination, FeedShareTarget } from "../../domain/types/feed-share.types"
import type { PropType } from "vue"

const { t } = useI18n()
const route = useRoute()
const requestURL = useRequestURL()
const toast = useToast()

const props = withDefaults(defineProps<{
  open?: boolean
  canShare?: boolean
  shareUrl?: string
  post?: {
    id?: number
    author: string
    text: string
    authorAvatar?: string
    authorVerified?: boolean
  } | null
}>(), {
  open: false,
  canShare: false,
  shareUrl: "",
  post: null,
})

type ShareStatus = "idle" | "loading" | "success" | "error"

const emit = defineEmits<{ close: []; shared: [destination: string] }>()

const copied = ref(false)
const caption = ref("")
const shared = ref(false)
const status = ref<ShareStatus>("idle")
const errorMessage = ref("")
const {
  selectedDestination,
  selectedTargetId,
  selectedTarget,
  currentProfileTarget,
  pageSearch,
  groupSearch,
  messageSearch,
  destinationTargets,
  destinationPending,
  canShare,
  selectDestination,
  selectTarget,
  submitShare,
  reset: resetShareDestination,
} = useFeedShareModalVM(toRef(props, "open"), toRef(props, "canShare"))

const TargetAvatar = defineComponent({
  name: "TargetAvatar",
  props: {
    target: {
      type: Object as PropType<FeedShareTarget>,
      required: true,
    },
  },
  setup(componentProps) {
    return () => componentProps.target.avatarUrl
      ? h("img", {
        src: componentProps.target.avatarUrl,
        alt: componentProps.target.title,
        class: "share-modal__target-avatar",
      })
      : h("span", { class: "share-modal__target-avatar share-modal__target-avatar--fallback" }, componentProps.target.initials)
  },
})

const pageUrl = computed(() =>
  props.shareUrl || new URL(route.fullPath || route.path || "/", requestURL.origin).toString(),
)
const shareText = computed(() => caption.value || props.post?.text || "")

const platforms = computed(() => [
  {
    label: "Facebook",
    icon: "i-ph-facebook-logo-fill",
    color: "#1877F2",
    action: () => openPlatform(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl.value)}`),
  },
  {
    label: "WhatsApp",
    icon: "i-ph-whatsapp-logo-fill",
    color: "#25D366",
    action: () => openPlatform(`https://wa.me/?text=${encodeURIComponent(`${shareText.value} ${pageUrl.value}`)}`),
  },
  {
    label: "Telegram",
    icon: "i-ph-telegram-logo-fill",
    color: "#0088cc",
    action: () => openPlatform(`https://t.me/share/url?url=${encodeURIComponent(pageUrl.value)}&text=${encodeURIComponent(shareText.value)}`),
  },
  {
    label: t("feed.shareModal.platformCopy"),
    icon: "i-ph-link-bold",
    color: "var(--text-secondary)",
    action: copyShareLink,
  },
])

const destinations = computed(() => [
  { label: t("feed.shareModal.destinationTimeline"), value: "timeline" as FeedShareDestination, icon: "i-ph-rows-duotone" },
  { label: t("feed.shareModal.destinationPage"), value: "page" as FeedShareDestination, icon: "i-ph-flag-duotone" },
  { label: t("feed.shareModal.destinationGroup"), value: "group" as FeedShareDestination, icon: "i-ph-users-three-duotone" },
  { label: t("feed.shareModal.destinationMessage"), value: "message" as FeedShareDestination, icon: "i-ph-paper-plane-tilt-duotone" },
])

const destinationPanelTitle = computed(() => {
  if (selectedDestination.value === "page") return t("feed.shareModal.pagePanelTitle")
  if (selectedDestination.value === "group") return t("feed.shareModal.groupPanelTitle")
  if (selectedDestination.value === "message") return t("feed.shareModal.messagePanelTitle")

  return t("feed.shareModal.timelinePanelTitle")
})

const destinationPanelDescription = computed(() => {
  if (selectedDestination.value === "page") return t("feed.shareModal.pagePanelDescription")
  if (selectedDestination.value === "group") return t("feed.shareModal.groupPanelDescription")
  if (selectedDestination.value === "message") return t("feed.shareModal.messagePanelDescription")

  return t("feed.shareModal.timelinePanelDescription")
})

const destinationPanelIcon = computed(() => {
  if (selectedDestination.value === "page") return "i-ph-flag-duotone"
  if (selectedDestination.value === "group") return "i-ph-users-three-duotone"
  if (selectedDestination.value === "message") return "i-ph-paper-plane-tilt-duotone"

  return "i-ph-user-circle-duotone"
})

const destinationEmptyMessage = computed(() => {
  if (selectedDestination.value === "page") return t("feed.shareModal.pageEmpty")
  if (selectedDestination.value === "group") return t("feed.shareModal.groupEmpty")

  return t("feed.shareModal.messageEmpty")
})

const shareDisabledMessage = computed(() => {
  if (canShare.value || selectedDestination.value === "timeline") return ""

  return destinationPanelDescription.value
})

const statusMessage = computed(() => {
  if (status.value === "loading") return t("feed.shareModal.submitLoading")
  if (status.value === "success") return t("feed.shareModal.shared")
  if (status.value === "error") return errorMessage.value || t("feed.shareModal.shareFailed")

  return ""
})

const postAuthorInitials = computed(() => {
  const name = props.post?.author || "VN"
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.slice(0, 1).toUpperCase())
    .join("")

  return initials || "VN"
})

async function copyShareLink() {
  clearErrorState()

  if (!props.canShare) {
    rejectUnauthorizedShare()
    return
  }

  if (!import.meta.client || typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
    toast.add({
      color: "warning",
      icon: "i-ph-warning-circle-fill",
      title: t("feed.shareModal.title"),
      description: t("feed.shareModal.copyUnavailable"),
    })
    return
  }

  try {
    await navigator.clipboard.writeText(pageUrl.value)
    copied.value = true
    toast.add({
      color: "success",
      icon: "i-ph-check-circle-fill",
      title: t("feed.shareModal.title"),
      description: t("feed.shareModal.copied"),
    })
    setTimeout(() => (copied.value = false), 2000)
  }
  catch {
    toast.add({
      color: "warning",
      icon: "i-ph-warning-circle-fill",
      title: t("feed.shareModal.title"),
      description: t("feed.shareModal.copyUnavailable"),
    })
  }
}

function openPlatform(url: string) {
  clearErrorState()

  if (!props.canShare) {
    rejectUnauthorizedShare()
    return
  }

  if (!import.meta.client) return

  window.open(url, "_blank", "noopener,noreferrer")
}

function rejectUnauthorizedShare() {
  status.value = "error"
  errorMessage.value = t("feed.shareModal.shareFailed")
  toast.add({
    color: "warning",
    icon: "i-ph-warning-circle-fill",
    title: t("feed.shareModal.title"),
    description: errorMessage.value,
  })
}

function handleDestinationChange(destination: FeedShareDestination) {
  selectDestination(destination)
  clearErrorState()
}

function handleTargetSelect(targetId: string) {
  selectTarget(targetId)
  clearErrorState()
}

function clearErrorState() {
  if (status.value === "error") {
    status.value = "idle"
  }
  errorMessage.value = ""
}

function closeModal() {
  emit("close")
}

function resolveInvalidShareMessage() {
  if (selectedDestination.value === "timeline") return t("feed.shareModal.shareFailed")

  return destinationPanelDescription.value
}

function extractShareError(error: unknown) {
  const candidate = error as {
    message?: string
    statusMessage?: string
    data?: {
      message?: string
      statusMessage?: string
      data?: {
        message?: string
        errors?: {
          error_text?: string
        }
      }
      errors?: {
        error_text?: string
      }
    }
  }

  const message = candidate?.data?.data?.errors?.error_text
    || candidate?.data?.errors?.error_text
    || candidate?.data?.data?.message
    || candidate?.data?.message
    || candidate?.data?.statusMessage
    || candidate?.statusMessage
    || candidate?.message

  if (!message || /fetch/i.test(message)) return t("feed.shareModal.shareFailed")
  if (/cant_share_own/i.test(message)) return "You cannot share your own post."
  if (/target and content|required|valid destination/i.test(message)) return t("feed.shareModal.shareFailed")

  return message
}

async function onShare() {
  if (!canShare.value) {
    status.value = "error"
    errorMessage.value = resolveInvalidShareMessage()
    return
  }

  status.value = "loading"
  errorMessage.value = ""

  try {
    const result = await submitShare({
      caption: caption.value,
      postText: props.post?.text,
      postId: props.post?.id,
      shareUrl: pageUrl.value,
    })

    shared.value = true
    status.value = "success"

    toast.add({
      color: "success",
      icon: "i-ph-share-network-fill",
      title: t("feed.shareModal.title"),
      description: t("feed.shareModal.shared"),
    })

    emit("shared", result.destination)

    setTimeout(() => {
      shared.value = false
      emit("close")
    }, 1200)
  }
  catch (error) {
    const message = extractShareError(error)
    status.value = "error"
    errorMessage.value = message
    toast.add({
      color: "warning",
      icon: "i-ph-warning-circle-fill",
      title: t("feed.shareModal.title"),
      description: message,
    })
  }
}

watch(() => props.open, (val) => {
  if (!val) {
    setTimeout(() => {
      caption.value = ""
      shared.value = false
      copied.value = false
      status.value = "idle"
      errorMessage.value = ""
      resetShareDestination()
    }, 200)
  }
})
</script>

<style scoped>
.share-modal {
  position: fixed;
  inset: 0;
  z-index: 1300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.share-modal__scrim {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.44);
  backdrop-filter: blur(8px);
}

.share-modal__panel {
  position: relative;
  z-index: 1;
  display: flex;
  width: min(720px, 100%);
  max-height: min(760px, calc(100dvh - 32px));
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border-light);
  border-radius: 20px;
  background: var(--bg-surface);
  box-shadow: var(--shadow-xl);
}

.share-modal__header,
.share-modal__footer {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
}

.share-modal__header {
  border-bottom: 1px solid var(--border-light);
}

.share-modal__title-row,
.share-modal__platform,
.share-modal__destination,
.share-modal__target-card,
.share-modal__target-head,
.share-modal__preview-card,
.share-modal__inline-success {
  display: flex;
  align-items: center;
}

.share-modal__title-row {
  min-width: 0;
  gap: 12px;
}

.share-modal__title-icon {
  display: inline-flex;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: var(--color-primary-50);
  color: var(--color-primary-600);
}

.share-modal__title-icon svg,
.share-modal__title-icon :deep(svg) {
  width: 24px;
  height: 24px;
}

.share-modal__title-copy {
  display: grid;
  min-width: 0;
  gap: 3px;
}

.share-modal__title-copy strong {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
}

.share-modal__title-copy small,
.share-modal__section-head small,
.share-modal__target-head small,
.share-modal__target-copy small,
.share-modal__preview-copy small {
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.45;
}

.share-modal__icon-button {
  display: inline-flex;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  background: var(--bg-muted);
  color: var(--text-secondary);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-default), color var(--duration-fast) var(--ease-default);
}

.share-modal__icon-button:hover {
  background: var(--bg-surface);
  color: var(--text-primary);
}

.share-modal__body {
  display: grid;
  flex: 1;
  gap: 18px;
  overflow-y: auto;
  padding: 18px 20px 20px;
}

.share-modal__alert {
  border-radius: 14px;
}

.share-modal__section {
  display: grid;
  gap: 12px;
}

.share-modal__section-head {
  display: grid;
  gap: 3px;
}

.share-modal__section-head p {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 800;
  line-height: 1.2;
}

.share-modal__platform-grid,
.share-modal__destination-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.share-modal__platform,
.share-modal__destination {
  min-width: 0;
  min-height: 74px;
  justify-content: center;
  gap: 8px;
  border: 1px solid var(--border-light);
  border-radius: 16px;
  background: var(--bg-muted);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  transition: border-color var(--duration-fast) var(--ease-default), background var(--duration-fast) var(--ease-default), transform var(--duration-fast) var(--ease-default);
}

.share-modal__platform {
  flex-direction: column;
}

.share-modal__platform:hover,
.share-modal__destination:hover,
.share-modal__target-card:hover {
  border-color: var(--color-primary-200);
  background: var(--bg-surface);
}

.share-modal__platform:active,
.share-modal__destination:active,
.share-modal__target-card:active,
.share-modal__secondary:active {
  transform: scale(0.99);
}

.share-modal__platform-icon,
.share-modal__destination svg,
.share-modal__destination :deep(svg) {
  display: inline-flex;
  width: 24px;
  height: 24px;
}

.share-modal__platform-icon svg,
.share-modal__platform-icon :deep(svg) {
  width: 24px;
  height: 24px;
}

.share-modal__inline-success {
  gap: 8px;
  border: 1px solid var(--color-success);
  border-radius: 14px;
  background: rgba(34, 197, 94, 0.08);
  padding: 10px 12px;
  color: var(--color-success);
  font-size: 13px;
  font-weight: 700;
}

.share-modal__textarea {
  width: 100%;
}

.share-modal__destination {
  flex-direction: column;
  color: var(--text-secondary);
}

.share-modal__destination--active {
  border-color: var(--color-primary-300);
  background: var(--color-primary-50);
  color: var(--color-primary-700);
  box-shadow: 0 10px 28px rgba(0, 0, 255, 0.08);
}

.share-modal__target-panel {
  display: grid;
  gap: 12px;
  border: 1px solid var(--border-light);
  border-radius: 18px;
  background: var(--bg-muted);
  padding: 14px;
}

.share-modal__target-head {
  justify-content: space-between;
  gap: 12px;
}

.share-modal__target-head p {
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 800;
}

.share-modal__target-head svg,
.share-modal__target-head :deep(svg) {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  color: var(--color-primary-600);
}

.share-modal__target-search,
.share-modal__target-list {
  display: grid;
  gap: 10px;
}

.share-modal__target-list {
  max-height: 230px;
  overflow-y: auto;
  padding-right: 4px;
}

.share-modal__target-card {
  width: 100%;
  min-width: 0;
  gap: 12px;
  border: 1px solid transparent;
  border-radius: 14px;
  background: var(--bg-surface);
  padding: 10px;
  text-align: left;
  cursor: pointer;
  transition: border-color var(--duration-fast) var(--ease-default), transform var(--duration-fast) var(--ease-default), background var(--duration-fast) var(--ease-default);
}

.share-modal__target-card--selected {
  border-color: var(--color-primary-300);
  background: rgba(0, 0, 255, 0.04);
}

.share-modal__target-avatar,
.share-modal__preview-avatar {
  display: inline-flex;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  object-fit: cover;
}

.share-modal__target-avatar--fallback,
.share-modal__preview-avatar--fallback {
  background: var(--bg-brand);
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
}

.share-modal__target-copy,
.share-modal__preview-copy {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.share-modal__target-copy strong,
.share-modal__preview-copy strong {
  overflow: hidden;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.share-modal__target-copy small,
.share-modal__preview-copy small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.share-modal__target-check {
  width: 20px;
  height: 20px;
  margin-left: auto;
  flex-shrink: 0;
  color: var(--color-primary-600);
}

.share-modal__target-state,
.share-modal__target-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 60px;
  border-radius: 14px;
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 700;
  text-align: center;
}

.share-modal__preview {
  display: grid;
  gap: 10px;
}

.share-modal__preview-card {
  min-width: 0;
  gap: 12px;
  border: 1px solid var(--border-light);
  border-radius: 16px;
  background: var(--bg-muted);
  padding: 12px;
}

.share-modal__preview-copy span {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 5px;
}

.share-modal__preview-copy svg,
.share-modal__preview-copy :deep(svg) {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  color: #3b82f6;
}

.share-modal__footer {
  border-top: 1px solid var(--border-light);
  background: rgba(255, 255, 255, 0.92);
}

.share-modal__secondary {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  background: var(--bg-surface);
  padding: 0 18px;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
}

.share-modal__secondary:hover {
  color: var(--text-primary);
}

.share-modal__submit {
  min-width: 160px;
  justify-content: center;
  border-radius: 12px;
  font-weight: 800;
}

@media (max-width: 640px) {
  .share-modal {
    align-items: flex-end;
    padding: 0;
  }

  .share-modal__panel {
    width: 100%;
    max-height: 92dvh;
    border-radius: 20px 20px 0 0;
  }

  .share-modal__header,
  .share-modal__footer,
  .share-modal__body {
    padding-right: 14px;
    padding-left: 14px;
  }

  .share-modal__platform-grid,
  .share-modal__destination-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .share-modal__footer {
    flex-direction: column-reverse;
  }

  .share-modal__secondary,
  .share-modal__submit {
    width: 100%;
  }
}
</style>
