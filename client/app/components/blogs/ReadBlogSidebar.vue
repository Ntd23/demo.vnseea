<template>
  <aside class="space-y-4">
    <!-- Author card -->
    <div class="overflow-hidden rounded-[28px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]">
      <!-- Gradient header band -->
      <div
        class="h-16 w-full"
        :style="{ background: article.authorGradient }"
        style="opacity: 0.85;"
      />

      <div class="relative -mt-8 px-5 pb-5">
        <!-- Avatar -->
        <div
          class="flex h-14 w-14 items-center justify-center rounded-full text-[16px] font-black text-white shadow-[0_4px_16px_rgba(0,0,0,0.2)] ring-4 ring-white"
          :style="{ background: article.authorGradient }"
        >
          {{ article.authorInitials }}
        </div>

        <div class="mt-3">
          <p class="text-[16px] font-extrabold tracking-[-0.02em] text-[var(--text-primary)]">
            {{ article.author }}
          </p>
          <span class="mt-1 inline-block rounded-[8px] bg-[var(--color-primary-50)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-primary-700)]">
            {{ article.categoryLabel }}
          </span>
        </div>

        <p class="mt-3 text-[13px] leading-[1.7] text-[var(--text-secondary)]">
          {{ $t("pages.readBlogPage.authorDescription") }}
        </p>
      </div>
    </div>

    <!-- Related articles card -->
    <div class="overflow-hidden rounded-[28px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]">
      <div class="border-b border-[var(--border-light)] px-5 py-4">
        <div class="flex items-center gap-2">
          <span class="flex h-7 w-7 items-center justify-center rounded-[10px] bg-[var(--color-secondary-100)]">
            <Icon name="i-ph-books-fill" class="h-4 w-4 text-[var(--text-secondary)]" />
          </span>
          <p id="read-blog-related-title" class="text-[12px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-primary)]">
            {{ $t("pages.readBlogPage.relatedArticles") }}
          </p>
        </div>
      </div>

      <div class="divide-y divide-[var(--border-light)]" role="list" aria-labelledby="read-blog-related-title">
        <NuxtLink
          v-for="item in relatedArticles"
          :key="item.slug"
          :to="`/read-blog/${item.slug}`"
          class="group flex items-start gap-3 px-5 py-3.5 transition-colors duration-150 hover:bg-[var(--color-primary-50)]"
          role="listitem"
        >
          <!-- Gradient thumbnail -->
          <div
            class="mt-0.5 h-12 w-14 shrink-0 rounded-[10px]"
            :style="{ background: item.imageFallback ?? 'linear-gradient(135deg,#4f46e5,#7c3aed)' }"
          />

          <div class="min-w-0">
            <span class="inline-block rounded-[6px] bg-[var(--color-secondary-100)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
              {{ item.categoryLabel }}
            </span>
            <h3 class="related-title mt-1 text-[13px] font-bold leading-[1.45] text-[var(--text-primary)] group-hover:text-[var(--color-primary-700)]">
              {{ item.title }}
            </h3>
            <p class="mt-1 flex items-center gap-1 text-[11px] text-[var(--text-tertiary)]">
              <Icon name="i-ph-clock" class="h-3 w-3" />
              {{ $t("pages.blogsPage.readMinutes", { count: item.readMinutes }) }}
            </p>
          </div>
        </NuxtLink>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineProps<{
  article: {
    author: string
    authorInitials: string
    authorGradient: string
    categoryLabel: string
  }
  relatedArticles: ReadonlyArray<{
    slug: string
    categoryLabel: string
    title: string
    readMinutes: number
    imageFallback?: string
  }>
}>()
</script>

<style scoped>
.related-title {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>
