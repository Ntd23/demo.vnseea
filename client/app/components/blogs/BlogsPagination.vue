<template>
  <nav
    class="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white/95 p-3 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:justify-between"
    aria-label="Phân trang blogs"
  >
    <p class="text-caption-secondary px-2">
      Trang {{ currentPage }} / {{ totalPages }}
    </p>

    <div class="flex flex-wrap gap-2">
      <button
        class="blog-page-btn"
        :disabled="currentPage === 1"
        type="button"
        @click="$emit('update:currentPage', currentPage - 1)"
      >
        Trước
      </button>
      <button
        v-for="page in pages"
        :key="page"
        class="blog-page-btn"
        :class="currentPage === page ? 'blog-page-btn--active' : ''"
        type="button"
        @click="$emit('update:currentPage', page)"
      >
        {{ page }}
      </button>
      <button
        class="blog-page-btn"
        :disabled="currentPage === totalPages"
        type="button"
        @click="$emit('update:currentPage', currentPage + 1)"
      >
        Sau
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
defineProps<{
  currentPage: number
  totalPages: number
  pages: number[]
}>()

defineEmits<{
  "update:currentPage": [value: number]
}>()
</script>

<style scoped>
.blog-page-btn {
  display: inline-flex;
  min-width: 42px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  padding: 0 12px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 700;
  transition: all var(--duration-fast) var(--ease-default);
}

.blog-page-btn:hover:not(:disabled),
.blog-page-btn--active {
  border-color: var(--border-strong);
  background: var(--color-primary-500);
  color: var(--text-inverse);
}

.blog-page-btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}
</style>
