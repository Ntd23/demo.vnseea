<template>
  <section class="surface-card p-5 sm:p-6">
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-label-primary text-[var(--text-primary)] uppercase tracking-widest">{{ $t("pages.watchPage.commentsEyebrow") }}</p>
        <h2 class="mt-1 text-heading text-[var(--text-primary)]">{{ $t("pages.watchPage.commentsTitle") }}</h2>
      </div>
      <UBadge
        :label="comments.length.toString()"
        size="md"
        variant="subtle"
        color="primary"
        class="rounded-full px-3 font-bold"
      />
    </div>

    <form class="mt-6 flex gap-3" @submit.prevent="submit">
      <UInput
        v-model="message"
        class="flex-1 font-semibold"
        size="xl"
        variant="outline"
        :placeholder="$t('pages.watchPage.commentPlaceholder')"
      />
      <UButton
        type="submit"
        size="xl"
        color="primary"
        class="rounded-full px-5 shadow-lg shadow-primary-500/20"
        :disabled="message.trim().length === 0"
      >
        <template #leading>
          <Icon name="i-ph-paper-plane-tilt-fill" class="h-5 w-5" />
        </template>
      </UButton>
    </form>

    <div class="mt-8 space-y-4">
      <div v-for="comment in comments" :key="comment.id" class="group flex gap-4 rounded-2xl bg-secondary-50/50 p-4 transition hover:bg-secondary-50 border border-secondary-100/30">
        <UAvatar
          :alt="comment.author"
          size="md"
          class="font-black text-white bg-primary-500"
          :text="comment.initials"
        />
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <p class="text-sm font-black text-[var(--text-primary)]">{{ comment.author }}</p>
            <UBadge :label="comment.role" size="xs" variant="subtle" color="gray" class="font-bold text-[10px] uppercase tracking-wider" />
            <span class="text-xs font-semibold text-[var(--text-primary)]">· {{ comment.time }}</span>
          </div>
          <p class="mt-1.5 text-sm font-medium leading-relaxed text-[var(--text-primary)]">{{ comment.message }}</p>
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
