<template>
  <div class="space-y-5 pb-10">
    <section class="overflow-hidden rounded-[34px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)]">
      <div class="grid gap-0 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div class="p-6 sm:p-8 lg:p-10">
          <NuxtLink
            to="/funding"
            class="inline-flex items-center gap-2 rounded-full bg-[var(--color-soft)] px-4 py-2 text-sm font-extrabold text-[var(--color-primary)]"
          >
            <Icon name="i-ph-arrow-left-bold" class="h-4 w-4" />
            {{ $t("pages.createFundingPage.backToFunding") }}
          </NuxtLink>
          <p class="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]">{{ $t("pages.createFundingPage.heroEyebrow") }}</p>
          <h1 class="mt-3 text-3xl font-black leading-tight text-[var(--color-text)] sm:text-4xl">
            {{ $t("pages.createFundingPage.heroTitle") }}
          </h1>
          <p class="mt-4 max-w-2xl text-base font-semibold leading-7 text-[var(--color-muted)]">
            {{ $t("pages.createFundingPage.heroDescription") }}
          </p>
        </div>

        <div class="border-t border-[var(--color-border)] bg-[var(--color-soft)] p-6 lg:border-l lg:border-t-0">
          <div class="rounded-[28px] bg-white p-5 shadow-[var(--shadow-card)]">
            <div class="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[var(--color-primary)] text-white">
              <Icon name="i-ph-hand-heart-fill" class="h-7 w-7" />
            </div>
            <h2 class="mt-4 text-xl font-extrabold text-[var(--color-text)]">{{ $t("pages.createFundingPage.prepTitle") }}</h2>
            <ul class="mt-4 space-y-3 text-sm font-semibold leading-6 text-[var(--color-muted)]">
              <li class="flex gap-2">
                <Icon name="i-ph-check-circle-fill" class="mt-1 h-4 w-4 shrink-0 text-[var(--color-success)]" />
                {{ $t("pages.createFundingPage.prepItem1") }}
              </li>
              <li class="flex gap-2">
                <Icon name="i-ph-check-circle-fill" class="mt-1 h-4 w-4 shrink-0 text-[var(--color-success)]" />
                {{ $t("pages.createFundingPage.prepItem2") }}
              </li>
              <li class="flex gap-2">
                <Icon name="i-ph-check-circle-fill" class="mt-1 h-4 w-4 shrink-0 text-[var(--color-success)]" />
                {{ $t("pages.createFundingPage.prepItem3") }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
      <FundingCreateFundingForm
        :categories="fundingCategories"
        @create="recordCreatedCampaign"
      />

      <aside class="space-y-4">
        <div class="rounded-[28px] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
          <p class="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">{{ $t("pages.createFundingPage.afterCreateEyebrow") }}</p>
          <h2 class="mt-2 text-xl font-extrabold text-[var(--color-text)]">{{ $t("pages.createFundingPage.previewTitle") }}</h2>
          <p class="mt-3 text-sm font-semibold leading-6 text-[var(--color-muted)]">
            {{ $t("pages.createFundingPage.previewDescription") }}
          </p>
          <NuxtLink
            to="/funding"
            class="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[18px] border border-[var(--color-border)] px-5 py-3 text-sm font-extrabold text-[var(--color-primary)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-soft)]"
          >
            {{ $t("pages.createFundingPage.viewFundingList") }}
            <Icon name="i-ph-arrow-right-bold" class="h-4 w-4" />
          </NuxtLink>
        </div>

        <div
          v-if="createdCount > 0"
          class="rounded-[28px] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]"
        >
          <p class="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">{{ $t("pages.createFundingPage.mockSession") }}</p>
          <p class="mt-2 text-3xl font-black text-[var(--color-primary)]">{{ createdCount }}</p>
          <p class="mt-1 text-sm font-semibold text-[var(--color-muted)]">{{ $t("pages.createFundingPage.createdCount", { count: createdCount }) }}</p>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FundingCreatePayload } from "../../domain/types/funding.types"
import { useFundingCatalog } from "../../infrastructure/mocks/fundingCatalog"
import FundingCreateFundingForm from "../components/CreateFundingForm.vue"

const { t } = useI18n()
const { fundingCategories } = useFundingCatalog()

const createdCount = ref(0)

const recordCreatedCampaign = (_payload: FundingCreatePayload) => {
  createdCount.value += 1
}
</script>
