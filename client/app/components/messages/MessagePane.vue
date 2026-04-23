<template>
  <div class="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white ring-1 ring-secondary-100 shadow-xl">
    <!-- Chat Header -->
    <div class="shrink-0 bg-white px-6 py-4 border-b border-secondary-100 shadow-sm relative z-10">
      <div class="flex items-center justify-between gap-4">
        <div class="flex min-w-0 cursor-pointer items-center gap-4 rounded-2xl p-2 transition-all duration-300 hover:bg-secondary-50 group">
          <div class="relative shrink-0">
            <UAvatar
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
              size="lg"
              class="ring-2 ring-white shadow-md"
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
            class="h-11 w-11 rounded-xl bg-primary-50 text-primary-600 ring-1 ring-primary-100 hover:bg-primary-600 hover:text-white transition-all shadow-sm active:scale-90"
            square
          >
            <Icon :name="btn.icon" class="h-5 w-5" />
          </UButton>
        </div>
      </div>
    </div>

    <!-- Messages Area -->
    <div class="flex-1 min-h-0 overflow-y-auto bg-secondary-50/20 px-6 py-8 space-y-6 scrollbar-hide">
      <div class="flex justify-center pb-4">
        <UButton
          variant="soft"
          size="sm"
          class="rounded-full font-black text-[9px] uppercase tracking-[0.2em] px-6 bg-white text-secondary-400 ring-1 ring-secondary-100/50 hover:bg-primary-50 hover:text-primary-600 transition-all shadow-sm"
        >
          {{ $t('pages.messagesPage.loadOlder') }}
        </UButton>
      </div>

      <div v-for="(msg, idx) in messages" :key="idx" class="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500" :class="msg.isMine ? 'items-end' : 'items-start'">
        <div v-if="msg.showTime" class="self-center my-6">
          <span class="px-4 py-1 rounded-full bg-secondary-100/50 text-[9px] font-black uppercase tracking-[0.2em] text-secondary-400">
            {{ msg.time }}
          </span>
        </div>

        <div class="flex max-w-[85%] items-end gap-3 sm:max-w-[75%]">
          <div v-if="!msg.isMine" class="shrink-0 mb-1">
            <UAvatar
              v-if="msg.isLast"
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
              size="xs"
              class="ring-1 ring-white shadow-sm"
              :ui="{ rounded: 'rounded-[8px]' }"
            />
            <div v-else class="w-8" />
          </div>

          <div class="group relative">
            <div 
              class="relative whitespace-pre-wrap px-5 py-3.5 text-sm leading-relaxed shadow-md transition-all duration-300" 
              :class="[
                msg.isMine 
                  ? 'rounded-[20px] rounded-br-md bg-gradient-to-br from-primary-600 to-primary-700 text-white font-medium ring-1 ring-primary-500/50 hover:shadow-primary-500/20' 
                  : 'rounded-[20px] rounded-bl-md bg-white text-secondary-800 font-medium ring-1 ring-secondary-100 hover:ring-primary-500/20'
              ]"
            >
              {{ msg.text }}
            </div>
          </div>
        </div>
      </div>

      <!-- Typing Indicator -->
      <div class="flex items-center gap-3 max-w-[75%]">
        <UAvatar
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
          size="xs"
          class="ring-1 ring-white shadow-sm"
          :ui="{ rounded: 'rounded-[8px]' }"
        />
        <div class="flex h-9 items-center gap-1.5 rounded-[18px] rounded-bl-md bg-white px-4 ring-1 ring-secondary-100 shadow-sm">
          <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-400" style="animation-delay: 0ms"></span>
          <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-500" style="animation-delay: 150ms"></span>
          <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-600" style="animation-delay: 300ms"></span>
        </div>
      </div>
    </div>

    <!-- Message Input -->
    <div class="shrink-0 bg-white px-6 py-6 border-t border-secondary-100 relative z-10">
      <div class="flex items-end gap-3 max-w-[1200px] mx-auto">
        <UButton
          variant="soft"
          class="h-12 w-12 rounded-2xl bg-secondary-50 text-secondary-400 hover:bg-primary-50 hover:text-primary-600 transition-all flex-shrink-0"
          square
        >
          <Icon name="i-ph-plus-circle-duotone" class="h-6 w-6" />
        </UButton>

        <div class="hidden shrink-0 items-center gap-2 lg:flex">
          <UButton
            v-for="icon in ['i-ph-image-duotone', 'i-ph-sticker-duotone', 'i-ph-gif-duotone']"
            :key="icon"
            variant="soft"
            class="h-12 w-12 rounded-2xl bg-secondary-50 text-secondary-400 hover:bg-primary-50 hover:text-primary-600 transition-all"
            square
          >
            <Icon :name="icon" class="h-6 w-6" />
          </UButton>
        </div>

        <div class="flex-1 relative group">
          <textarea 
            rows="1" 
            class="w-full max-h-[140px] rounded-2xl bg-secondary-50/50 px-6 py-4 text-sm font-medium text-secondary-900 border-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-300 outline-none resize-none no-scrollbar pr-14" 
            :placeholder="$t('pages.messagesPage.composerPlaceholder')" 
          />
          <button class="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center text-secondary-400 hover:text-primary-600 transition-colors">
            <Icon name="i-ph-smiley-duotone" class="h-6 w-6" />
          </button>
        </div>

        <UButton
          class="h-12 w-12 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-black shadow-xl shadow-primary-500/20 transition-all active:scale-95 flex-shrink-0"
          square
        >
          <Icon name="i-ph-paper-plane-tilt-bold" class="h-6 w-6" />
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const messages = computed(() => [
  { text: t('pages.messagesPage.messageOne'), isMine: false, time: t('pages.messagesPage.messageTimeOne'), showTime: true, isLast: false },
  { text: t('pages.messagesPage.messageTwo'), isMine: false, isLast: true },
  { text: t('pages.messagesPage.messageThree'), isMine: true, isLast: false },
  { text: t('pages.messagesPage.messageFour'), isMine: true, isLast: true },
  { text: t('pages.messagesPage.messageFive'), isMine: false, time: t('pages.messagesPage.messageTimeTwo'), showTime: true, isLast: false },
  { text: t('pages.messagesPage.messageSix'), isMine: false, isLast: true },
  { text: t('pages.messagesPage.messageSeven'), isMine: true, time: t('pages.messagesPage.messageTimeThree'), showTime: true, isLast: true },
])
</script>
