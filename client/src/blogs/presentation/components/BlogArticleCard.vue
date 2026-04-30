<template>
  <article
    class="blog-card group relative overflow-hidden rounded-[20px] shadow-[0_6px_20px_rgba(0,0,0,0.20)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.34)]"
  >
    <!-- Fallback gradient background -->
    <div
      class="absolute inset-0"
      :style="{ background: article.imageFallback }"
      aria-hidden="true"
    />

    <!-- Cover image -->
    <NuxtImg
      v-if="showCoverImage"
      :src="article.image"
      :alt="article.title"
      width="1200"
      height="750"
      sizes="(max-width: 767px) 100vw, (max-width: 1535px) 50vw, 33vw"
      class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
      loading="lazy"
      decoding="async"
      @error="handleImageError"
    />

    <!-- Gradient overlay -->
    <div
      class="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,4,16,0.12)_0%,rgba(4,4,16,0.90)_100%)]"
      aria-hidden="true"
    />

    <!--
      Main clickable link covers the whole card.
      Content (badges top, text bottom) lives inside the <a>.
    -->
    <NuxtLink
      :to="article.href"
      class="absolute inset-0 z-10 flex flex-col justify-between p-4"
    >
      <!-- Top: category + mine badges -->
      <div class="flex flex-wrap gap-1.5">
        <span
          class="inline-flex items-center gap-1.5 rounded-[10px] bg-[#0b1629]/75 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white backdrop-blur-[6px]"
        >
          <span class="h-1.5 w-1.5 shrink-0 rounded-full" :style="{ background: categoryAccentColor }" />
          {{ article.categoryLabel }}
        </span>
        <span
          v-if="article.mine"
          class="inline-flex items-center gap-1 rounded-[10px] bg-[var(--color-primary-500)]/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-[6px]"
        >
          <Icon name="i-ph-user-fill" class="h-3 w-3" />
          {{ $t("pages.blogsPage.mineBadge") }}
        </span>
      </div>

      <!-- Bottom: title + author + read-more -->
      <div>
        <h3 class="blog-card-title text-[14.5px] font-extrabold leading-snug tracking-[-0.01em] text-white">
          {{ article.title }}
        </h3>

        <div class="mt-2 flex items-center gap-1.5">
          <div
            class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[8px] font-black text-white shadow-[0_1px_6px_rgba(0,0,0,0.5)]"
            :style="{ background: article.authorGradient }"
          >
            {{ article.authorInitials }}
          </div>
          <p class="truncate text-[11px] font-semibold text-white/75">
            {{ article.author }}
            <span class="mx-0.5 text-white/40">·</span>
            {{ article.publishedAt }}
          </p>
        </div>

        <span
          class="mt-2.5 inline-flex items-center gap-1.5 rounded-[10px] bg-black/50 px-3 py-1.5 text-[11.5px] font-bold text-white backdrop-blur-[6px] transition-colors duration-150 group-hover:bg-black/70"
        >
          {{ $t("pages.blogsPage.continueReading") }}
          <Icon name="i-ph-arrow-right-bold" class="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
    </NuxtLink>
  </article>
</template>

<script setup lang="ts">
const props = defineProps<{
  article: {
    href: string
    image: string
    imageFallback: string
    title: string
    categoryLabel: string
    category?: string
    author: string
    authorInitials: string
    authorGradient: string
    publishedAt: string
    views: number
    readMinutes: number
    excerpt: string
    tags: string[]
    mine?: boolean
  }
  formatCompact: (value: number) => string
}>()

const hasImageError = ref(false)

watch(() => props.article.image, (value) => {
  hasImageError.value = !value.trim()
}, { immediate: true })

const showCoverImage = computed(() => Boolean(props.article.image.trim()) && !hasImageError.value)

const handleImageError = () => {
  hasImageError.value = true
}

const categoryColorMap: Record<string, string> = {
  business:  'linear-gradient(90deg,#3b82f6,#06b6d4)',
  vehicles:  'linear-gradient(90deg,#64748b,#334155)',
  education: 'linear-gradient(90deg,#8b5cf6,#6366f1)',
  movies:    'linear-gradient(90deg,#f59e0b,#ef4444)',
  gaming:    'linear-gradient(90deg,#a855f7,#6366f1)',
  history:   'linear-gradient(90deg,#b45309,#f59e0b)',
  lifestyle: 'linear-gradient(90deg,#10b981,#06b6d4)',
  pets:      'linear-gradient(90deg,#f472b6,#fb7185)',
  science:   'linear-gradient(90deg,#6366f1,#8b5cf6)',
  sports:    'linear-gradient(90deg,#22c55e,#16a34a)',
  travel:    'linear-gradient(90deg,#0ea5e9,#38bdf8)',
  people:    'linear-gradient(90deg,#f97316,#fb923c)',
  other:     'linear-gradient(90deg,#94a3b8,#64748b)',
}

const categoryAccentColor = computed(() =>
  categoryColorMap[props.article.category ?? ''] ?? 'linear-gradient(90deg,#6366f1,#4f46e5)',
)
</script>

<style scoped>
.blog-card {
  aspect-ratio: 16 / 10;
}

.blog-card-title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
</style>
