<template>
  <header class="space-y-4">
    <UAlert
      v-if="articleNotFound"
      color="warning"
      variant="soft"
      icon="i-ph-warning-circle-fill"
      class="rounded-[20px] border border-[var(--border-default)] shadow-[var(--shadow-sm)]"
    >
      {{ $t("pages.readBlogPage.notFound") }}
    </UAlert>

    <!-- Hero image -->
    <div class="relative min-h-[360px] overflow-hidden rounded-none lg:min-h-[500px]">
      <div class="absolute inset-0" :style="{ background: article.imageFallback }" />
      <NuxtImg
        v-if="!imageFailed"
        :src="article.image"
        :alt="article.title"
        class="absolute inset-0 h-full w-full object-cover"
        width="1600"
        height="900"
        loading="eager"
        sizes="100vw lg:1200px"
        @error="imageFailed = true"
      />

      <!-- Multi-stop gradient overlay -->
      <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,16,40,0.15)_0%,rgba(8,16,40,0.45)_55%,rgba(8,16,40,0.84)_100%)]" />

      <!-- Content overlay -->
      <div class="relative z-10 flex min-h-[360px] flex-col justify-end px-5 py-7 text-white sm:px-8 lg:min-h-[500px] lg:px-10 lg:py-10">
        <div class="max-w-[880px]">
          <!-- Top badges row -->
          <div class="flex flex-wrap gap-2">
            <span class="inline-flex items-center gap-1.5 rounded-[10px] bg-white/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white backdrop-blur-[6px]">
              <span class="h-1.5 w-1.5 rounded-full bg-[#fde7b2]" />
              {{ article.categoryLabel }}
            </span>
            <span class="inline-flex items-center gap-1.5 rounded-[10px] bg-[#0b1629]/60 px-3 py-1.5 text-[11px] font-bold text-white/90 backdrop-blur-[6px]">
              <Icon name="i-ph-clock-fill" class="h-3.5 w-3.5 opacity-80" />
              {{ $t("pages.blogsPage.readMinutes", { count: article.readMinutes }) }}
            </span>
          </div>

          <!-- Title -->
          <h1
            id="read-blog-title"
            class="mt-5 font-['Be_Vietnam_Pro',sans-serif] text-[1.95rem] font-black leading-[1.05] tracking-[-0.035em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] sm:text-[2.6rem] lg:text-[3.1rem]"
          >
            {{ article.title }}
          </h1>

          <!-- Excerpt -->
          <p class="mt-4 max-w-[740px] text-[14.5px] leading-[1.75] text-white/82 sm:text-[16px]">
            {{ article.excerpt }}
          </p>

          <!-- Author row -->
          <div class="mt-6 flex items-center gap-3">
            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[13px] font-black text-white ring-2 ring-white/30 shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
              :style="{ background: article.authorGradient }"
            >
              {{ article.authorInitials }}
            </div>
            <div>
              <p class="text-[14px] font-bold text-white">{{ article.author }}</p>
              <p class="mt-0.5 flex items-center gap-2 text-[12px] text-white/65">
                <span>{{ article.publishedAt }}</span>
                <span class="opacity-50">·</span>
                <Icon name="i-ph-eye-fill" class="h-3.5 w-3.5" />
                <span>{{ $t("pages.readBlogPage.views", { count: formatCompact(article.views) }) }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const props = defineProps<{
  articleNotFound: boolean
  article: {
    title: string
    excerpt: string
    categoryLabel: string
    author: string
    authorInitials: string
    authorGradient: string
    publishedAt: string
    views: number
    readMinutes: number
    image: string
    imageFallback: string
  }
  formatCompact: (value: number) => string
}>()

const imageFailed = ref(false)

watch(() => props.article.image, () => {
  imageFailed.value = false
}, { immediate: true })
</script>
