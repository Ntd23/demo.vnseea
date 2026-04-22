<template>
  <aside class="space-y-4">
    <UCard
      class="rounded-[28px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]"
      :ui="{ body: 'p-5' }"
    >
      <p id="read-blog-author-title" class="text-label-secondary text-[var(--color-primary-600)]">
        {{ $t("pages.readBlogPage.author") }}
      </p>
      <div class="mt-4 flex items-center gap-3">
        <div class="avatar-lg text-white" :style="{ background: article.authorGradient }">
          {{ article.authorInitials }}
        </div>
        <div class="min-w-0">
          <p class="text-[15px] font-black text-[var(--text-primary)]">
            {{ article.author }}
          </p>
          <p class="mt-1">
            <UBadge color="primary" variant="subtle" class="rounded-full px-2.5 py-1 text-[11px] font-bold">
              {{ article.categoryLabel }}
            </UBadge>
          </p>
        </div>
      </div>
      <p class="mt-4 text-[13px] leading-6 text-[var(--text-secondary)]">
        {{ $t("pages.readBlogPage.authorDescription") }}
      </p>
    </UCard>

    <UCard
      class="rounded-[28px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]"
      :ui="{ body: 'p-5' }"
    >
      <p id="read-blog-related-title" class="text-label-secondary text-[var(--color-primary-600)]">
        {{ $t("pages.readBlogPage.relatedArticles") }}
      </p>
      <div class="mt-4 space-y-3" role="list" aria-labelledby="read-blog-related-title">
        <NuxtLink
          v-for="item in relatedArticles"
          :key="item.slug"
          :to="`/read-blog/${item.slug}`"
          class="group block rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface-hover)] p-3 transition hover:border-[var(--border-strong)] hover:bg-[var(--color-primary-50)]"
          role="listitem"
        >
          <p class="text-[12px] font-bold text-[var(--color-primary-600)]">
            {{ item.categoryLabel }}
          </p>
          <h3 class="mt-1 line-clamp-2 text-[13px] font-bold leading-5 text-[var(--text-primary)]">
            {{ item.title }}
          </h3>
          <p class="mt-2 text-caption-secondary">
            {{ $t("pages.blogsPage.readMinutes", { count: item.readMinutes }) }}
          </p>
        </NuxtLink>
      </div>
    </UCard>
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
  }>
}>()
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>
