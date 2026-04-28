<template>
  <article
    class="blog-card group relative overflow-hidden rounded-[28px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[var(--shadow-xl)]"
  >
    <!-- Category color accent strip -->
    <div
      class="absolute left-0 top-0 h-1 w-full rounded-t-[28px]"
      :style="{ background: categoryAccentColor }"
    />

    <NuxtLink :to="article.href" class="block">
      <!-- Cover image -->
      <div class="relative aspect-[16/9] overflow-hidden bg-[var(--color-secondary-100)]">
        <div aria-hidden="true" class="absolute inset-0" :style="{ background: article.imageFallback }" />
        <NuxtImg
          v-if="showCoverImage"
          :src="article.image"
          :alt="article.title"
          width="1200"
          height="675"
          sizes="(max-width: 767px) 100vw, (max-width: 1535px) 50vw, 33vw"
          class="relative h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          loading="lazy"
          decoding="async"
          @error="handleImageError"
        />

        <!-- Gradient overlay -->
        <div class="absolute inset-0 bg-[linear-gradient(180deg,transparent_25%,rgba(8,16,40,0.65)_100%)]" />

        <!-- Top badges -->
        <div class="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span
            class="inline-flex items-center gap-1.5 rounded-[10px] bg-[#0b1629]/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white backdrop-blur-[6px]"
          >
            <span class="h-1.5 w-1.5 rounded-full" :style="{ background: categoryAccentColor }" />
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

        <!-- Bottom meta bar -->
        <div class="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-2 px-3 pb-3">
          <div class="inline-flex items-center gap-1.5 rounded-[10px] bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-[6px]">
            <Icon name="i-ph-eye-fill" class="h-3.5 w-3.5 opacity-80" />
            {{ formatCompact(article.views) }}
          </div>
          <div class="inline-flex items-center gap-1.5 rounded-[10px] bg-black/50 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-[6px]">
            <Icon name="i-ph-clock-fill" class="h-3.5 w-3.5 opacity-80" />
            {{ $t("pages.blogsPage.readMinutes", { count: article.readMinutes }) }}
          </div>
        </div>
      </div>

      <!-- Card body -->
      <div class="p-4 pt-3.5">
        <!-- Author row -->
        <div class="flex items-center gap-2.5">
          <div
            class="relative h-9 w-9 shrink-0 rounded-full text-[11px] font-black text-white shadow-[0_2px_8px_rgba(0,0,0,0.18)] transition-transform duration-200 group-hover:scale-105"
            :style="{ background: article.authorGradient }"
            style="display:flex;align-items:center;justify-content:center;"
          >
            {{ article.authorInitials }}
          </div>
          <div class="min-w-0">
            <p class="truncate text-[12.5px] font-bold text-[var(--text-primary)]">{{ article.author }}</p>
            <p class="text-[11px] leading-none text-[var(--text-tertiary)]">{{ article.publishedAt }}</p>
          </div>
        </div>

        <!-- Title -->
        <h3 class="blog-card-title mt-3 text-[1.05rem] font-extrabold leading-snug tracking-[-0.03em] text-[var(--text-primary)] transition-colors duration-200 group-hover:text-[var(--color-primary-600)]">
          {{ article.title }}
        </h3>

        <!-- Excerpt -->
        <p class="blog-card-excerpt mt-2 text-[13px] leading-[1.65] text-[var(--text-secondary)]">
          {{ article.excerpt }}
        </p>

        <!-- Footer: tags + read more -->
        <div class="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-light)] pt-3">
          <div class="flex flex-wrap gap-1">
            <span
              v-for="tag in article.tags.slice(0, 3)"
              :key="tag"
              class="rounded-[8px] bg-[var(--color-primary-50)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-primary-600)]"
            >
              #{{ tag }}
            </span>
          </div>
          <span class="blog-read-more inline-flex items-center gap-1 text-[12px] font-bold text-[var(--color-primary-600)]">
            {{ $t("pages.blogsPage.continueReading") }}
            <Icon name="i-ph-arrow-right-bold" class="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
        </div>
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
  business: 'linear-gradient(90deg,#3b82f6,#06b6d4)',
  vehicles: 'linear-gradient(90deg,#64748b,#334155)',
  education: 'linear-gradient(90deg,#8b5cf6,#6366f1)',
  movies: 'linear-gradient(90deg,#f59e0b,#ef4444)',
  gaming: 'linear-gradient(90deg,#a855f7,#6366f1)',
  history: 'linear-gradient(90deg,#b45309,#f59e0b)',
  lifestyle: 'linear-gradient(90deg,#10b981,#06b6d4)',
  pets: 'linear-gradient(90deg,#f472b6,#fb7185)',
  science: 'linear-gradient(90deg,#6366f1,#8b5cf6)',
  sports: 'linear-gradient(90deg,#22c55e,#16a34a)',
  travel: 'linear-gradient(90deg,#0ea5e9,#38bdf8)',
  people: 'linear-gradient(90deg,#f97316,#fb923c)',
  other: 'linear-gradient(90deg,#94a3b8,#64748b)',
}

const categoryAccentColor = computed(() =>
  categoryColorMap[props.article.category ?? ''] ?? 'linear-gradient(90deg,#0000ff,#4f7cff)',
)
</script>

<style scoped>
.blog-card-title {
  display: -webkit-box;
  min-height: 2.6rem;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.blog-card-excerpt {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
</style>
