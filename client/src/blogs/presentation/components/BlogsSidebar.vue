<template>
  <aside class="space-y-4">
    <!-- Trending topics card -->
    <div class="overflow-hidden rounded-[24px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]">
      <div class="border-b border-[var(--border-light)] px-4 py-3.5">
        <div class="flex items-center gap-2">
          <span class="flex h-7 w-7 items-center justify-center rounded-[10px] bg-[var(--color-primary-50)]">
            <Icon name="i-ph-trend-up-bold" class="h-4 w-4 text-[var(--color-primary-600)]" />
          </span>
          <p id="blogs-sidebar-topics-title" class="text-[12px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-primary)]">
            {{ $t("pages.blogsPage.featuredTopics") }}
          </p>
        </div>
      </div>

      <div class="space-y-1 p-3" role="list" aria-labelledby="blogs-sidebar-topics-title">
        <button
          v-for="(topic, idx) in trendingTopics"
          :key="topic.value"
          class="group w-full overflow-hidden rounded-[14px] px-3 py-2.5 text-left transition-all duration-150 hover:bg-[var(--color-primary-50)]"
          type="button"
          :aria-label="topic.label"
          role="listitem"
          @click="$emit('selectCategory', topic.value)"
        >
          <div class="flex items-center gap-2.5">
            <span
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] text-[var(--text-secondary)] transition-colors group-hover:bg-[var(--color-primary-100)] group-hover:text-[var(--color-primary-700)]"
              :style="{ background: topicBgColors[idx % topicBgColors.length] }"
            >
              <Icon :name="topic.icon" class="h-3.5 w-3.5" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-[13px] font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary-700)]">
                {{ topic.label }}
              </span>
              <div class="mt-1 h-1 overflow-hidden rounded-full bg-[var(--color-secondary-100)]">
                <div
                  class="h-full rounded-full bg-[var(--color-primary-400)] transition-all duration-500"
                  :style="{ width: `${Math.min(100, (topic.count / maxTopicCount) * 100)}%` }"
                />
              </div>
            </span>
            <span class="shrink-0 rounded-[8px] bg-[var(--color-secondary-100)] px-2 py-0.5 text-[11px] font-bold text-[var(--text-secondary)] group-hover:bg-[var(--color-primary-100)] group-hover:text-[var(--color-primary-700)]">
              {{ topic.count }}
            </span>
          </div>
        </button>
      </div>
    </div>

    <!-- Featured authors card -->
    <div class="overflow-hidden rounded-[24px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]">
      <div class="border-b border-[var(--border-light)] px-4 py-3.5">
        <div class="flex items-center gap-2">
          <span class="flex h-7 w-7 items-center justify-center rounded-[10px] bg-[#fff0f9]">
            <Icon name="i-ph-star-fill" class="h-4 w-4 text-[#e879a0]" />
          </span>
          <p id="blogs-sidebar-authors-title" class="text-[12px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-primary)]">
            {{ $t("pages.blogsPage.authorsThisWeek") }}
          </p>
        </div>
      </div>

      <div class="space-y-1.5 p-3" role="list" aria-labelledby="blogs-sidebar-authors-title">
        <div
          v-for="(author, idx) in featuredAuthors"
          :key="author.name"
          class="flex items-center gap-3 rounded-[14px] px-3 py-2.5"
          role="listitem"
        >
          <span
            class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black"
            :class="rankClasses[idx] ?? 'bg-[var(--color-secondary-100)] text-[var(--text-tertiary)]'"
          >
            {{ idx + 1 }}
          </span>

          <div
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
            :style="{ background: author.gradient }"
          >
            {{ author.initials }}
          </div>

          <div class="min-w-0 flex-1">
            <p class="truncate text-[13px] font-bold text-[var(--text-primary)]">{{ author.name }}</p>
            <p class="text-[11px] text-[var(--text-tertiary)]">
              {{ $t("pages.blogsPage.authorArticleTopic", { count: author.count, topic: author.topic }) }}
            </p>
          </div>

          <span class="shrink-0 rounded-[8px] bg-[var(--color-secondary-50)] px-2 py-0.5 text-[11px] font-bold text-[var(--text-secondary)]">
            {{ author.count }}
          </span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
const props = defineProps<{
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

const topicBgColors = [
  'rgba(99,102,241,0.1)',
  'rgba(16,185,129,0.1)',
  'rgba(245,158,11,0.1)',
  'rgba(236,72,153,0.1)',
  'rgba(59,130,246,0.1)',
  'rgba(168,85,247,0.1)',
]

const rankClasses = [
  'bg-[#fde7b2] text-[#92400e]',
  'bg-[#e2e8f0] text-[#475569]',
  'bg-[#fed7aa] text-[#7c2d12]',
]

const maxTopicCount = computed(() =>
  Math.max(1, ...props.trendingTopics.map(t => t.count))
)
</script>
