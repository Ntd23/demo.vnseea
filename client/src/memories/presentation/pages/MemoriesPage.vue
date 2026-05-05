<!-- Description: Renders the memories page with the PHP-style order of header, friendversaries, then memory posts. -->
<template>
  <div class="mx-auto max-w-[1280px] space-y-5 px-3 pb-16 sm:px-5 lg:px-6">
    <section class="rounded-[26px] border border-[#dbe3f2] bg-white px-5 py-5 shadow-[0_12px_28px_rgba(15,35,110,0.06)]">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-2">
          <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
            {{ t("pages.memoriesPage.heroEyebrow") }}
          </p>
          <h1 class="text-[1.9rem] font-black tracking-[-0.04em] text-[var(--text-primary)] sm:text-[2.2rem]">
            {{ t("pages.memoriesPage.heroTitle") }}
          </h1>
          <p class="max-w-3xl text-[14px] leading-7 text-slate-500">
            {{ t("pages.memoriesPage.heroDescription") }}
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <NuxtLink
            :to="appRoutes.feed"
            class="inline-flex h-11 items-center justify-center rounded-[14px] border border-[#dbe3f2] bg-white px-5 text-[13px] font-bold text-[var(--text-primary)] transition hover:border-primary-200 hover:text-primary-700"
          >
            <Icon name="i-ph-house-line-duotone" class="mr-2 h-4 w-4" />
            {{ t("pages.memoriesPage.homeFeed") }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <UAlert
      v-if="errorMessage"
      color="warning"
      variant="subtle"
      icon="i-ph-warning-circle-fill"
      class="rounded-[22px]"
      :description="errorMessage"
    />

    <section
      v-if="loading"
      class="rounded-[28px] border border-[#dbe3f2] bg-white px-6 py-14 text-center shadow-[0_14px_34px_rgba(15,35,110,0.06)]"
    >
      <div class="flex items-center justify-center gap-3 text-sm font-bold text-slate-500">
        <Icon name="i-lucide-loader-2" class="h-5 w-5 animate-spin" />
        <span>{{ t("pages.memoriesPage.heroEyebrow") }}</span>
      </div>
    </section>

    <section v-else class="rounded-[26px] border border-[#dbe3f2] bg-white p-5 shadow-[0_12px_28px_rgba(15,35,110,0.06)]">
      <div class="space-y-2">
        <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
          {{ t("pages.memoriesPage.statYears") }}
        </p>
        <h2 class="text-[1.45rem] font-black tracking-[-0.03em] text-[var(--text-primary)]">
          {{ t("pages.memoriesPage.sectionTitle", { count: memoryFriends.length }) }}
        </h2>
      </div>

      <div class="mt-4 grid gap-4 md:grid-cols-2">
        <article
          v-for="friend in memoryFriends"
          :key="friend.id"
          class="rounded-[22px] border border-[#e2e8f0] bg-[#f8fafc] p-4"
        >
          <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
            {{ friend.label }}
          </p>
          <h3 class="mt-2 text-lg font-black text-[var(--text-primary)]">
            {{ friend.name }}
          </h3>
          <p class="mt-2 text-sm leading-6 text-slate-600">
            {{ friend.note }}
          </p>
        </article>
      </div>
    </section>

    <section class="overflow-hidden rounded-[26px] border border-[#dbe3f2] bg-white shadow-[0_12px_28px_rgba(15,35,110,0.06)]">
      <div class="border-b border-[#eef2fb] px-5 py-4">
        <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
          {{ t("pages.memoriesPage.statMemories") }}
        </p>
        <h2 class="mt-2 text-[1.45rem] font-black tracking-[-0.03em] text-[var(--text-primary)]">
          {{ t("pages.memoriesPage.sectionTitle", { count: memoryEntries.length }) }}
        </h2>
        <p class="mt-1 text-[14px] leading-6 text-slate-500">
          {{ t("pages.memoriesPage.sectionDescription") }}
        </p>
      </div>

      <div class="mx-auto max-w-4xl px-4 py-5 sm:px-5">
        <MemoriesMemoryFeed
          :entries="memoryEntries"
          @share="shareMemory"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import type { FeedMemoryFriendRecord, FeedMemoryRecord } from "../../../feed/domain/types/feed.types"
import { createApiFeedRepository } from "../../../feed/infrastructure/repositories/ApiFeedRepository"
import MemoriesMemoryFeed from "../components/MemoryFeed.vue"
const route = useRoute()
const requestURL = useRequestURL()
const toast = useToast()
const repository = createApiFeedRepository()

const { t } = useI18n()
const loading = ref(true)
const errorMessage = ref("")
const memoryEntries = ref<FeedMemoryRecord[]>([])
const memoryFriends = ref<FeedMemoryFriendRecord[]>([])

async function fetchMemories() {
  loading.value = true
  errorMessage.value = ""

  try {
    const response = await repository.getMemories()
    memoryEntries.value = response.posts
    memoryFriends.value = response.friends
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : t("pages.memoriesPage.sectionDescription")
  }
  finally {
    loading.value = false
  }
}

async function shareMemory(id: string) {
  const entry = memoryEntries.value.find(item => item.id === id)
  if (!entry) return

  const shareUrl = new URL(`${route.path}#memory-post-${entry.post.id}`, requestURL.origin).toString()

  try {
    if (!import.meta.client || typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      throw new Error("clipboard_unavailable")
    }

    await navigator.clipboard.writeText(shareUrl)
    toast.add({
      color: "success",
      icon: "i-ph-share-network-fill",
      title: entry.post.author,
      description: t("pages.memoriesPage.sharedAction"),
    })
  }
  catch {
    toast.add({
      color: "primary",
      icon: "i-ph-link-bold",
      title: entry.post.author,
      description: shareUrl,
    })
  }
}

useSeoMeta({
  title: () => t("pages.memoriesPage.seoTitle"),
  description: () => t("pages.memoriesPage.seoDescription"),
})

await fetchMemories()
</script>
