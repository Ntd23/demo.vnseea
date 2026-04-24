<template>
  <button
    class="group flex w-full items-center justify-between gap-3 rounded-[24px] border border-white/80 bg-white/92 px-4 py-4 text-left shadow-[0_16px_38px_rgba(15,23,42,0.07)] ring-1 ring-secondary-100/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-100 hover:shadow-[0_22px_46px_rgba(14,165,233,0.12)]"
    type="button"
    @click="$emit('click')"
  >
    <div class="flex min-w-0 flex-1 items-center gap-3">
      <div class="relative shrink-0">
        <UAvatar
          :src="avatarUrl"
          :alt="name"
          size="md"
          class="ring-2 ring-white shadow-md"
          :ui="{ rounded: 'rounded-[16px]' }"
        />
        <span 
          class="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[3px] border-white shadow-sm"
          :class="isOnline ? 'bg-sky-500' : 'bg-secondary-300'"
        />
      </div>
      <div class="min-w-0 space-y-1">
        <p class="truncate text-[12px] font-black uppercase tracking-[0.08em] text-secondary-900 transition-colors group-hover:text-secondary-900">{{ name }}</p>
        <div class="flex items-center gap-2 text-secondary-400">
          <span class="h-1.5 w-1.5 rounded-full" :class="isOnline ? 'bg-sky-500' : 'bg-secondary-300'" />
          <p class="truncate text-[11px] font-semibold tracking-normal">{{ status }}</p>
        </div>
      </div>
    </div>

    <UButton
      size="sm"
      variant="soft"
      class="h-10 shrink-0 rounded-full bg-primary-50 px-4 text-[10px] font-black uppercase tracking-[0.08em] text-primary-600 ring-1 ring-primary-100 transition-all shadow-none hover:bg-primary-600 hover:text-white active:scale-95 whitespace-nowrap"
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
