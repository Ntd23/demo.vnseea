<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="open" class="fixed inset-0 z-50 flex items-end justify-center sm:items-center" @click.self="$emit('close')">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="$emit('close')" />

        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 translate-y-6 scale-[0.97]" enter-to-class="opacity-100 translate-y-0 scale-100">
          <div v-if="open" class="relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_-8px_50px_rgba(0,0,255,0.13)] sm:max-h-[90vh] sm:rounded-[28px]">
            <div class="flex shrink-0 items-center justify-between border-b border-[#0000ff]/8 px-5 py-4">
              <div class="flex items-center gap-2.5">
                <div class="flex h-9 w-9 items-center justify-center rounded-full bg-[#0000ff]/8 text-[#0000ff]">
                  <Icon name="i-lucide-share-2" class="h-[18px] w-[18px]" />
                </div>
                <div>
                  <span class="block font-semibold text-slate-800">{{ t("feed.shareModal.title") }}</span>
                  <span class="block text-[12px] text-slate-500">{{ t("feed.shareModal.subtitle") }}</span>
                </div>
              </div>
              <UButton color="neutral" variant="ghost" size="xs" class="rounded-full" @click="$emit('close')">
                <Icon name="i-lucide-x" class="h-[18px] w-[18px]" />
              </UButton>
            </div>

            <div class="flex-1 space-y-5 overflow-y-auto p-5">
              <UAlert
                v-if="status !== 'idle' && statusMessage"
                class="rounded-[18px]"
                :color="status === 'error' ? 'warning' : status === 'success' ? 'success' : 'primary'"
                variant="subtle"
                :icon="status === 'error'
                  ? 'i-ph-warning-circle-fill'
                  : status === 'success'
                    ? 'i-ph-check-circle-fill'
                    : 'i-ph-spinner-gap-bold'"
                :description="statusMessage"
              />

              <div>
                <p class="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0000ff]/50">{{ t("feed.shareModal.shareVia") }}</p>
                <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <UButton
                    v-for="platform in platforms"
                    :key="platform.label"
                    color="neutral"
                    variant="outline"
                    class="flex flex-col items-center gap-1.5 rounded-[16px] py-3 text-[11px] font-medium text-slate-600 shadow-[0_8px_18px_rgba(15,23,42,0.03)]"
                    type="button"
                    @click="platform.action"
                  >
                    <span class="flex h-10 w-10 items-center justify-center rounded-full border-4 border-[#0000ff]/10 bg-[#0000ff]/6 text-[#0000ff]">
                      <Icon :name="platform.icon" class="h-[22px] w-[22px]" />
                    </span>
                    <span>{{ platform.label }}</span>
                  </UButton>
                </div>

                <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150" leave-to-class="opacity-0">
                  <div v-if="copied" class="mt-2 flex items-center gap-2 rounded-[12px] border border-[#0000ff]/20 bg-[#0000ff]/5 px-3 py-2 text-xs font-medium text-[#0000ff]">
                    <Icon name="i-lucide-check-circle-2" class="h-4 w-4 shrink-0" />
                    {{ t("feed.shareModal.copied") }}
                  </div>
                </Transition>
              </div>

              <div class="flex items-center gap-3">
                <div class="h-px flex-1 bg-[#0000ff]/8" />
                <span class="text-[11px] font-medium text-[#0000ff]/35">{{ t("feed.shareModal.orShareTo") }}</span>
                <div class="h-px flex-1 bg-[#0000ff]/8" />
              </div>

              <div>
                <UTextarea
                  v-model="caption"
                  autoresize
                  :rows="3"
                  :placeholder="t('feed.shareModal.captionPlaceholder')"
                  class="w-full"
                  :ui="{
                    base: 'min-h-[92px] resize-y rounded-[16px] border-[#0000ff]/15 bg-[#0000ff]/3 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400',
                  }"
                />
              </div>

              <div>
                <p class="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0000ff]/50">{{ t("feed.shareModal.destinationTitle") }}</p>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="dest in destinations"
                    :key="dest.value"
                    class="flex items-center gap-3 rounded-[16px] border px-4 py-3 text-left text-sm font-medium transition"
                    :class="selectedDest === dest.value ? 'border-[#0000ff] bg-[#0000ff]/5 text-[#0000ff]' : 'border-[#0000ff]/10 bg-white text-slate-600 hover:border-[#0000ff]/30 hover:text-[#0000ff]'"
                    type="button"
                    :aria-pressed="selectedDest === dest.value"
                    @click="selectedDest = dest.value"
                  >
                    <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition" :class="selectedDest === dest.value ? 'bg-[#0000ff] text-white' : 'bg-[#0000ff]/8 text-[#0000ff]'">
                      <Icon :name="dest.icon" class="h-4 w-4" />
                    </span>
                    <span class="leading-tight">{{ dest.label }}</span>
                  </button>
                </div>
              </div>

              <div v-if="post" class="rounded-[16px] border border-[#0000ff]/10 bg-[#0000ff]/3 p-3">
                <p class="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#0000ff]/40">{{ t("feed.shareModal.previewLabel") }}</p>
                <div class="flex items-start gap-2">
                  <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0000ff] text-[10px] font-bold text-white">
                    {{ post.author.slice(0, 2).toUpperCase() }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-[12px] font-semibold text-slate-800">{{ post.author }}</p>
                    <p class="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-slate-600">{{ post.text }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="shrink-0 border-t border-[#0000ff]/8 px-5 py-4">
              <UButton
                color="primary"
                size="lg"
                block
                class="rounded-[14px]"
                :loading="status === 'loading'"
                :disabled="status === 'loading' || !selectedDest"
                @click="onShare"
              >
                <Transition mode="out-in" enter-active-class="transition duration-150" enter-from-class="opacity-0 scale-90" enter-to-class="opacity-100 scale-100">
                  <span v-if="shared" class="flex items-center gap-2">
                    <Icon name="i-lucide-check" class="h-4 w-4" /> {{ t("feed.shareModal.shared") }}
                  </span>
                  <span v-else class="flex items-center gap-2">
                    <Icon name="i-lucide-share-2" class="h-4 w-4" /> {{ status === "loading" ? t("feed.shareModal.submitLoading") : t("feed.shareModal.submit") }}
                  </span>
                </Transition>
              </UButton>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useClipboard } from "@vueuse/core"

const { t } = useI18n()
const route = useRoute()
const requestURL = useRequestURL()
const toast = useToast()

const props = withDefaults(defineProps<{
  open?: boolean
  shareUrl?: string
  post?: {
    author: string
    text: string
  } | null
}>(), {
  open: false,
  shareUrl: "",
  post: null,
})

type ShareStatus = "idle" | "loading" | "success" | "error"

const emit = defineEmits<{ close: []; shared: [destination: string] }>()

const { copy, copied, isSupported } = useClipboard()

const caption = ref("")
const shared = ref(false)
const selectedDest = ref("timeline")
const status = ref<ShareStatus>("idle")
const statusMessage = ref("")

const pageUrl = computed(() =>
  props.shareUrl || new URL(route.fullPath || route.path || "/", requestURL.origin).toString(),
)
const shareText = computed(() => caption.value || props.post?.text || '')

const platforms = computed(() => [
  {
    label: "Facebook",
    icon: "i-simple-icons-facebook",
    action: () => openPlatform(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl.value)}`),
  },
  {
    label: "WhatsApp",
    icon: "i-simple-icons-whatsapp",
    action: () => openPlatform(`https://wa.me/?text=${encodeURIComponent(shareText.value + " " + pageUrl.value)}`),
  },
  {
    label: "Telegram",
    icon: "i-simple-icons-telegram",
    action: () => openPlatform(`https://t.me/share/url?url=${encodeURIComponent(pageUrl.value)}&text=${encodeURIComponent(shareText.value)}`),
  },
  {
    label: t("feed.shareModal.platformCopy"),
    icon: "i-lucide-link-2",
    action: copyShareLink,
  },
])

const destinations = computed(() => [
  { label: t("feed.shareModal.destinationTimeline"), value: "timeline", icon: "i-lucide-layout-list" },
  { label: t("feed.shareModal.destinationPage"), value: "page", icon: "i-lucide-flag" },
  { label: t("feed.shareModal.destinationGroup"), value: "group", icon: "i-lucide-users-2" },
  { label: t("feed.shareModal.destinationMessage"), value: "message", icon: "i-lucide-send" },
])

async function copyShareLink() {
  if (!isSupported.value) {
    status.value = "error"
    statusMessage.value = t("feed.shareModal.copyUnavailable")
    return
  }

  await copy(pageUrl.value)
  status.value = "success"
  statusMessage.value = t("feed.shareModal.copied")

  toast.add({
    color: "success",
    icon: "i-ph-check-circle-fill",
    title: t("feed.shareModal.platformCopy"),
    description: statusMessage.value,
  })
}

function openPlatform(url: string) {
  if (!import.meta.client) return

  window.open(url, "_blank", "noopener,noreferrer")
  status.value = "success"
  statusMessage.value = pageUrl.value
}

async function onShare() {
  if (!selectedDest.value) return

  status.value = "loading"
  statusMessage.value = ""
  await new Promise(resolve => setTimeout(resolve, 280))
  shared.value = true

  status.value = "success"
  statusMessage.value = t("feed.shareModal.shared")

  toast.add({
    color: "success",
    icon: "i-ph-share-network-fill",
    title: t("feed.shareModal.title"),
    description: t("feed.shareModal.shared"),
  })

  emit("shared", selectedDest.value)

  setTimeout(() => {
    shared.value = false
    emit('close')
  }, 1400)
}

watch(() => props.open, (val) => {
  if (!val) {
    setTimeout(() => {
      caption.value = ''
      shared.value = false
      status.value = "idle"
      statusMessage.value = ""
      selectedDest.value = 'timeline'
    }, 200)
  }
})
</script>
