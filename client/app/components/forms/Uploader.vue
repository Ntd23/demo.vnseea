<template>
  <div class="rounded-[28px] border border-dashed border-[#0000ff]/25 bg-[#0000ff]/5 p-4">
    <div class="flex flex-wrap items-center gap-3">
      <button class="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#0000ff] shadow-sm" type="button">
        Chon anh
      </button>
      <button class="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#0000ff] shadow-sm" type="button">
        Them video
      </button>
      <p class="text-xs text-[#0000ff]/50">Uploader nay dang o che do mock, chi preview giao dien.</p>
    </div>
    <FormsMediaPreviewList v-if="items.length" class="mt-4" :items="items" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  items: { name: string }[]
}>()
</script>
