<!-- English description: Renders the compact emoji picker used by the message composer. -->
<template>
  <UPopover :popper="{ placement: 'top-end' }">
    <UButton
      variant="soft"
      color="white"
      class="flex h-10 w-10 items-center justify-center p-0 text-[var(--text-primary)] shadow-none transition-colors hover:text-[var(--text-brand)]"
      square
    >
      <Icon name="i-ph-smiley-duotone" class="h-6 w-6" />
    </UButton>

    <template #panel>
      <div class="grid max-w-[280px] grid-cols-6 gap-2 rounded-2xl border border-[var(--border-light)] bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-lg)]">
        <button
          v-for="emoji in popularEmojis"
          :key="emoji"
          class="text-xl transition-all hover:scale-125 active:scale-95 p-1"
          @click="$emit('select', emoji)"
        >
          {{ emoji }}
        </button>
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
const popularEmojis = ['😀', '😂', '🥰', '😍', '😎', '🤩', '😘', '😋', '😛', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '😴']

defineEmits<{
  select: [emoji: string]
}>()
</script>
