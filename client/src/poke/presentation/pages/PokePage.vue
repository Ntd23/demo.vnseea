<!-- Description: Renders the poke page as a heading plus poke list that matches the PHP order and empty-state placement. -->
<template>
  <div class="mx-auto max-w-[1280px] space-y-5 px-3 pb-20 sm:px-5 lg:px-6">
    <section class="rounded-[26px] border border-[#dbe3f2] bg-white px-5 py-5 shadow-[0_12px_28px_rgba(15,35,110,0.06)]">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-2">
          <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
            {{ t("pages.pokePage.heroEyebrow") }}
          </p>
          <h1 class="text-[1.9rem] font-black tracking-[-0.04em] text-[var(--text-primary)] sm:text-[2.2rem]">
            {{ t("pages.pokePage.heroTitle") }}
          </h1>
          <p class="max-w-3xl text-[14px] leading-7 text-slate-500">
            {{ t("pages.pokePage.heroDescription") }}
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <NuxtLink
            :to="appRoutes.messages"
            class="inline-flex h-11 items-center justify-center rounded-[14px] border border-[#dbe3f2] bg-white px-5 text-[13px] font-bold text-[var(--text-primary)] transition hover:border-primary-200 hover:text-primary-700"
          >
            <Icon name="i-ph-chat-circle-dots-duotone" class="mr-2 h-4 w-4" />
            {{ t("pages.pokePage.openMessages") }}
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
        <span>{{ t("pages.pokePage.heroEyebrow") }}</span>
      </div>
    </section>

    <section v-else class="rounded-[22px] border border-[#dbe3f2] bg-white px-5 py-4 text-[14px] leading-6 text-slate-500 shadow-[0_8px_20px_rgba(15,35,110,0.04)]">
      <strong class="mr-2 text-[var(--text-primary)]">{{ t("pages.pokePage.pendingLabel") }}</strong>
      {{ formatCount(pendingPokeCount) }}
    </section>

    <section v-if="!loading" class="rounded-[26px] border border-[#dbe3f2] bg-white p-5 shadow-[0_12px_28px_rgba(15,35,110,0.06)]">
      <div class="space-y-2 border-b border-[#eef2fb] pb-4">
        <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
          {{ t("pages.pokePage.listEyebrow") }}
        </p>
        <h2 class="text-[1.45rem] font-black tracking-[-0.03em] text-[var(--text-primary)]">
          {{ t("pages.pokePage.listTitle", { count: pokeRecords.length }) }}
        </h2>
        <p class="text-[14px] leading-6 text-slate-500">
          {{ t("pages.pokePage.listDescription") }}
        </p>
      </div>

      <div class="mt-5 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <PokeRequestCard
          v-for="item in pokeRecords"
          :key="item.id"
          :record="item"
          :poked-back="pokedBackIds.includes(item.id)"
          @poke="pokeBack"
          @remove="removePoke"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import type { PokeRecord } from "../../application/composables/usePokeData"
import { createApiFeedRepository } from "../../../feed/infrastructure/repositories/ApiFeedRepository"
import PokeRequestCard from "../components/RequestCard.vue"
const repository = createApiFeedRepository()
const { t, locale } = useI18n()
const loading = ref(true)
const errorMessage = ref("")
const pokeRecords = ref<PokeRecord[]>([])
const pokedBackIds = ref<string[]>([])

const pokedBackCount = computed(() => pokedBackIds.value.length)
const pendingPokeCount = computed(() => pokeRecords.value.length - pokedBackCount.value)
const formatCount = (value: number) =>
  value.toLocaleString(locale.value === "vi" ? "vi-VN" : "en-US")

async function fetchPokes() {
  loading.value = true
  errorMessage.value = ""

  try {
    pokeRecords.value = await repository.getPokes()
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : t("pages.pokePage.listDescription")
  }
  finally {
    loading.value = false
  }
}

async function pokeBack(id: string) {
  if (pokedBackIds.value.includes(id)) return

  const record = pokeRecords.value.find(item => item.id === id)
  if (!record) return

  errorMessage.value = ""

  try {
    await repository.runPokeAction({
      action: "create",
      userId: record.userId,
      pokeId: record.pokeId,
    })
    pokedBackIds.value = [...pokedBackIds.value, id]
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : t("pages.pokePage.listDescription")
  }
}

async function removePoke(id: string) {
  const record = pokeRecords.value.find(item => item.id === id)
  if (!record) return

  errorMessage.value = ""

  try {
    await repository.runPokeAction({
      action: "remove",
      pokeId: record.pokeId,
    })
    pokeRecords.value = pokeRecords.value.filter(item => item.id !== id)
    pokedBackIds.value = pokedBackIds.value.filter(item => item !== id)
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : t("pages.pokePage.listDescription")
  }
}

useSeoMeta({
  title: () => t("pages.pokePage.seoTitle"),
  description: () => t("pages.pokePage.seoDescription"),
})

await fetchPokes()
</script>
