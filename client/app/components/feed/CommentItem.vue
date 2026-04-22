<template>
  <div class="flex gap-2.5">
    <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
      {{ initials }}
    </div>
    <div class="min-w-0 flex-1 rounded-2xl bg-[#f1f4fb] px-3 py-2.5">
      <div class="flex flex-wrap items-center gap-2">
        <p class="text-sm font-bold text-slate-900">{{ author }}</p>
        <span class="text-[11px] uppercase tracking-[0.16em] text-slate-400">{{ role }}</span>
      </div>
      <p class="mt-2 text-sm leading-6 text-slate-600">{{ text }}</p>

      <div class="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400">
        <UButton
          color="neutral"
          :variant="liked ? 'soft' : 'ghost'"
          size="xs"
          class="rounded-full"
          :aria-pressed="liked"
          @click="liked = !liked"
        >
          {{ liked ? t("feed.commentItem.likeActive") : t("feed.commentItem.like") }}
        </UButton>
        <UButton
          color="neutral"
          :variant="showReplies ? 'soft' : 'ghost'"
          size="xs"
          class="rounded-full"
          :aria-pressed="showReplies"
          @click="showReplies = !showReplies"
        >
          {{ t("feed.commentItem.reply") }}
        </UButton>
        <UButton
          color="neutral"
          :variant="showActions ? 'soft' : 'ghost'"
          size="xs"
          class="rounded-full"
          :aria-pressed="showActions"
          @click="showActions = !showActions"
        >
          {{ t("feed.commentItem.more") }}
        </UButton>
      </div>

      <UAlert
        v-if="actionMessage"
        class="mt-3 rounded-[18px]"
        color="primary"
        variant="subtle"
        icon="i-ph-check-circle-fill"
        :description="actionMessage"
      />

      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
      >
        <div v-if="showActions" class="mt-3 flex flex-wrap gap-2">
          <UButton
            v-for="action in actions"
            :key="action"
            color="neutral"
            variant="soft"
            size="xs"
            class="rounded-full"
            @click="selectAction(action)"
          >
            {{ action }}
          </UButton>
        </div>
      </Transition>

      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
      >
        <div v-if="showReplies" class="mt-3 space-y-2 border-l border-[#0000ff]/10 pl-3">
          <div v-for="reply in replies" :key="reply.id" class="flex gap-2.5">
            <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[9px] font-bold text-slate-600">
              {{ initialsFrom(reply.author) }}
            </div>
            <UCard class="min-w-0 flex-1 rounded-2xl bg-white" :ui="{ body: 'px-3 py-2' }">
              <p class="text-[12px] font-semibold text-slate-800">{{ reply.author }}</p>
              <p class="text-[12px] leading-relaxed text-slate-600">{{ reply.text }}</p>
            </UCard>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const toast = useToast()

const props = defineProps<{
  author: string
  role: string
  text: string
}>()

const initials = computed(() =>
  props.author
    .split(' ')
    .slice(0, 2)
    .map(part => part[0])
    .join(''),
)

const initialsFrom = (name: string) => name.split(' ').slice(0, 2).map(part => part[0]).join('')
const liked = ref(false)
const showReplies = ref(false)
const showActions = ref(false)
const actionMessage = ref("")
const actions = computed(() => [
  t("feed.commentItem.actionEdit"),
  t("feed.commentItem.actionDelete"),
  t("feed.commentItem.actionReport"),
  t("feed.commentItem.actionPin"),
])
const replies = computed(() => [
  { id: 1, author: "Mai Linh", text: t("feed.commentItem.replyText1") },
  { id: 2, author: "Quốc Bảo", text: t("feed.commentItem.replyText2") },
])

function selectAction(action: string) {
  actionMessage.value = action
  showActions.value = false

  toast.add({
    color: "primary",
    icon: "i-ph-check-circle-fill",
    title: props.author,
    description: action,
  })
}
</script>
