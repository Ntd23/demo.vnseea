<template>
  <nav
    class="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white/95 p-3 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:justify-between"
    :aria-label="$t('pages.blogsPage.paginationAria')"
  >
    <p class="text-caption-secondary px-2" role="status" aria-live="polite">
      {{ $t("pages.blogsPage.pageStatus", { current: currentPage, total: totalPages }) }}
    </p>

    <div class="flex flex-wrap gap-2">
      <UButton
        color="neutral"
        variant="outline"
        size="sm"
        class="min-w-[42px] rounded-[var(--radius-md)] px-3 font-bold"
        :disabled="currentPage === 1"
        type="button"
        @click="$emit('update:currentPage', currentPage - 1)"
      >
        {{ $t("pages.blogsPage.previous") }}
      </UButton>
      <UButton
        v-for="page in pages"
        :key="page"
        :color="currentPage === page ? 'primary' : 'neutral'"
        :variant="currentPage === page ? 'solid' : 'outline'"
        size="sm"
        class="min-w-[42px] rounded-[var(--radius-md)] px-3 font-bold"
        type="button"
        :aria-current="currentPage === page ? 'page' : undefined"
        @click="$emit('update:currentPage', page)"
      >
        {{ page }}
      </UButton>
      <UButton
        color="neutral"
        variant="outline"
        size="sm"
        class="min-w-[42px] rounded-[var(--radius-md)] px-3 font-bold"
        :disabled="currentPage === totalPages"
        type="button"
        @click="$emit('update:currentPage', currentPage + 1)"
      >
        {{ $t("pages.blogsPage.next") }}
      </UButton>
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
