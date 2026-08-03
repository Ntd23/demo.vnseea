<!-- English description: Renders the theme-aware home feed skeleton during SSR hydration and initial data loading. -->
<template>
  <div
    class="home-feed-loading"
    role="status"
    aria-busy="true"
    :aria-label="$t('pages.homeFeedPage.loadingMore')"
  >
    <section class="home-feed-loading__card home-feed-loading__stories">
      <div
        v-for="index in 6"
        :key="`story-${index}`"
        class="home-feed-loading__story"
      >
        <USkeleton class="h-14 w-14 rounded-full" />
        <USkeleton class="h-2.5 w-12 rounded-full" />
      </div>
    </section>

    <section class="home-feed-loading__card home-feed-loading__publisher">
      <div class="flex items-center gap-3">
        <USkeleton class="h-10 w-10 shrink-0 rounded-full" />
        <USkeleton class="h-10 min-w-0 flex-1 rounded-[var(--radius-lg)]" />
      </div>
      <div class="mt-4 flex justify-end gap-2">
        <USkeleton
          v-for="index in 4"
          :key="`action-${index}`"
          class="h-9 w-9 rounded-full"
        />
      </div>
    </section>

    <article
      v-for="index in 2"
      :key="`post-${index}`"
      class="home-feed-loading__card overflow-hidden"
    >
      <div class="flex items-center gap-3 p-4">
        <USkeleton class="h-11 w-11 shrink-0 rounded-full" />
        <div class="min-w-0 flex-1 space-y-2">
          <USkeleton class="h-3.5 w-32 max-w-full rounded-full" />
          <USkeleton class="h-3 w-24 max-w-full rounded-full" />
        </div>
      </div>
      <div class="space-y-2 px-4 pb-4">
        <USkeleton class="h-3.5 w-full rounded-full" />
        <USkeleton class="h-3.5 w-3/4 rounded-full" />
      </div>
      <USkeleton class="aspect-video w-full rounded-none" />
    </article>
  </div>
</template>

<style scoped>
.home-feed-loading {
  display: flex;
  min-height: calc(100dvh - 64px);
  flex-direction: column;
  gap: var(--space-4);
  padding-block: var(--space-2);
  background: transparent;
}

.home-feed-loading__card {
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
}

.home-feed-loading__stories {
  display: flex;
  gap: var(--space-3);
  overflow: hidden;
  padding: var(--space-4);
}

.home-feed-loading__story {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.home-feed-loading__publisher {
  padding: var(--space-4);
}
</style>
