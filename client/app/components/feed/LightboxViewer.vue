<template>
  <FoundationDrawerShell :open="open" :title="$t('feed.lightboxViewer.title')">
    <div class="mock-image rounded-[28px] p-5">
      <div class="flex min-h-72 items-end rounded-[24px] border border-white/50 p-5">
        <div class="rounded-2xl bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700">
          {{ $t("feed.lightboxViewer.mockLabel") }}
        </div>
      </div>
    </div>
  </FoundationDrawerShell>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ open?: boolean }>(), {
  open: false,
})
</script>
