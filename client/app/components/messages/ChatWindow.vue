<template>
  <div class="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white ring-1 ring-secondary-100 shadow-xl">
    <!-- Chat Header -->
    <div class="shrink-0 bg-white px-6 py-4 border-b border-secondary-100 shadow-sm relative z-10">
      <div class="flex items-center justify-between gap-4">
        <div class="flex min-w-0 cursor-pointer items-center gap-4 rounded-2xl p-2 transition-all duration-300 hover:bg-secondary-50 group" @click="$emit('toggle-info')">
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
            <h3 class="truncate text-[13px] font-black uppercase tracking-widest text-secondary-900 group-hover:text-primary-600 transition-colors">{{ $t('pages.messagesPage.contactName') }}</h3>
            <div class="flex items-center gap-2">
              <span class="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <p class="text-[10px] font-bold uppercase tracking-widest text-secondary-400">{{ $t('pages.messagesPage.activeNow') }}</p>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <UButton
            v-for="btn in [{ icon: 'i-ph-phone-duotone', label: 'call' }, { icon: 'i-ph-video-camera-duotone', label: 'video' }, { icon: 'i-ph-info-duotone', label: 'info' }]"
            :key="btn.label"
            variant="soft"
            color="primary"
            class="h-11 w-11 rounded-xl bg-primary-50 text-primary-600 ring-1 ring-primary-100 hover:bg-primary-600 hover:text-white transition-all shadow-sm active:scale-90 justify-center h-11"
            square
            @click="btn.label === 'info' ? $emit('toggle-info') : null"
          >
            <Icon :name="btn.icon" class="h-5 w-5" />
          </UButton>
        </div>
      </div>
    </div>

    <!-- Messages Area -->
    <MessagesChatMessageList 
      :messages="messages" 
      :is-typing="isTyping"
      @load-more="onLoadMore"
    />

    <!-- Message Input -->
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
