<!-- English description: Renders the public index of custom CMS pages loaded from the PHP backend. -->
<template>
  <main class="cms-index-page">
    <section class="cms-index-page__shell">
      <p class="cms-index-page__eyebrow">
        VNSEEA
      </p>
      <h1 class="cms-index-page__title">
        {{ copy.title }}
      </h1>
      <p class="cms-index-page__summary">
        {{ copy.description }}
      </p>

      <div v-if="pending" class="cms-index-page__grid">
        <div v-for="item in 6" :key="item" class="cms-index-page__skeleton" />
      </div>

      <UAlert
        v-else-if="error"
        color="warning"
        variant="soft"
        :title="copy.errorTitle"
        :description="copy.errorDescription"
      />

      <div v-else-if="pages.length" class="cms-index-page__grid">
        <NuxtLink
          v-for="page in pages"
          :key="page.name"
          class="cms-index-page__card"
          :to="page.href"
        >
          <Icon name="i-ph-file-text" class="cms-index-page__card-icon" />
          <span>{{ page.title }}</span>
        </NuxtLink>
      </div>

      <UAlert
        v-else
        color="neutral"
        variant="soft"
        :title="copy.emptyTitle"
        :description="copy.emptyDescription"
      />
    </section>
  </main>
</template>

<script setup lang="ts">
import { createApiCmsRepository } from "../../infrastructure/repositories/ApiCmsRepository"

const copy = {
  title: "Trang thông tin",
  description: "Các trang nội dung công khai được quản trị trong hệ thống PHP.",
  errorTitle: "Không tải được danh sách trang",
  errorDescription: "Vui lòng thử lại sau.",
  emptyTitle: "Chưa có trang công khai",
  emptyDescription: "Khi admin tạo trang tùy chỉnh, trang đó sẽ xuất hiện tại đây.",
}
const repository = createApiCmsRepository()
const { data, pending, error } = await useAsyncData("cms-custom-pages-index", () => repository.getPages())
const pages = computed(() => data.value ?? [])

useSeoMeta({
  title: copy.title,
  description: copy.description,
  robots: "index, follow",
})
</script>

<style scoped>
.cms-index-page {
  min-height: 100svh;
  padding: 64px 16px;
  background: var(--surface-page);
}

.cms-index-page__shell {
  width: min(960px, 100%);
  margin: 0 auto;
}

.cms-index-page__eyebrow {
  margin: 0 0 10px;
  color: var(--text-brand);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.cms-index-page__title {
  margin: 0;
  color: var(--text-primary);
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0;
}

.cms-index-page__summary {
  max-width: 620px;
  margin: 18px 0 32px;
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.65;
}

.cms-index-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}

.cms-index-page__card {
  display: flex;
  min-height: 96px;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  background: var(--surface-card);
  box-shadow: var(--shadow-sm);
  font-weight: 800;
  text-decoration: none;
}

.cms-index-page__card-icon {
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
  color: var(--text-brand);
}

.cms-index-page__skeleton {
  min-height: 96px;
  border-radius: var(--radius-lg);
  background: linear-gradient(90deg, var(--surface-muted) 25%, var(--surface-card) 50%, var(--surface-muted) 75%);
  background-size: 200% 100%;
  animation: cms-index-page-shimmer 1.2s infinite linear;
}

@keyframes cms-index-page-shimmer {
  from {
    background-position: 200% 0;
  }

  to {
    background-position: -200% 0;
  }
}
</style>
