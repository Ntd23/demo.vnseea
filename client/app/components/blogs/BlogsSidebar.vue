<template>
  <aside class="space-y-4">
    <section class="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)]">
      <p class="text-label-secondary text-[var(--color-primary-600)]">
        {{ $t("pages.blogsPage.featuredTopics") }}
      </p>
      <div class="mt-4 space-y-2.5">
        <button
          v-for="topic in trendingTopics"
          :key="topic.value"
          class="flex w-full items-center justify-between rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface-hover)] px-3 py-3 text-left transition hover:border-[var(--border-strong)] hover:bg-[var(--color-primary-50)]"
          type="button"
          @click="$emit('selectCategory', topic.value)"
        >
          <span class="flex min-w-0 items-center gap-2">
            <Icon :name="topic.icon" class="h-4 w-4 shrink-0 text-[var(--color-primary-600)]" />
            <span class="truncate text-[13px] font-bold text-[var(--text-primary)]">
              {{ topic.label }}
            </span>
          </span>
          <span class="text-[12px] font-bold text-[var(--text-tertiary)]">
            {{ topic.count }}
          </span>
        </button>
      </div>
    </section>

    <section class="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[linear-gradient(180deg,var(--bg-surface)_0%,var(--color-primary-50)_100%)] p-4 shadow-[var(--shadow-md)]">
      <p class="text-label-secondary text-[var(--color-primary-600)]">
        {{ $t("pages.blogsPage.authorsThisWeek") }}
      </p>
      <div class="mt-4 space-y-3">
        <div
          v-for="author in featuredAuthors"
          :key="author.name"
          class="flex items-center gap-3"
        >
          <div class="avatar-md text-white" :style="{ background: author.gradient }">
            {{ author.initials }}
          </div>
          <div class="min-w-0">
            <p class="truncate text-[13px] font-bold text-[var(--text-primary)]">
              {{ author.name }}
            </p>
            <p class="text-caption-secondary">
              {{ $t("pages.blogsPage.authorArticleTopic", { count: author.count, topic: author.topic }) }}
            </p>
          </div>
        </div>
      </div>
    </section>
  </aside>
</template>

<script setup lang="ts">
defineProps<{
  trendingTopics: ReadonlyArray<{
    label: string
    value: string
    icon: string
    count: number
  }>
  featuredAuthors: ReadonlyArray<{
    name: string
    initials: string
    gradient: string
    count: number
    topic: string
  }>
}>()

defineEmits<{
  selectCategory: [value: string]
}>()
</script>
