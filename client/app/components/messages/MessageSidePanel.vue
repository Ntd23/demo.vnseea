<template>
  <div class="flex h-full w-full flex-col overflow-y-auto bg-white scrollbar-hide py-4 px-3">
    <div class="flex flex-col items-center border-b border-[#0000ff]/5 pb-6 pt-2">
      <div class="relative mb-3">
        <img src="https://i.pravatar.cc/150?u=12" class="h-16 w-16 rounded-full object-cover">
        <span class="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
      </div>
      <h3 class="text-[17px] font-bold text-slate-900 font-secondary">{{ $t('pages.messagesPage.contactName') }}</h3>
      <p class="mt-0.5 text-[13px] text-slate-500">{{ $t('pages.messagesPage.activeNow') }}</p>

      <div class="mt-4 flex gap-5">
        <button class="flex flex-col items-center gap-1.5 text-slate-600 transition hover:text-[#0000ff]">
          <span class="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-slate-100 hover:bg-[#0000ff]/10">
            <Icon name="i-ph-user-fill" class="h-[18px] w-[18px]" />
          </span>
          <span class="text-[11px] font-medium">{{ $t('pages.messagesPage.profile') }}</span>
        </button>
        <button class="flex flex-col items-center gap-1.5 text-slate-600 transition hover:text-[#0000ff]">
          <span class="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-slate-100 hover:bg-[#0000ff]/10">
            <Icon name="i-ph-bell-fill" class="h-[18px] w-[18px]" />
          </span>
          <span class="text-[11px] font-medium">{{ $t('pages.messagesPage.muteNotifications') }}</span>
        </button>
        <button class="flex flex-col items-center gap-1.5 text-slate-600 transition hover:text-[#0000ff]">
          <span class="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-slate-100 hover:bg-[#0000ff]/10">
            <Icon name="i-ph-magnifying-glass-fill" class="h-[18px] w-[18px]" />
          </span>
          <span class="text-[11px] font-medium">{{ $t('pages.messagesPage.search') }}</span>
        </button>
      </div>
    </div>

    <div class="flex-1 space-y-1 py-2">
      <button class="flex w-full items-center justify-between rounded-[8px] p-3 text-[14px] font-semibold text-slate-800 transition hover:bg-slate-50">
        {{ $t('pages.messagesPage.chatInfo') }}
        <Icon name="i-ph-caret-down-bold" class="h-4 w-4 text-slate-400" />
      </button>
      <button class="flex w-full items-center justify-between rounded-[8px] p-3 text-[14px] font-semibold text-slate-800 transition hover:bg-slate-50">
        {{ $t('pages.messagesPage.chatCustomize') }}
        <Icon name="i-ph-caret-down-bold" class="h-4 w-4 text-slate-400" />
      </button>
      <button class="flex w-full items-center justify-between rounded-[8px] p-3 text-[14px] font-semibold text-slate-800 transition hover:bg-slate-50">
        {{ $t('pages.messagesPage.mediaFilesLinks') }}
        <Icon name="i-ph-caret-down-bold" class="h-4 w-4 text-slate-400" />
      </button>
      <button class="flex w-full items-center justify-between rounded-[8px] p-3 text-[14px] font-semibold text-slate-800 transition hover:bg-slate-50">
        {{ $t('pages.messagesPage.privacySupport') }}
        <Icon name="i-ph-caret-down-bold" class="h-4 w-4 text-slate-400" />
      </button>
    </div>
  </div>
</template>
