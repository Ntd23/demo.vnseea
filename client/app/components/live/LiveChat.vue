<template>
  <section ref="chatPanel" class="flex min-h-[520px] flex-col rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]">
    <div class="border-b border-[var(--border-default)] p-4">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-label-secondary text-[var(--text-tertiary)]">{{ $t("pages.livePage.chatEyebrow") }}</p>
          <h2 class="mt-1 text-heading text-[var(--text-primary)]">{{ $t("pages.livePage.chatTitle") }}</h2>
        </div>
        <span class="inline-flex items-center gap-2 rounded-[var(--radius-full)] bg-[var(--color-primary-50)] px-3 py-1.5 text-[12px] font-extrabold text-[var(--color-primary-600)]">
          <span class="h-2 w-2 rounded-full bg-[var(--color-success)]" />
          {{ $t("pages.livePage.commentCount", { count: comments.length }) }}
        </span>
      </div>
    </div>

    <div class="flex-1 space-y-3 overflow-y-auto p-4">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="flex gap-3 rounded-[22px] bg-[var(--bg-surface-hover)] p-3"
      >
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-500)] text-[12px] font-black text-white">
          {{ comment.initials }}
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <p class="text-[13px] font-extrabold text-[var(--text-primary)]">{{ comment.author }}</p>
            <span v-if="comment.isHost" class="rounded-[var(--radius-full)] bg-[var(--color-primary-50)] px-2 py-0.5 text-[10px] font-black uppercase text-[var(--color-primary-600)]">{{ $t("pages.livePage.hostBadge") }}</span>
            <span class="text-[11px] font-semibold text-[var(--text-tertiary)]">{{ comment.time }}</span>
          </div>
          <p class="mt-1 text-[13px] font-semibold leading-5 text-[var(--text-secondary)]">{{ comment.message }}</p>
        </div>
      </div>
    </div>

    <form class="border-t border-[var(--border-default)] p-4" @submit.prevent="submit">
      <label class="sr-only" for="live-message">{{ $t("pages.livePage.chatInputLabel") }}</label>
      <div class="flex gap-2">
        <input
          id="live-message"
          v-model="message"
          class="h-12 min-w-0 flex-1 rounded-[var(--radius-full)] border border-[var(--border-default)] bg-[var(--bg-surface-hover)] px-4 text-[14px] font-semibold text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-strong)] focus:bg-white"
          :placeholder="$t('pages.livePage.chatPlaceholder')"
        >
        <button
          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-brand)] disabled:opacity-50"
          :disabled="message.trim().length === 0"
          type="submit"
        >
          <Icon name="i-ph-paper-plane-tilt-fill" class="h-5 w-5" />
        </button>
      </div>
      <p class="mt-2 text-[11px] font-semibold text-[var(--text-tertiary)]">{{ $t("pages.livePage.chatHint") }}</p>
    </form>
  </section>
</template>

<script setup lang="ts">
import type { MockLiveComment } from "~/composables/useMockLiveData"

const props = defineProps<{
  comments: ReadonlyArray<MockLiveComment>
}>()

const emit = defineEmits<{ send: [message: string] }>()

const message = ref("")
const chatPanel = ref<HTMLElement>()

const submit = () => {
  const value = message.value.trim()
  if (value.length === 0) return
  emit("send", value)
  message.value = ""
}

watch(() => props.comments.length, async () => {
  await nextTick()
  const scrollArea = chatPanel.value?.querySelector(".overflow-y-auto")
  if (scrollArea) scrollArea.scrollTop = scrollArea.scrollHeight
})

defineExpose({
  focusInput: () => {
    chatPanel.value?.querySelector<HTMLInputElement>("#live-message")?.focus()
  },
})
</script>
