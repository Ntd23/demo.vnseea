<!-- Description: Provides a compact backend-bound comment composer without fake attachment actions. -->
<template>
  <form class="comment-composer" @submit.prevent="submitComment">
    <div class="comment-composer__avatar" aria-hidden="true">
      <img
        v-if="currentUserAvatarUrl"
        :src="currentUserAvatarUrl"
        :alt="currentUserName"
        class="comment-composer__avatar-img"
      >
      <span v-else-if="currentUserInitials">{{ currentUserInitials }}</span>
      <Icon v-else name="i-ph-user-circle-fill" class="h-5 w-5" />
    </div>

    <div class="comment-composer__field">
      <UTextarea
        v-model="message"
        autoresize
        :rows="1"
        :placeholder="$t('feed.commentComposer.placeholder')"
        class="w-full"
        :disabled="submitting"
        :ui="{
          base: 'min-h-[44px] resize-none rounded-[22px] border-transparent bg-[#f0f2f5] px-4 py-3 pr-12 text-[14px] leading-5 text-slate-800 placeholder:text-slate-500 focus:bg-white',
        }"
        @keydown.enter.exact.prevent="submitComment"
      />
      <UButton
        type="submit"
        color="primary"
        variant="solid"
        size="xs"
        class="comment-composer__send"
        :loading="submitting"
        :disabled="submitting || !trimmedMessage"
        :aria-label="$t('feed.commentComposer.submit')"
      >
        <Icon name="i-ph-paper-plane-tilt-fill" class="h-4 w-4" />
      </UButton>
    </div>
  </form>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  currentUserName?: string
  currentUserAvatarUrl?: string
  submitting?: boolean
}>(), {
  currentUserName: "",
  currentUserAvatarUrl: "",
  submitting: false,
})

const emit = defineEmits<{
  submit: [message: string]
}>()

const message = ref("")
const trimmedMessage = computed(() => message.value.trim())
const currentUserInitials = computed(() => {
  const value = props.currentUserName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || "")
    .join("")

  return value
})

function submitComment() {
  if (!trimmedMessage.value || props.submitting) {
    return
  }

  emit("submit", trimmedMessage.value)
  message.value = ""
}
</script>

<style scoped>
.comment-composer {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.comment-composer__avatar {
  display: inline-flex;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 999px;
  background: #e2e8f0;
  color: #475569;
  font-size: 11px;
  font-weight: 800;
}

.comment-composer__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.comment-composer__field {
  position: relative;
  min-width: 0;
  flex: 1;
}

.comment-composer__send {
  position: absolute;
  right: 7px;
  bottom: 7px;
  width: 30px;
  height: 30px;
  justify-content: center;
  border-radius: 999px;
  padding: 0;
}
</style>
