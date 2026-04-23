<template>
  <button
    class="surface-card flex items-center justify-between gap-4 p-4 transition-all duration-300 hover:ring-2 hover:ring-primary-500/20 hover:scale-[1.01] group ring-1 ring-secondary-100/50 shadow-md bg-white text-left w-full"
    type="button"
    @click="$emit('click')"
  >
    <div class="flex items-center gap-4 min-w-0">
      <div class="relative shrink-0">
        <UAvatar
          :src="avatarUrl"
          :alt="name"
          size="xl"
          class="ring-2 ring-white shadow-lg"
          :ui="{ rounded: 'rounded-[18px]' }"
        />
        <span 
          class="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-white shadow-sm"
          :class="isOnline ? 'bg-green-500' : 'bg-secondary-300'"
        />
      </div>
      <div class="min-w-0 space-y-1">
        <p class="truncate text-[13px] font-black uppercase tracking-widest text-secondary-900 group-hover:text-primary-600 transition-colors">{{ name }}</p>
        <div class="flex items-center gap-2">
          <span class="h-1.5 w-1.5 rounded-full" :class="isOnline ? 'bg-green-500' : 'bg-secondary-300'" />
          <p class="truncate text-[10px] font-bold uppercase tracking-widest text-secondary-400">{{ status }}</p>
        </div>
      </div>
    </div>

    <UButton
      size="md"
      variant="soft"
      class="rounded-xl font-black text-[10px] uppercase tracking-widest px-6 bg-primary-50 text-primary-600 ring-1 ring-primary-100 hover:bg-primary-600 hover:text-white transition-all shadow-sm active:scale-95"
    >
      <template #leading>
        <Icon name="i-ph-chat-circle-dots-duotone" class="h-4 w-4" />
      </template>
      {{ $t('pages.messagesPage.openChat') }}
    </UButton>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  avatarUrl?: string
  status: string
  isOnline?: boolean
}>()

defineEmits<{
  click: []
}>()
</script>
