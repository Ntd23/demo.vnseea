<template>
  <div class="scrollbar-hide flex h-full w-full flex-col overflow-y-auto rounded-[32px] border border-white/70 bg-white/86 px-5 py-6 shadow-[0_28px_70px_rgba(15,23,42,0.10)] backdrop-blur-sm sm:px-6">
    <div class="flex flex-col items-center border-b border-secondary-100/80 pb-8">
      <div class="group relative mb-4 cursor-pointer">
        <UAvatar
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
          size="3xl"
          class="ring-4 ring-white shadow-xl transition-transform duration-500 group-hover:scale-105"
          :ui="{ rounded: 'rounded-[24px]' }"
        />
        <span class="absolute bottom-0 right-0 h-6 w-6 rounded-full border-4 border-white bg-green-500 shadow-sm" />
      </div>
      <h3 class="text-[15px] font-black uppercase tracking-[0.18em] leading-none text-secondary-900">{{ $t('pages.messagesPage.contactName') }}</h3>
      <div class="mt-2 flex items-center gap-2">
        <span class="h-1.5 w-1.5 rounded-full bg-green-500" />
        <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary-400">{{ $t('pages.messagesPage.activeNow') }}</p>
      </div>

      <div class="mt-8 flex gap-4">
        <button 
          v-for="action in [
            { icon: 'i-ph-user-duotone', label: $t('pages.messagesPage.profile') },
            { icon: 'i-ph-bell-duotone', label: $t('pages.messagesPage.muteNotifications') },
            { icon: 'i-ph-magnifying-glass-duotone', label: $t('pages.messagesPage.search') }
          ]"
          :key="action.label"
          class="group flex flex-col items-center gap-2 text-secondary-400 transition-all hover:text-primary-600"
        >
          <span class="flex h-11 w-11 items-center justify-center rounded-[18px] bg-secondary-50 ring-1 ring-secondary-100 transition-all group-hover:bg-primary-50 group-hover:ring-primary-100 group-hover:shadow-lg group-hover:shadow-primary-500/10">
            <Icon :name="action.icon" class="h-5 w-5" />
          </span>
          <span class="text-[9px] font-black uppercase tracking-[0.18em]">{{ action.label }}</span>
        </button>
      </div>
    </div>

    <div class="flex-1 space-y-2 py-4">
      <button 
        v-for="section in [
          $t('pages.messagesPage.chatInfo'),
          $t('pages.messagesPage.chatCustomize'),
          $t('pages.messagesPage.mediaFilesLinks'),
          $t('pages.messagesPage.privacySupport')
        ]"
        :key="section"
        class="group flex w-full items-center justify-between rounded-[22px] border border-transparent bg-white/70 p-4 text-[10px] font-black uppercase tracking-[0.18em] text-secondary-900 transition-all duration-300 hover:border-primary-100 hover:bg-secondary-50 hover:text-primary-600"
      >
        <span class="flex items-center gap-3">
          <Icon name="i-ph-folder-simple-duotone" class="h-4 w-4 text-primary-500 group-hover:scale-110 transition-transform" />
          {{ section }}
        </span>
        <Icon name="i-ph-caret-right-bold" class="h-3 w-3 text-secondary-300 group-hover:text-primary-500 transition-all group-hover:translate-x-1" />
      </button>
    </div>
  </div>
</template>
