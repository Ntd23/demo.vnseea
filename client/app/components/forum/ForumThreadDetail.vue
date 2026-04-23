<template>
  <aside class="space-y-4">
    <UCard
      v-if="thread"
      class="rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]"
      :ui="{ body: 'p-5 sm:p-6' }"
    >
      <p class="text-label-secondary text-[var(--text-tertiary)]">
        {{ t("pages.forumPage.threadDetailEyebrow") }}
      </p>
      <h2 class="mt-2 text-xl font-black leading-tight text-[var(--text-primary)]">
        {{ thread.title }}
      </h2>
      <p class="mt-3 text-[13px] font-semibold leading-6 text-[var(--text-secondary)]">
        {{ thread.excerpt }}
      </p>

      <UAlert
        class="mt-4 rounded-[22px]"
        color="neutral"
        variant="subtle"
        icon="i-ph-info-fill"
        :title="thread.sectionLabel"
        :description="statusLabel"
      />

      <div class="mt-4 flex flex-wrap gap-2">
        <UBadge
          v-for="tag in thread.tags"
          :key="tag"
          color="primary"
          variant="subtle"
          class="rounded-full px-3 py-1.5 text-[12px] font-bold"
        >
          #{{ tag }}
        </UBadge>
      </div>
    </UCard>

    <UCard
      id="forum-thread-detail"
      class="rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]"
      :ui="{ body: 'p-5 sm:p-6' }"
    >
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-label-secondary text-[var(--text-tertiary)]">
            {{ t("pages.forumPage.repliesLabel") }}
          </p>
          <h3 class="mt-1 text-heading text-[var(--text-primary)]">
            {{ t("pages.forumPage.repliesTitle") }}
          </h3>
        </div>
        <UBadge color="primary" variant="subtle" class="rounded-full px-3 py-1.5 text-[12px] font-bold">
          {{ replies.length }}
        </UBadge>
      </div>

      <UAlert
        v-if="statusAlert"
        :color="statusAlert.color"
        variant="subtle"
        :icon="statusAlert.icon"
        :title="statusAlert.title"
        :description="statusAlert.description"
        class="mt-4 rounded-[22px]"
        aria-live="polite"
      />

      <UAlert
        v-if="!thread"
        class="mt-4 rounded-[22px]"
        color="neutral"
        variant="subtle"
        icon="i-ph-chat-circle-dots-fill"
        :title="t('pages.forumPage.detailEmptyTitle')"
        :description="t('pages.forumPage.detailEmptyDescription')"
      />

      <div v-else-if="replies.length === 0" class="mt-4">
        <UAlert
          class="rounded-[22px]"
          color="neutral"
          variant="subtle"
          icon="i-ph-chat-dots-bold"
          :title="t('pages.forumPage.repliesEmptyTitle')"
          :description="t('pages.forumPage.repliesEmptyDescription')"
        />
      </div>

      <div v-else class="mt-4 space-y-3" role="list" aria-live="polite">
        <div
          v-for="reply in replies"
          :key="reply.id"
          class="rounded-[22px] border border-[var(--border-default)] bg-[var(--bg-surface-hover)] p-3"
          role="listitem"
        >
          <div class="flex gap-3">
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-500)] text-[12px] font-black text-white">
              {{ reply.initials }}
            </div>
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <p class="text-[13px] font-extrabold text-[var(--text-primary)]">
                  {{ reply.author }}
                </p>
                <span class="text-[11px] font-semibold text-[var(--text-tertiary)]">
                  {{ reply.role }}
                </span>
                <UBadge
                  v-if="reply.accepted"
                  color="success"
                  variant="soft"
                  class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                >
                  {{ t("pages.forumPage.acceptedLabel") }}
                </UBadge>
              </div>
              <p class="mt-1 text-[13px] font-semibold leading-5 text-[var(--text-secondary)]">
                {{ reply.message }}
              </p>
              <p class="mt-1 text-[11px] font-semibold text-[var(--text-tertiary)]">
                {{ reply.time }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <UForm :state="{ message }" class="mt-5" @submit="submit">
        <UFormField
          name="message"
          :label="t('pages.forumPage.replyFieldLabel')"
          size="xl"
          class="space-y-2"
          :error="fieldError || undefined"
        >
          <UTextarea
            v-model="message"
            autoresize
            :rows="5"
            :disabled="isBusy || !thread"
            :placeholder="t('pages.forumPage.replyPlaceholder')"
            color="primary"
            size="xl"
            class="w-full"
            :ui="{
              base: 'min-h-[120px] resize-y rounded-[20px] border-[var(--border-default)] bg-[var(--bg-surface-hover)] px-4 py-3 text-[14px] leading-6 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]',
            }"
          />
        </UFormField>

        <div class="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-[12px] font-semibold text-[var(--text-secondary)]">
            {{ t("pages.forumPage.replyHelper", { count: message.trim().length }) }}
          </p>

          <UButton
            type="submit"
            color="primary"
            size="lg"
            class="rounded-full"
            :loading="isBusy"
            :disabled="isBusy || !thread || message.trim().length === 0"
          >
            <Icon name="i-ph-paper-plane-tilt-fill" class="mr-1.5 h-4 w-4" />
            {{ t("pages.forumPage.replySubmit") }}
          </UButton>
        </div>
      </UForm>
    </UCard>
  </aside>
</template>

<script setup lang="ts">
import type { ForumReply, ForumThread } from "~/composables/useMockForumData"

type ReplySubmitStatus = "idle" | "loading" | "success" | "error"

const props = defineProps<{
  thread: ForumThread | null
  replies: ReadonlyArray<ForumReply>
  statusLabel: string
}>()

const { t } = useI18n()
const toast = useToast()

const emit = defineEmits<{
  reply: [message: string]
}>()

const message = ref("")
const fieldError = ref("")
const submitStatus = ref<ReplySubmitStatus>("idle")

const isBusy = computed(() => submitStatus.value === "loading")

const statusAlert = computed(() => {
  if (submitStatus.value === "idle") return null

  if (submitStatus.value === "loading") {
    return {
      color: "primary" as const,
      icon: "i-ph-spinner-gap-bold",
      title: t("pages.forumPage.replyStatusLoadingTitle"),
      description: t("pages.forumPage.replyStatusLoadingDescription"),
    }
  }

  if (submitStatus.value === "success") {
    return {
      color: "success" as const,
      icon: "i-ph-check-circle-fill",
      title: t("pages.forumPage.replyStatusSuccessTitle"),
      description: t("pages.forumPage.replyStatusSuccessDescription"),
    }
  }

  return {
    color: "warning" as const,
    icon: "i-ph-warning-circle-fill",
    title: t("pages.forumPage.replyStatusErrorTitle"),
    description: t("pages.forumPage.replyStatusErrorDescription"),
  }
})

watch(
  () => props.thread?.id,
  () => {
    message.value = ""
    fieldError.value = ""
    submitStatus.value = "idle"
  },
  { immediate: true },
)

watch(message, () => {
  fieldError.value = ""

  if (submitStatus.value !== "loading") {
    submitStatus.value = "idle"
  }
})

async function submit() {
  const value = message.value.trim()

  if (!props.thread || value.length < 8) {
    fieldError.value = t("pages.forumPage.replyFieldError")
    submitStatus.value = "error"
    return
  }

  submitStatus.value = "loading"

  await new Promise(resolve => setTimeout(resolve, 220))

  emit("reply", value)
  message.value = ""
  fieldError.value = ""
  submitStatus.value = "success"

  toast.add({
    color: "success",
    icon: "i-ph-check-circle-fill",
    title: t("pages.forumPage.replyStatusSuccessTitle"),
    description: t("pages.forumPage.replyStatusSuccessDescription"),
  })
}
</script>
