<template>
  <aside class="space-y-4">
    <UCard
      class="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]"
      :ui="{ body: 'p-4' }"
    >
      <p id="blogs-sidebar-topics-title" class="text-label-secondary text-[var(--text-primary)]">
        {{ $t("pages.blogsPage.featuredTopics") }}
      </p>
      <div class="mt-4 space-y-2.5" role="list" aria-labelledby="blogs-sidebar-topics-title">
        <UButton
          v-for="topic in trendingTopics"
          :key="topic.value"
          color="neutral"
          variant="outline"
          size="lg"
          class="w-full justify-between rounded-[18px] border-[var(--border-default)] bg-[var(--bg-surface-hover)] px-3 py-3 text-left transition hover:border-[var(--border-strong)] hover:bg-[var(--color-primary-50)]"
          type="button"
          :aria-label="topic.label"
          role="listitem"
          @click="$emit('selectCategory', topic.value)"
        >
          <span class="flex min-w-0 items-center gap-2">
            <Icon :name="topic.icon" class="h-4 w-4 shrink-0 text-[var(--text-primary)]" />
            <span class="truncate text-[13px] font-bold text-[var(--text-primary)]">
              {{ topic.label }}
            </span>
          </span>
          <template #trailing>
            <UBadge color="neutral" variant="soft" class="rounded-full px-2.5 py-1 text-[12px] font-bold text-[var(--text-tertiary)]">
              {{ topic.count }}
            </UBadge>
          </template>
        </UButton>
      </div>
    </UCard>

    <UCard
      class="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[linear-gradient(180deg,var(--bg-surface)_0%,var(--color-primary-50)_100%)] shadow-[var(--shadow-md)]"
      :ui="{ body: 'p-4' }"
    >
      <p id="blogs-sidebar-authors-title" class="text-label-secondary text-[var(--text-primary)]">
        {{ $t("pages.blogsPage.authorsThisWeek") }}
      </p>
      <div class="mt-4 space-y-3" role="list" aria-labelledby="blogs-sidebar-authors-title">
        <div
          v-for="author in featuredAuthors"
          :key="author.name"
          class="flex items-center gap-3 rounded-[18px] border border-[var(--border-default)] bg-white/70 px-3 py-3"
          role="listitem"
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
          <UBadge color="primary" variant="subtle" class="ml-auto shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold">
            {{ author.count }}
          </UBadge>
        </div>
      </div>
    </UCard>
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
