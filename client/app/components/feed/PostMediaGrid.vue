<template>
  <div class="grid gap-3" :class="items.length > 1 ? 'md:grid-cols-2' : ''">
    <button
      v-for="(item, index) in items"
      :key="`${item.src}-${index}`"
      class="group relative overflow-hidden rounded-[28px] border border-[#dbe3f2] bg-[#f3f6fd] text-left shadow-[0_10px_26px_rgba(15,35,110,0.08)]"
      type="button"
      :aria-label="t('feed.postMediaGrid.openLabel', { index: index + 1 })"
      @click="emit('open', index)"
    >
      <img
        v-if="item.type === 'image'"
        :src="item.src"
        :alt="item.alt || t('feed.postMediaGrid.label', { index: index + 1 })"
        class="h-full min-h-56 w-full object-cover transition duration-200 group-hover:scale-[1.02]"
        loading="lazy"
      >
      <video
        v-else
        :aria-label="item.alt || t('feed.postMediaGrid.label', { index: index + 1 })"
        class="h-full min-h-56 w-full object-cover transition duration-200 group-hover:scale-[1.02]"
        muted
        playsinline
        preload="metadata"
      >
        <source :src="item.src" :type="item.mime || 'video/mp4'">
      </video>

      <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />

      <div class="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
        <div class="rounded-2xl bg-white/90 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-700 backdrop-blur">
          {{ t("feed.postMediaGrid.label", { index: index + 1 }) }}
        </div>

        <div class="inline-flex items-center gap-2 rounded-full bg-slate-950/55 px-3 py-2 text-[11px] font-semibold text-white backdrop-blur">
          <Icon :name="item.type === 'image' ? 'i-ph-image-bold' : 'i-ph-play-circle-bold'" class="h-4 w-4" />
          {{ item.type === "image" ? t("feed.postMediaGrid.imageType") : t("feed.postMediaGrid.videoType") }}
        </div>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

defineProps<{
  items: Array<{
    type: "image" | "video"
    src: string
    alt?: string
    mime?: string
  }>
}>()

const emit = defineEmits<{ open: [index: number] }>()
</script>
