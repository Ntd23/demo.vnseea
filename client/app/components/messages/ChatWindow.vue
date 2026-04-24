<template>
  <div class="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[32px] border border-white/70 bg-white/86 shadow-[0_28px_70px_rgba(15,23,42,0.10)] backdrop-blur-sm">
    <div class="relative z-10 shrink-0 border-b border-secondary-100/80 bg-white/92 px-5 py-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:px-6">
      <div class="flex items-center justify-between gap-4">
        <div class="group flex min-w-0 cursor-pointer items-center gap-3 rounded-[22px] p-2 transition-all duration-300 hover:bg-secondary-50/90" @click="$emit('toggle-info')">
          <div class="relative shrink-0">
            <UAvatar
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
              size="lg"
              class="ring-2 ring-white shadow-md transition-transform group-hover:scale-105"
              :ui="{ rounded: 'rounded-[14px]' }"
            />
            <span class="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[3px] border-white bg-green-500 shadow-sm" />
          </div>
          <div class="min-w-0 space-y-1">
            <h3 class="truncate text-[13px] font-black uppercase tracking-[0.18em] text-secondary-900 transition-colors group-hover:text-primary-600">{{ $t('pages.messagesPage.contactName') }}</h3>
            <div class="flex items-center gap-2">
              <span class="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary-400">{{ $t('pages.messagesPage.activeNow') }}</p>
            </div>
          </div>
        </div>

        <div class="hidden items-center gap-2 rounded-[22px] bg-secondary-50/80 p-2 ring-1 ring-secondary-100/80 sm:flex">
          <UButton
            v-for="btn in actionButtons"
            :key="btn.label"
            variant="ghost"
            color="primary"
            class="h-10 w-10 rounded-[16px] text-primary-600 transition-all hover:bg-primary-600 hover:text-white active:scale-90 justify-center"
            square
            @click="btn.label === 'info' ? $emit('toggle-info') : null"
          >
            <Icon :name="btn.icon" class="h-5 w-5" />
          </UButton>
        </div>
      </div>
    </div>

    <MessagesChatMessageList 
      :messages="messages" 
      :is-typing="isTyping"
      @load-more="onLoadMore"
    />

    <MessagesChatInput 
      v-model="inputModel"
      @send="onSendMessage"
    />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

defineEmits<{
  'toggle-info': []
}>()

const actionButtons = [
  { icon: 'i-ph-phone-duotone', label: 'call' },
  { icon: 'i-ph-video-camera-duotone', label: 'video' },
  { icon: 'i-ph-info-duotone', label: 'info' }
] as const

const inputModel = ref("")
const isTyping = ref(true)

const messages = ref([
  { text: t('pages.messagesPage.messageOne'), isMine: false, time: t('pages.messagesPage.messageTimeOne'), showTime: true, isLast: false },
  { text: t('pages.messagesPage.messageTwo'), isMine: false, isLast: true },
  { text: t('pages.messagesPage.messageThree'), isMine: true, isLast: false },
  { text: t('pages.messagesPage.messageFour'), isMine: true, isLast: true },
  { text: t('pages.messagesPage.messageFive'), isMine: false, time: t('pages.messagesPage.messageTimeTwo'), showTime: true, isLast: false },
  { text: t('pages.messagesPage.messageSix'), isMine: false, isLast: true },
  { text: t('pages.messagesPage.messageSeven'), isMine: true, time: t('pages.messagesPage.messageTimeThree'), showTime: true, isLast: true },
])

function onSendMessage(text: string) {
  messages.value.push({
    text,
    isMine: true,
    isLast: true,
    showTime: messages.value.length % 5 === 0,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })
}

function onLoadMore() {
  // Mock load more
  console.log('Loading older messages...')
}
</script>
