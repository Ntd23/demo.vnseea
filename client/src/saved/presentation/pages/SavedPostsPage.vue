<!-- Description: Renders saved posts as a simple heading plus content-first list that matches the PHP saved posts page rhythm. -->
<template>
  <div class="mx-auto max-w-[1280px] space-y-5 px-3 pb-16 sm:px-5 lg:px-6">
    <section class="rounded-[26px] border border-[#dbe3f2] bg-white px-5 py-5 shadow-[0_12px_28px_rgba(15,35,110,0.06)]">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-2">
          <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
            {{ t("pages.savedPostsPage.listEyebrow") }}
          </p>
          <h1 class="text-[1.9rem] font-black tracking-[-0.04em] text-[var(--text-primary)] sm:text-[2.2rem]">
            {{ t("pages.savedPostsPage.listTitle", { count: visibleSavedPosts.length }) }}
          </h1>
          <p class="max-w-3xl text-[14px] leading-7 text-slate-500">
            {{ t("pages.savedPostsPage.listDescription") }}
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <NuxtLink
            :to="appRoutes.feed"
            class="inline-flex h-11 items-center justify-center rounded-[14px] border border-[#dbe3f2] bg-white px-5 text-[13px] font-bold text-[var(--text-primary)] transition hover:border-primary-200 hover:text-primary-700"
          >
            <Icon name="i-ph-house-line-duotone" class="mr-2 h-4 w-4" />
            {{ t("pages.savedPostsPage.backToFeed") }}
          </NuxtLink>

          <button
            v-if="visibleSavedPosts.length > 0"
            type="button"
            class="inline-flex h-11 items-center justify-center rounded-[14px] bg-primary-600 px-5 text-[13px] font-bold text-white shadow-[0_12px_24px_rgba(37,99,235,0.18)] transition hover:-translate-y-0.5 hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
            :disabled="removingAll"
            @click="removeAll"
          >
            <Icon v-if="removingAll" name="i-lucide-loader-2" class="mr-2 h-4 w-4 animate-spin" />
            <Icon v-else name="i-ph-trash-duotone" class="mr-2 h-4 w-4" />
            {{ t("pages.savedPostsPage.removeAll") }}
          </button>
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
        <span>{{ t("pages.savedPostsPage.listEyebrow") }}</span>
      </div>
    </section>

    <section
      v-else-if="visibleSavedPosts.length === 0"
      class="rounded-[28px] border border-[#dbe3f2] bg-white px-6 py-14 text-center shadow-[0_14px_34px_rgba(15,35,110,0.06)]"
    >
      <div class="mx-auto max-w-2xl space-y-6">
        <FoundationEmptyState
          icon="i-ph-bookmark-simple-duotone"
          :title="t('pages.savedPostsPage.emptyTitle')"
          :description="t('pages.savedPostsPage.emptyDescription')"
        />

        <div class="flex flex-wrap justify-center gap-3">
          <UButton :to="appRoutes.explore" color="neutral" variant="outline" class="rounded-[14px] px-5 font-bold">
            {{ t("pages.savedPostsPage.goToExplore") }}
          </UButton>
        </div>
      </div>
    </section>

    <section
      v-else
      class="overflow-hidden rounded-[26px] border border-[#dbe3f2] bg-white shadow-[0_12px_28px_rgba(15,35,110,0.06)]"
    >
      <div class="divide-y divide-[#eef2fb]">
        <div v-for="item in visibleSavedPosts" :key="item.id" class="p-4 sm:p-5">
          <SavedPostCard
            :entry="item"
            @remove="removeSavedPost"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import { createApiFeedRepository } from "../../../feed/infrastructure/repositories/ApiFeedRepository"
import SavedPostCard from "../components/PostCard.vue"
import type { SavedPostEntry } from "../../application/composables/useSavedPostsData"
import { mapFeedPostsToSavedPosts } from "../../application/composables/useSavedPostsData"

const { t } = useI18n()
const repository = createApiFeedRepository()

const loading = ref(true)
const removingAll = ref(false)
const errorMessage = ref("")
const savedPosts = ref<SavedPostEntry[]>([])
const removedIds = ref<string[]>([])

const visibleSavedPosts = computed(() =>
  savedPosts.value.filter(item => !removedIds.value.includes(item.id)),
)

async function fetchSavedPosts() {
  loading.value = true
  errorMessage.value = ""

  try {
    const response = await repository.getSaved({ limit: 20 })
    savedPosts.value = mapFeedPostsToSavedPosts(response.posts)
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : t("pages.savedPostsPage.emptyDescription")
  }
  finally {
    loading.value = false
  }
}

async function removeSavedPost(id: string) {
  if (removedIds.value.includes(id)) return

  const entry = savedPosts.value.find(item => item.id === id)
  if (!entry) return

  errorMessage.value = ""

  try {
    await repository.runPostAction({
      action: "save",
      postId: entry.postId,
    })
    removedIds.value = [...removedIds.value, id]
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : t("pages.savedPostsPage.emptyDescription")
  }
}

async function removeAll() {
  if (removingAll.value) return

  removingAll.value = true
  errorMessage.value = ""

  try {
    for (const entry of visibleSavedPosts.value) {
      await repository.runPostAction({
        action: "save",
        postId: entry.postId,
      })
    }

    removedIds.value = savedPosts.value.map(item => item.id)
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : t("pages.savedPostsPage.emptyDescription")
  }
  finally {
    removingAll.value = false
  }
}

useSeoMeta({
  title: () => t("pages.savedPostsPage.seoTitle"),
  description: () => t("pages.savedPostsPage.seoDescription"),
})

await fetchSavedPosts()
</script>
