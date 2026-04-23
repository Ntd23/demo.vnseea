<template>
  <section class="surface-card flex min-h-[620px] flex-col overflow-hidden border-none ring-1 ring-secondary-100 shadow-xl">
    <div class="shrink-0 bg-white px-6 py-5 border-b border-secondary-50 shadow-sm relative z-10">
      <div class="flex items-center justify-between gap-4">
        <div class="space-y-1">
          <p class="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500">
            {{ $t("pages.livePage.chatEyebrow") }}
          </p>
          <h2 class="text-xl font-black tracking-tight text-secondary-900 leading-none">
            {{ $t("pages.livePage.chatTitle") }}
          </h2>
        </div>
        <UBadge
          variant="soft"
          color="primary"
          class="rounded-full font-black text-[10px] uppercase tracking-widest px-4 py-1.5 ring-1 ring-inset ring-primary-100"
        >
          <template #leading>
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </template>
          {{ $t("pages.livePage.commentCount", { count: comments.length }) }}
        </UBadge>
      </div>
    </div>

    <!-- Scrollable Comments Area -->
    <div 
      ref="scrollEl"
      class="flex-1 space-y-4 overflow-y-auto bg-secondary-50/20 px-6 py-6 scrollbar-hide"
    >
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500"
      >
        <UAvatar
          :src="`https://ui-avatars.com/api/?name=${comment.author}&background=0000ff&color=fff`"
          :alt="comment.author"
          size="sm"
          class="shrink-0 shadow-sm ring-2 ring-white"
          :ui="{ rounded: 'rounded-[12px]' }"
        />
        <div class="flex-1 min-w-0 space-y-1.5 pt-0.5">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-[12px] font-black uppercase tracking-widest text-secondary-900">{{ comment.author }}</span>
            <UBadge
              v-if="comment.isHost"
              variant="solid"
              size="xs"
              color="primary"
              class="rounded-md font-black text-[8px] uppercase tracking-widest px-2 py-0.5"
            >
              {{ $t("pages.livePage.hostBadge") }}
            </UBadge>
            <span class="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">{{ comment.time }}</span>
          </div>
          <div class="rounded-2xl rounded-tl-none bg-white px-5 py-3.5 ring-1 ring-secondary-100 shadow-sm">
            <p class="text-[13px] font-medium leading-relaxed text-secondary-700">{{ comment.message }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Footer -->
    <div class="shrink-0 bg-white p-6 border-t border-secondary-50 relative z-10">
      <form class="space-y-4" @submit.prevent="submit">
        <label class="sr-only" for="live-message">{{ $t("pages.livePage.chatInputLabel") }}</label>
        <div class="flex gap-3">
          <UInput
            id="live-message"
            ref="inputRef"
            v-model="message"
            size="xl"
            class="flex-1"
            :placeholder="$t('pages.livePage.chatPlaceholder')"
            :ui="{
              base: 'h-12 rounded-2xl bg-secondary-50/50 border-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-300 font-medium text-secondary-900 px-6',
            }"
          />
          <UButton
            type="submit"
            size="xl"
            :disabled="message.trim().length === 0"
            class="h-12 w-12 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white shadow-xl shadow-primary-500/20 transition-all active:scale-95 justify-center"
            square
          >
            <Icon name="i-ph-paper-plane-tilt-bold" class="h-6 w-6" />
          </UButton>
        </div>
        <div class="flex items-center gap-2 px-1">
          <Icon name="i-ph-info-bold" class="h-3.5 w-3.5 text-secondary-400" />
          <p class="text-[10px] font-black uppercase tracking-widest text-secondary-400">
            {{ $t("pages.livePage.chatHint") }}
          </p>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { MockLiveComment } from "~/composables/useMockLiveData"

const props = defineProps<{
  comments: ReadonlyArray<MockLiveComment>
}>()

const emit = defineEmits<{ send: [message: string] }>()

const message = ref("")
const scrollEl = ref<HTMLElement | null>(null)
const inputRef = ref<any>(null)

const submit = () => {
  const value = message.value.trim()
  if (value.length === 0) return
  emit("send", value)
  message.value = ""
}

// Auto scroll on new comments
watch(() => props.comments.length, async () => {
  await nextTick()
  if (scrollEl.value) {
    scrollEl.value.scrollTo({
      top: scrollEl.value.scrollHeight,
      behavior: 'smooth'
    })
  }
})

onMounted(() => {
  if (scrollEl.value) {
    scrollEl.value.scrollTop = scrollEl.value.scrollHeight
  }
})

defineExpose({
  focusInput: () => {
    inputRef.value?.input?.focus()
  },
})
</script>
