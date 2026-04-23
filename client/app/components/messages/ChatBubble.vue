<template>
  <div 
    class="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500" 
    :class="isMine ? 'items-end' : 'items-start'"
  >
    <div v-if="showTime" class="self-center my-6">
      <span class="px-4 py-1 rounded-full bg-secondary-100/50 text-[9px] font-black uppercase tracking-[0.2em] text-secondary-400">
        {{ time }}
      </span>
    </div>

    <div class="flex max-w-[85%] items-end gap-3 sm:max-w-[75%]">
      <div v-if="!isMine" class="shrink-0 mb-1">
        <UAvatar
          v-if="isLast"
          :src="avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'"
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
            isMine 
              ? 'rounded-[20px] rounded-br-md bg-gradient-to-br from-primary-600 to-primary-700 text-white font-medium ring-1 ring-primary-500/50 hover:shadow-primary-500/20' 
              : 'rounded-[20px] rounded-bl-md bg-white text-secondary-800 font-medium ring-1 ring-secondary-100 hover:ring-primary-500/20'
          ]"
        >
          {{ text }}
        </div>
        
        <!-- Hover actions could go here -->
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
