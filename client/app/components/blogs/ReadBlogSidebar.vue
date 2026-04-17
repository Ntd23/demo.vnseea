<template>
  <aside class="space-y-4">
    <section class="rounded-[28px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-md)]">
      <p class="text-label-secondary text-[var(--color-primary-600)]">
        Tác giả
      </p>
      <div class="mt-4 flex items-center gap-3">
        <div class="avatar-lg text-white" :style="{ background: article.authorGradient }">
          {{ article.authorInitials }}
        </div>
        <div class="min-w-0">
          <p class="text-[15px] font-black text-[var(--text-primary)]">
            {{ article.author }}
          </p>
          <p class="text-caption-secondary">
            {{ article.categoryLabel }}
          </p>
        </div>
      </div>
      <p class="mt-4 text-[13px] leading-6 text-[var(--text-secondary)]">
        Tác giả đang đóng góp các bài viết nổi bật trong luồng Blogs của VNSEEA.
      </p>
    </section>

    <section class="rounded-[28px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-md)]">
      <p class="text-label-secondary text-[var(--color-primary-600)]">
        Bài liên quan
      </p>
      <div class="mt-4 space-y-3">
        <NuxtLink
          v-for="item in relatedArticles"
          :key="item.slug"
          :to="`/read-blog/${item.slug}`"
          class="group block rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface-hover)] p-3 transition hover:border-[var(--border-strong)] hover:bg-[var(--color-primary-50)]"
        >
          <p class="text-[12px] font-bold text-[var(--color-primary-600)]">
            {{ item.categoryLabel }}
          </p>
          <h3 class="mt-1 line-clamp-2 text-[13px] font-bold leading-5 text-[var(--text-primary)]">
            {{ item.title }}
          </h3>
          <p class="mt-2 text-caption-secondary">
            {{ item.readMinutes }} phút đọc
          </p>
        </NuxtLink>
      </div>
    </section>
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
