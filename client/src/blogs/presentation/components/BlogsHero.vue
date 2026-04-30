<template>
  <section
    class="blogs-hero relative overflow-hidden rounded-[28px] px-7 py-10 sm:px-10 sm:py-14"
    aria-labelledby="blogs-hero-title"
  >
    <!-- Decorative blur orbs -->
    <div
      class="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full blogs-hero-orb-1 blur-[90px]"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -bottom-12 left-1/3 h-52 w-52 rounded-full blogs-hero-orb-2 blur-[70px]"
      aria-hidden="true"
    />

    <div class="relative space-y-5">
      <h1
        id="blogs-hero-title"
        class="max-w-2xl text-[30px] font-extrabold leading-tight tracking-[-0.025em] text-white sm:text-[42px]"
      >
        {{ $t("pages.blogsPage.heroTitle") }}
      </h1>

      <div class="flex flex-wrap items-center gap-3">
        <button
          type="button"
          class="inline-flex h-10 items-center gap-2 rounded-[12px] px-4 text-[13px] font-semibold transition-all duration-200 active:scale-95"
          :class="mineOnly
            ? 'bg-white text-[#1e1b4b] shadow-[0_4px_14px_rgba(255,255,255,0.22)]'
            : 'bg-white/15 text-white ring-1 ring-white/20 backdrop-blur-[6px] hover:bg-white/25'"
          :aria-pressed="mineOnly"
          @click="$emit('toggleMine')"
        >
          <Icon name="i-ph-article-fill" class="h-4 w-4 shrink-0" />
          {{ $t("pages.blogsPage.myArticles") }}
        </button>

        <NuxtLink
          to="/create-blog"
          class="inline-flex h-10 items-center gap-2 rounded-[12px] bg-[var(--color-primary-500)] px-4 text-[13px] font-semibold text-white shadow-[0_4px_16px_rgba(99,102,241,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--color-primary-400)] active:scale-95"
        >
          <Icon name="i-ph-pencil-simple-line-fill" class="h-4 w-4 shrink-0" />
          {{ $t("pages.blogsPage.writeBlog") }}
        </NuxtLink>
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
.blogs-hero {
  background: linear-gradient(130deg, #0f172a 0%, #1e1b4b 45%, #4c1d95 100%);
}
.blogs-hero-orb-1 {
  background: #7c3aed;
  opacity: 0.22;
}
.blogs-hero-orb-2 {
  background: #4f46e5;
  opacity: 0.18;
}
</style>
