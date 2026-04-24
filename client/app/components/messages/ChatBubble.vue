<template>
  <div 
    class="flex w-full flex-col animate-in fade-in slide-in-from-bottom-2 duration-500"
  >
    <div v-if="showTime" class="my-3 self-center sm:my-4">
      <span class="rounded-full bg-white/92 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.24em] text-secondary-900 ring-1 ring-secondary-100 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
        {{ time }}
      </span>
    </div>

    <div class="flex w-full items-end gap-3" :class="isMine ? 'justify-end' : 'justify-start'">
      <div v-if="!isMine" class="mb-1 shrink-0 self-end">
        <UAvatar
          v-if="isLast"
          :src="avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'"
          size="xs"
          class="ring-1 ring-white shadow-sm"
          :ui="{ rounded: 'rounded-[8px]' }"
        />
        <div v-else class="w-8" />
      </div>

      <div class="group relative w-fit max-w-[84%] sm:max-w-[74%] lg:max-w-[42rem]">
        <div 
          class="relative whitespace-pre-wrap px-5 py-3.5 text-[15px] leading-7 shadow-md transition-all duration-300" 
          :class="[
            isMine 
              ? 'rounded-[24px] rounded-br-lg bg-gradient-to-br from-primary-500 via-primary-600 to-sky-600 text-white font-medium ring-1 ring-primary-500/40 shadow-[0_16px_34px_rgba(14,165,233,0.22)] hover:shadow-[0_20px_40px_rgba(14,165,233,0.25)]' 
              : 'rounded-[24px] rounded-bl-lg bg-white/96 text-secondary-800 font-medium ring-1 ring-secondary-100 shadow-[0_16px_34px_rgba(15,23,42,0.06)] hover:ring-primary-500/20'
          ]"
        >
          {{ text }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  text: string
  isMine: boolean
  isLast?: boolean
  time?: string
  showTime?: boolean
  avatar?: string
}>()
</script>
