<template>
  <header class="space-y-5">
    <UAlert
      v-if="articleNotFound"
      color="warning"
      variant="soft"
      icon="i-ph-warning-circle-fill"
      class="rounded-[24px] border border-[var(--border-default)] shadow-[var(--shadow-sm)]"
    >
      {{ $t("pages.readBlogPage.notFound") }}
    </UAlert>

    <div class="relative min-h-[340px] overflow-hidden rounded-[28px] lg:min-h-[460px]">
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
      <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.74)_100%)]" />

      <div class="relative z-10 flex min-h-[340px] flex-col justify-end p-5 text-white sm:p-7 lg:min-h-[460px] lg:p-8">
        <div class="max-w-[860px]">
          <div class="flex flex-wrap gap-2">
            <UBadge color="neutral" variant="soft" class="rounded-[10px] bg-white/18 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-[4px]">
              {{ article.categoryLabel }}
            </UBadge>
            <UBadge color="neutral" variant="solid" class="rounded-[10px] bg-[#101828]/64 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-[4px]">
              {{ $t("pages.blogsPage.readMinutes", { count: article.readMinutes }) }}
            </UBadge>
          </div>

          <h1 id="read-blog-title" class="mt-4 text-display text-[2rem] leading-[1.02] text-white sm:text-[2.8rem] lg:text-[3.25rem]">
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
