<template>
  <aside class="space-y-4">
    <section class="rounded-[30px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-md)]">
      <p class="text-label-secondary text-[var(--text-tertiary)]">{{ t("pages.forumPage.threadDetailEyebrow") }}</p>
      <h2 class="mt-2 text-xl font-black leading-tight text-[var(--text-primary)]">{{ thread.title }}</h2>
      <p class="mt-3 text-[13px] font-semibold leading-6 text-[var(--text-secondary)]">{{ thread.excerpt }}</p>

      <div class="mt-4 flex flex-wrap gap-2">
        <span v-for="tag in thread.tags" :key="tag" class="rounded-[var(--radius-full)] bg-[var(--color-primary-50)] px-3 py-1.5 text-[12px] font-extrabold text-[var(--color-primary-600)]">{{ tag }}</span>
      </div>
    </section>

    <section class="rounded-[30px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-md)]">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-label-secondary text-[var(--text-tertiary)]">{{ t("pages.forumPage.repliesLabel") }}</p>
          <h3 class="mt-1 text-heading text-[var(--text-primary)]">{{ t("pages.forumPage.repliesTitle") }}</h3>
        </div>
        <span class="rounded-[var(--radius-full)] bg-[var(--color-primary-50)] px-3 py-1.5 text-[12px] font-extrabold text-[var(--color-primary-600)]">{{ replies.length }}</span>
      </div>

      <div class="mt-4 space-y-3">
        <div v-for="reply in replies" :key="reply.id" class="rounded-[22px] bg-[var(--bg-surface-hover)] p-3">
          <div class="flex gap-3">
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-500)] text-[12px] font-black text-white">{{ reply.initials }}</div>
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <p class="text-[13px] font-extrabold text-[var(--text-primary)]">{{ reply.author }}</p>
                <span class="text-[11px] font-semibold text-[var(--text-tertiary)]">{{ reply.role }}</span>
                <span v-if="reply.accepted" class="rounded-[var(--radius-full)] bg-[var(--color-success)]/10 px-2 py-0.5 text-[10px] font-black uppercase text-[var(--color-success)]">{{ t("pages.forumPage.acceptedLabel") }}</span>
              </div>
              <p class="mt-1 text-[13px] font-semibold leading-5 text-[var(--text-secondary)]">{{ reply.message }}</p>
              <p class="mt-1 text-[11px] font-semibold text-[var(--text-tertiary)]">{{ reply.time }}</p>
            </div>
          </div>
        </div>
      </div>

      <form class="mt-4" @submit.prevent="submit">
        <textarea
          v-model="message"
          class="min-h-[120px] w-full resize-y rounded-[22px] border border-[var(--border-default)] bg-[var(--bg-surface-hover)] px-4 py-3 text-[14px] font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--border-strong)] focus:bg-white"
          :placeholder="t('pages.forumPage.replyPlaceholder')"
        />
        <button
          class="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-full)] bg-[var(--color-primary-500)] px-5 text-[13px] font-extrabold text-white shadow-[var(--shadow-brand)] disabled:opacity-50"
          :disabled="message.trim().length === 0"
          type="submit"
        >
          <Icon name="i-ph-paper-plane-tilt-fill" class="h-4 w-4" />
          {{ t("pages.forumPage.replySubmit") }}
        </button>
      </form>
    </section>
  </aside>
</template>

<script setup lang="ts">
import type { ForumReply, ForumThread } from "~/composables/useMockForumData"

defineProps<{
  thread: ForumThread
  replies: ReadonlyArray<ForumReply>
}>()

const { t } = useI18n()
const emit = defineEmits<{ reply: [message: string] }>()
const message = ref("")

const submit = () => {
  const value = message.value.trim()
  if (!value) return
  emit("reply", value)
  message.value = ""
}
</script>
