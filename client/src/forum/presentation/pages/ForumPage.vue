<!-- English description: Backend-backed forum sections page aligned to the WoWonder forum phtml section table. -->
<template>
  <main class="mx-auto w-full max-w-6xl space-y-5 px-3 py-4 sm:px-5">
    <section class="surface-card p-4 sm:p-5">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <span class="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-surface-active)] text-[var(--text-brand)]">
            <Icon name="i-ph-chats-circle-duotone" class="h-6 w-6" />
          </span>
          <div>
            <p class="text-label-secondary">Forum</p>
            <h1 class="text-heading">{{ t("pages.forumPage.heroTitle") }}</h1>
          </div>
        </div>

        <UButton
          v-if="canCreate && firstForumId"
          :to="`/forumaddthred?fid=${firstForumId}`"
          color="primary"
          class="rounded-[var(--radius-full)]"
        >
          <Icon name="i-ph-plus-bold" class="h-4 w-4" />
          {{ t("pages.forumPage.createThreadButton") }}
        </UButton>
      </div>
    </section>

    <section class="surface-card p-3">
      <form class="flex gap-2" @submit.prevent="syncQuery">
        <UInput
          v-model="search"
          icon="i-ph-magnifying-glass-duotone"
          :placeholder="t('pages.forumPage.searchPlaceholder')"
          class="w-full"
        />
        <UButton
          type="submit"
          color="primary"
          class="rounded-[var(--radius-full)]"
          :aria-label="t('pages.forumPage.searchPlaceholder')"
        >
          <Icon name="i-ph-magnifying-glass-bold" class="h-4 w-4" />
        </UButton>
      </form>
    </section>

    <section v-if="pending" class="space-y-4">
      <USkeleton v-for="index in 3" :key="index" class="h-44 rounded-[var(--radius-xl)]" />
    </section>

    <UAlert v-else-if="error" color="error" variant="soft" :title="String(error.message || error)" />

    <section v-else-if="sections.length" class="space-y-4">
      <article v-for="section in sections" :key="section.id" class="surface-card overflow-hidden">
        <header class="border-b border-[var(--border-light)] p-4">
          <h2 class="text-title-primary">{{ section.title }}</h2>
          <p v-if="section.description" class="text-body-secondary mt-1">{{ section.description }}</p>
        </header>

        <div class="divide-y divide-[var(--border-light)]">
          <NuxtLink
            v-for="forum in section.forums"
            :key="forum.id"
            :to="forum.url"
            class="grid gap-3 p-4 transition hover:bg-[var(--bg-surface-hover)] sm:grid-cols-[minmax(0,1fr)_120px]"
          >
            <div class="flex min-w-0 gap-3">
              <span class="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-surface-active)] text-[var(--text-brand)]">
                <Icon name="i-ph-chat-centered-text-duotone" class="h-5 w-5" />
              </span>
              <div class="min-w-0">
                <h3 class="text-title-primary truncate">{{ forum.title }}</h3>
                <p class="text-body-secondary mt-1 line-clamp-2">{{ forum.description }}</p>
              </div>
            </div>
            <div class="text-caption-secondary flex items-center sm:justify-end">
              {{ forum.posts }} {{ t("pages.forumPage.repliesLabel") }}
            </div>
          </NuxtLink>
        </div>
      </article>
    </section>

    <UCard v-else class="surface-card text-center" :ui="{ body: 'p-8' }">
      <Icon name="i-ph-chats-circle-duotone" class="mx-auto h-10 w-10 text-[var(--text-tertiary)]" />
      <h2 class="text-heading mt-3">{{ t("pages.forumPage.emptyTitle") }}</h2>
      <p class="text-body-secondary mt-2">{{ t("pages.forumPage.emptyDescription") }}</p>
    </UCard>

    <div v-if="hasMore && !pending" class="flex justify-center">
      <UButton
        color="neutral"
        variant="soft"
        class="rounded-[var(--radius-full)]"
        :loading="loadingMore"
        @click="loadMore"
      >
        {{ t("navigation.leftSidebar.showMore") }}
      </UButton>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useForumPageVM } from "../../application/view-models/useForumPageVM"

const { t } = useI18n()
const {
  search,
  sections,
  canCreate,
  hasMore,
  pending,
  error,
  loadingMore,
  syncQuery,
  loadMore,
} = useForumPageVM()

const firstForumId = computed(() => sections.value.flatMap(section => section.forums)[0]?.id ?? null)
</script>
