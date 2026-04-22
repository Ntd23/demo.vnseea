  <div class="absolute inset-x-0 bottom-0 flex h-full items-end justify-between p-8 pb-12 sm:p-10 sm:pb-16 pointer-events-none">
    <div class="flex-1 min-w-0 pr-16 pointer-events-auto">
      <div class="flex items-center gap-4">
        <div class="p-0.5 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-2xl">
          <UAvatar
            :src="reel.avatar"
            :alt="reel.author"
            size="lg"
            class="rounded-[14px] ring-2 ring-black/20"
          />
        </div>
        <div class="min-w-0 space-y-0.5">
          <p class="truncate text-base font-black text-white tracking-tight uppercase">{{ reel.author }}</p>
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-bold text-white/60 uppercase tracking-widest">{{ reel.subtitle }}</span>
            <span class="h-1 w-1 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(37,99,235,1)]" />
          </div>
        </div>
      </div>

      <div class="mt-6 space-y-3">
        <h2 class="text-2xl font-black text-white leading-tight tracking-tight drop-shadow-2xl">
          {{ reel.title }}
        </h2>
        <p class="line-clamp-2 text-[13px] font-medium leading-relaxed text-white/80 sm:max-w-md drop-shadow-lg italic">
          "{{ reel.description }}"
        </p>
      </div>

      <!-- Progressive Tags -->
      <div class="mt-6 flex flex-wrap gap-2 opacity-80">
        <span v-for="tag in ['#trending', '#reel']" :key="tag" class="text-[10px] font-black uppercase tracking-widest text-primary-400 bg-black/40 px-3 py-1 rounded-lg backdrop-blur-md border border-white/5">
          {{ tag }}
        </span>
      </div>
    </div>

    <!-- Actions Sidebar -->
    <div class="flex flex-col items-center gap-6 pb-2 pointer-events-auto">
      <div class="flex flex-col items-center gap-2 group/action cursor-pointer">
        <div class="flex h-14 w-14 items-center justify-center rounded-[20px] bg-black/40 text-white backdrop-blur-2xl ring-1 ring-white/10 shadow-2xl transition-all duration-300 group-hover/action:bg-primary-600 group-hover/action:scale-110 group-hover/action:-rotate-6 group-hover/action:ring-primary-400">
          <Icon name="i-ph-heart-duotone" class="h-7 w-7 transition-colors group-hover/action:text-white" />
        </div>
        <span class="text-[10px] font-black text-white uppercase tracking-widest drop-shadow-2xl">{{ reel.likes }}</span>
      </div>

      <div class="flex flex-col items-center gap-2 group/action cursor-pointer">
        <div class="flex h-14 w-14 items-center justify-center rounded-[20px] bg-black/40 text-white backdrop-blur-2xl ring-1 ring-white/10 shadow-2xl transition-all duration-300 group-hover/action:bg-white group-hover/action:text-secondary-900 group-hover/action:scale-110 group-hover/action:rotate-6">
          <Icon name="i-ph-chat-circle-text-duotone" class="h-7 w-7" />
        </div>
        <span class="text-[10px] font-black text-white uppercase tracking-widest drop-shadow-2xl">{{ reel.comments }}</span>
      </div>

      <div class="flex flex-col items-center gap-2 group/action cursor-pointer">
        <div class="flex h-14 w-14 items-center justify-center rounded-[20px] bg-black/40 text-white backdrop-blur-2xl ring-1 ring-white/10 shadow-2xl transition-all duration-300 group-hover/action:bg-white group-hover/action:text-secondary-900 group-hover/action:scale-110 group-hover/action:-rotate-6">
          <Icon name="i-ph-share-network-duotone" class="h-7 w-7" />
        </div>
        <span class="text-[10px] font-black text-white uppercase tracking-widest drop-shadow-2xl">{{ $t('pages.reelsPage.share') }}</span>
      </div>

      <div class="flex flex-col items-center gap-2 group/action cursor-pointer">
        <div class="flex h-14 w-14 items-center justify-center rounded-[20px] bg-black/40 text-white backdrop-blur-2xl ring-1 ring-white/10 shadow-2xl transition-all duration-300 group-hover/action:bg-white group-hover/action:text-secondary-900 group-hover/action:scale-110 group-hover/action:rotate-6">
          <Icon name="i-ph-bookmark-simple-duotone" class="h-7 w-7" />
        </div>
        <span class="text-[10px] font-black text-white uppercase tracking-widest drop-shadow-2xl">{{ $t('pages.reelsPage.save') }}</span>
      </div>
    </div>
  </div>
