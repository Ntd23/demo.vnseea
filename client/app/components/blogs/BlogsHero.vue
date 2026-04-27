<template>
  <section
    class="blogs-hero relative overflow-hidden rounded-[32px] px-6 pb-8 pt-8 text-white shadow-[var(--shadow-xl)] sm:px-8 lg:px-10"
    aria-labelledby="blogs-hero-title"
  >
    <!-- Background gradient -->
    <div class="absolute inset-0 blogs-hero-bg" />

    <!-- Grid pattern -->
    <div class="pointer-events-none absolute inset-0 opacity-20 blogs-hero-grid" />

    <!-- Glowing orbs -->
    <div class="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-[#7c3aed]/30 blur-[80px]" />
    <div class="pointer-events-none absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-[var(--color-accent-500)]/20 blur-[90px]" />

    <!-- Bottom fade -->
    <div class="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.12)_100%)]" />

    <!-- Content -->
    <div class="relative z-10">
      <!-- Eyebrow -->
      <div class="flex items-center gap-2">
        <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15 backdrop-blur-[4px]">
          <Icon name="i-ph-newspaper-clipping-fill" class="h-3.5 w-3.5 text-[#fde7b2]" />
        </span>
        <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">
          {{ $t("pages.blogsPage.heroEyebrow") }}
        </p>
      </div>

      <!-- Title + description -->
      <h1
        id="blogs-hero-title"
        class="mt-4 font-['Be_Vietnam_Pro',sans-serif] text-[2.2rem] font-black leading-[0.95] tracking-[-0.04em] text-white sm:text-[2.9rem]"
      >
        {{ $t("pages.blogsPage.heroTitle") }}
      </h1>
      <p class="mt-4 max-w-[580px] text-[14.5px] leading-[1.75] text-white/80 sm:text-[16px]">
        {{ $t("pages.blogsPage.heroDescription") }}
      </p>

      <!-- CTA row -->
      <div class="mt-6 flex flex-wrap items-center gap-3">
        <UButton
          type="button"
          color="neutral"
          variant="solid"
          size="lg"
          class="h-11 rounded-[var(--radius-full)] px-5 text-[13.5px] font-bold shadow-[0_4px_16px_rgba(0,0,0,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
          :class="mineOnly
            ? 'bg-white text-[var(--text-primary)]'
            : 'bg-[#fde7b2] text-[#27345f]'"
          :aria-pressed="mineOnly"
          @click="$emit('toggleMine')"
        >
          <Icon name="i-ph-article-fill" class="h-4 w-4" />
          {{ $t("pages.blogsPage.myArticles") }}
        </UButton>

        <UButton
          to="/create-blog"
          color="neutral"
          variant="solid"
          size="lg"
          class="h-11 rounded-[var(--radius-full)] bg-white px-5 text-[13.5px] font-bold text-[var(--text-primary)] shadow-[0_4px_16px_rgba(0,0,0,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
        >
          <Icon name="i-ph-pencil-simple-line-fill" class="h-4 w-4" />
          {{ $t("pages.blogsPage.writeBlog") }}
        </UButton>

        <UBadge
          color="neutral"
          variant="soft"
          class="inline-flex items-center gap-2 rounded-[var(--radius-full)] border border-white/20 bg-white/12 px-4 py-2 text-[12.5px] font-semibold text-white/90 backdrop-blur-[4px]"
          role="status"
          aria-live="polite"
        >
          <span class="relative flex h-2 w-2">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#fde7b2] opacity-75" />
            <span class="relative inline-flex h-2 w-2 rounded-full bg-[#fde7b2]" />
          </span>
          {{ $t("pages.blogsPage.visibleArticles", { count: articleCount }) }}
        </UBadge>
      </div>

      <!-- Stats strip -->
      <div class="mt-7 grid grid-cols-3 gap-3 sm:gap-4" role="list">
        <div
          v-for="item in stats"
          :key="item.label"
          class="rounded-[20px] border border-white/12 bg-white/10 p-3 backdrop-blur-[6px] sm:p-4"
          role="listitem"
        >
          <p class="text-[10px] font-bold uppercase tracking-[0.12em] text-white/60">
            {{ item.label }}
          </p>
          <p class="mt-1.5 font-['Be_Vietnam_Pro',sans-serif] text-[1.8rem] font-black leading-none text-white sm:text-[2.2rem]">
            {{ item.value }}
          </p>
          <p class="mt-1 hidden text-[12px] leading-[1.5] text-white/70 sm:block">
            {{ item.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  articleCount: number
  mineOnly: boolean
  stats: ReadonlyArray<{
    label: string
    value: string
    description: string
  }>
}>()

defineEmits<{
  toggleMine: []
}>()
</script>

<style scoped>
.blogs-hero-bg {
  background: linear-gradient(135deg,
    #1a1f8e 0%,
    #2d3ed4 28%,
    #4f46e5 56%,
    #7c3aed 100%
  );
}

.blogs-hero-grid {
  background-image:
    linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px);
  background-size: 40px 40px;
}
</style>
