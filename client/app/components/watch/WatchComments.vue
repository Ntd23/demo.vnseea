<template>
  <section class="rounded-[30px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-md)]">
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-label-secondary text-[var(--text-tertiary)]">comments.php</p>
        <h2 class="mt-1 text-heading text-[var(--text-primary)]">Bình luận</h2>
      </div>
      <span class="rounded-[var(--radius-full)] bg-[var(--color-primary-50)] px-3 py-1.5 text-[12px] font-extrabold text-[var(--color-primary-600)]">
        {{ comments.length }}
      </span>
    </div>

    <form class="mt-4 flex gap-2" @submit.prevent="submit">
      <input
        v-model="message"
        class="h-12 min-w-0 flex-1 rounded-[var(--radius-full)] border border-[var(--border-default)] bg-[var(--bg-surface-hover)] px-4 text-[14px] font-semibold text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-strong)] focus:bg-white"
        placeholder="Viết bình luận..."
      >
      <button
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-brand)] disabled:opacity-50"
        :disabled="message.trim().length === 0"
        type="submit"
      >
        <Icon name="i-ph-paper-plane-tilt-fill" class="h-5 w-5" />
      </button>
    </form>

    <div class="mt-5 space-y-3">
      <div v-for="comment in comments" :key="comment.id" class="flex gap-3 rounded-[22px] bg-[var(--bg-surface-hover)] p-3">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-500)] text-[12px] font-black text-white">
          {{ comment.initials }}
        </div>
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <p class="text-[13px] font-extrabold text-[var(--text-primary)]">{{ comment.author }}</p>
            <span class="text-[11px] font-semibold text-[var(--text-tertiary)]">{{ comment.role }}</span>
            <span class="text-[11px] font-semibold text-[var(--text-tertiary)]">· {{ comment.time }}</span>
          </div>
          <p class="mt-1 text-[13px] font-semibold leading-5 text-[var(--text-secondary)]">{{ comment.message }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { WatchComment } from "~/composables/useMockWatchData"

defineProps<{
  comments: ReadonlyArray<WatchComment>
}>()

const emit = defineEmits<{ send: [message: string] }>()

const message = ref("")

const submit = () => {
  const value = message.value.trim()
  if (value.length === 0) return
  emit("send", value)
  message.value = ""
}
</script>
