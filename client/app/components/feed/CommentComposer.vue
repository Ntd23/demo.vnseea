<template>
  <div class="rounded-[20px] border border-[#0000ff]/10 bg-[#0000ff]/3 p-4">
    <div class="flex gap-3">
      <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0000ff] text-xs font-bold text-white shadow-[0_4px_12px_rgba(0,0,255,0.2)]">
        VN
      </div>
      <div class="min-w-0 flex-1">
        <UTextarea
          v-model="message"
          autoresize
          :rows="3"
          :placeholder="$t('feed.commentComposer.placeholder')"
          class="w-full"
          :ui="{
            base: 'min-h-[88px] resize-y rounded-[18px] border-[#0000ff]/12 bg-white px-4 py-3 text-[14px] leading-6 text-slate-700 placeholder:text-slate-400',
          }"
        />
        <div class="mt-2 flex items-center justify-between gap-3">
          <p class="text-[11px] font-semibold text-slate-500">
            {{ $t("feed.commentComposer.helper", { count: message.length }) }}
          </p>
          <UBadge color="neutral" variant="soft" class="rounded-full px-2.5 py-1 text-[10px] font-bold text-[#243b63]">
            {{ trimmedMessage ? $t("feed.commentComposer.submit") : $t("feed.commentComposer.tooltipMention") }}
          </UBadge>
        </div>
      </div>
    </div>

    <UAlert
      v-if="status !== 'idle' && statusMessage"
      class="mt-3 rounded-[18px]"
      :color="status === 'error' ? 'warning' : status === 'success' ? 'success' : 'primary'"
      variant="subtle"
      :icon="status === 'error'
        ? 'i-ph-warning-circle-fill'
        : status === 'success'
          ? 'i-ph-check-circle-fill'
          : 'i-ph-spinner-gap-bold'"
      :description="statusMessage"
    />

    <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap gap-1 text-[#0000ff]/40">
        <UButton
          v-for="action in toolbarActions"
          :key="action.label"
          color="neutral"
          variant="ghost"
          size="xs"
          class="rounded-full"
          :aria-label="action.label"
          @click="notifyAction(action.label)"
        >
          <Icon :name="action.icon" class="h-4 w-4" />
        </UButton>
      </div>

      <UButton
        color="primary"
        size="sm"
        class="rounded-full px-4"
        :loading="status === 'loading'"
        :disabled="status === 'loading' || !trimmedMessage"
        @click="submitComment"
      >
        {{ status === "loading" ? $t("feed.commentComposer.submitLoading") : $t("feed.commentComposer.submit") }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
type ComposerStatus = "idle" | "loading" | "success" | "error"

const { t } = useI18n()
const toast = useToast()

const emit = defineEmits<{
  submit: [message: string]
}>()

const message = ref("")
const status = ref<ComposerStatus>("idle")
const statusMessage = ref("")

const trimmedMessage = computed(() => message.value.trim())

const toolbarActions = computed(() => [
  { label: t("feed.commentComposer.tooltipEmoji"), icon: "i-lucide-smile" },
  { label: t("feed.commentComposer.tooltipImage"), icon: "i-lucide-image" },
  { label: t("feed.commentComposer.tooltipGif"), icon: "i-lucide-film" },
  { label: t("feed.commentComposer.tooltipSticker"), icon: "i-lucide-sticker" },
  { label: t("feed.commentComposer.tooltipMention"), icon: "i-lucide-at-sign" },
])

watch(message, () => {
  if (status.value !== "loading") {
    status.value = "idle"
    statusMessage.value = ""
  }
})

function notifyAction(label: string) {
  toast.add({
    color: "primary",
    icon: "i-ph-sparkle-fill",
    title: label,
  })
}

async function submitComment() {
  if (!trimmedMessage.value) {
    status.value = "error"
    statusMessage.value = t("feed.commentComposer.emptyError")
    return
  }

  status.value = "loading"
  statusMessage.value = ""

  await new Promise(resolve => setTimeout(resolve, 220))

  emit("submit", trimmedMessage.value)
  message.value = ""
  status.value = "success"
  statusMessage.value = t("feed.commentComposer.successMessage")

  toast.add({
    color: "success",
    icon: "i-ph-check-circle-fill",
    title: t("feed.commentComposer.submit"),
    description: statusMessage.value,
  })
}
</script>
