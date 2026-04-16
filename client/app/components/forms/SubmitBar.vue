<template>
  <div class="flex flex-col gap-3 rounded-[28px] border border-[#0000ff]/10 bg-white/80 p-4 md:flex-row md:items-center md:justify-between">
    <p class="text-sm text-[#0000ff]/50">{{ hint }}</p>
    <div class="flex items-center gap-3">
      <button
        class="rounded-full border border-[#0000ff]/20 bg-white px-5 py-2.5 text-sm font-semibold text-[#0000ff]/70 transition hover:border-[#0000ff]/40 hover:text-[#0000ff]"
        type="button"
      >Luu nhap</button>
      <button
        class="rounded-full bg-[#0000ff] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,0,255,0.25)] transition hover:bg-[#0000cc]"
        type="button"
      >{{ cta }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  hint?: string
  cta?: string
}>(), {
  hint: "Mock state: form nay chua submit that.",
  cta: "Tiep tuc",
})
</script>
