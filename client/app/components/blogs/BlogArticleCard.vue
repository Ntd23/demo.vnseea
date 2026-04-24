<template>
  <article class="group overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)] transition duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]">
    <NuxtLink :to="article.href" class="block">
      <div class="relative aspect-[16/9] overflow-hidden bg-[var(--color-secondary-100)]">
        <div aria-hidden="true" class="absolute inset-0" :style="{ background: article.imageFallback }" />
        <NuxtImg
          v-if="showCoverImage"
          :src="article.image"
          :alt="article.title"
          width="1200"
          height="675"
          sizes="(max-width: 767px) 100vw, (max-width: 1535px) 50vw, 33vw"
          class="relative h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
          loading="lazy"
          decoding="async"
          @error="handleImageError"
        />
        <div class="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgba(15,23,42,0.56)_100%)]" />

        <div class="absolute left-3 top-3 flex flex-wrap gap-2">
          <span class="rounded-[10px] bg-[#101828]/82 px-2.5 py-1 text-[11px] font-bold text-white">
            {{ article.categoryLabel }}
          </span>
          <span
            v-if="article.mine"
            class="rounded-[10px] bg-white/18 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-[4px]"
          >
            {{ $t("pages.blogsPage.mineBadge") }}
          </span>
        </div>

        <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
          <div class="inline-flex items-center gap-2 rounded-[var(--radius-full)] bg-black/50 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-[4px]">
            <Icon name="i-ph-eye-fill" class="h-3.5 w-3.5" />
            {{ formatCompact(article.views) }}
          </div>
          <div class="rounded-[var(--radius-full)] bg-white/18 px-2.5 py-1.5 text-[11px] font-bold text-white backdrop-blur-[4px]">
            {{ $t("pages.blogsPage.readMinutes", { count: article.readMinutes }) }}
          </div>
        </div>
      </div>

      <div class="p-4">
        <div class="flex items-start gap-3">
          <div
            class="avatar-md shrink-0 text-white"
            :style="{ background: article.authorGradient }"
          >
            {{ article.authorInitials }}
          </div>
          <div class="min-w-0">
            <h3 class="blog-card-title text-[1.1rem] font-black leading-tight tracking-[-0.035em] text-[var(--text-primary)]">
              {{ article.title }}
            </h3>
            <p class="mt-1 text-caption-secondary">
              {{ article.author }} · {{ article.publishedAt }}
            </p>
          </div>
        </div>

        <p class="mt-3 min-h-[72px] text-[13px] leading-6 text-[var(--text-secondary)]">
          {{ article.excerpt }}
        </p>

        <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="tag in article.tags"
              :key="tag"
              class="rounded-[var(--radius-full)] bg-[var(--color-primary-50)] px-2.5 py-1 text-[11px] font-bold text-[var(--text-primary)]"
            >
              #{{ tag }}
            </span>
          </div>
          <span class="inline-flex items-center gap-1 text-[12px] font-bold text-[var(--text-primary)]">
            {{ $t("pages.blogsPage.continueReading") }}
            <Icon name="i-ph-arrow-right-bold" class="h-3.5 w-3.5" />
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
</script>

<style scoped>
.blog-card-title {
  display: -webkit-box;
  min-height: 2.75rem;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>
