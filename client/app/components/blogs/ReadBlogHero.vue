<template>
  <div class="space-y-5">
    <section
      v-if="articleNotFound"
      class="rounded-[24px] border border-[var(--border-default)] bg-[var(--color-accent-50)] p-4 text-[13px] font-semibold text-[var(--color-accent-700)] shadow-[var(--shadow-sm)]"
    >
      {{ $t("pages.readBlogPage.notFound") }}
    </section>

    <div class="relative min-h-[340px] overflow-hidden lg:min-h-[460px]">
      <div class="absolute inset-0" :style="{ background: article.imageFallback }" />
      <img
        :src="article.image"
        :alt="article.title"
        class="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        @error="handleImageError"
      >
      <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.74)_100%)]" />

      <div class="relative z-10 flex min-h-[340px] flex-col justify-end p-5 text-white sm:p-7 lg:min-h-[460px] lg:p-8">
        <div class="max-w-[860px]">
          <div class="flex flex-wrap gap-2">
            <span class="rounded-[10px] bg-white/18 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] backdrop-blur-[4px]">
              {{ article.categoryLabel }}
            </span>
            <span class="rounded-[10px] bg-[#101828]/64 px-3 py-1.5 text-[11px] font-bold backdrop-blur-[4px]">
              {{ $t("pages.blogsPage.readMinutes", { count: article.readMinutes }) }}
            </span>
          </div>

          <h1 class="mt-4 text-display text-[2rem] leading-[1.02] text-white sm:text-[2.8rem] lg:text-[3.25rem]">
            {{ article.title }}
          </h1>
          <p class="mt-4 max-w-[760px] text-[15px] leading-7 text-white/88 sm:text-[17px]">
            {{ article.excerpt }}
          </p>

          <div class="mt-6 flex flex-wrap items-center gap-3">
            <div class="avatar-md text-white" :style="{ background: article.authorGradient }">
              {{ article.authorInitials }}
            </div>
            <div>
              <p class="text-[14px] font-bold">{{ article.author }}</p>
              <p class="text-[12px] text-white/72">
                {{ article.publishedAt }} · {{ $t("pages.readBlogPage.views", { count: formatCompact(article.views) }) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
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

const handleImageError = (event: Event) => {
  const image = event.target as HTMLImageElement
  image.style.display = "none"
}
</script>
