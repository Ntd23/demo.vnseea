<template>
  <div class="space-y-5 pb-10">
    <section class="rounded-[28px] border border-[#dbe3f2] bg-white p-4 shadow-[0_14px_34px_rgba(15,35,110,0.07)] sm:p-5">
      <div class="flex items-center gap-3">
        <div class="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#eef0ff] text-[#0000ff] shadow-[0_8px_18px_rgba(0,0,255,0.08)]">
          <Icon name="i-ph-storefront-fill" class="h-6 w-6" />
        </div>
        <div>
          <p class="text-[12px] font-bold uppercase tracking-[0.26em] text-[#0000ff]/70">
            {{ $t("pages.myProductsPage.eyebrow") }}
          </p>
          <h1 class="mt-1 text-[1.55rem] font-black tracking-[-0.05em] text-[#243b63]">
            {{ $t("pages.myProductsPage.title") }}
          </h1>
        </div>
      </div>
    </section>

    <section class="rounded-[28px] border border-[#dbe3f2] bg-white p-3 shadow-[0_14px_34px_rgba(15,35,110,0.07)]">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div class="flex flex-wrap gap-2">
          <button
            class="inline-flex h-11 items-center justify-center rounded-full border border-[#0000ff]/15 bg-[#eef0ff] px-4 text-[14px] font-bold text-[#0000ff] shadow-[inset_0_-2px_0_rgba(0,0,255,0.18)]"
            type="button"
          >
            {{ $t("pages.myProductsPage.myProducts") }}
          </button>
          <button
            class="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe3f2] bg-white px-4 text-[14px] font-semibold text-slate-500 transition hover:border-[#c5caff] hover:text-[#243b63]"
            type="button"
          >
            {{ $t("pages.myProductsPage.purchased") }}
          </button>
          <NuxtLink
            to="/products"
            class="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe3f2] bg-white px-4 text-[14px] font-semibold text-slate-500 transition hover:border-[#c5caff] hover:text-[#243b63]"
          >
            {{ $t("pages.myProductsPage.marketplace") }}
          </NuxtLink>
        </div>

        <NuxtLink
          to="/new-product"
          class="inline-flex h-11 items-center justify-center rounded-full bg-[#0000ff] px-5 text-[14px] font-extrabold text-white shadow-[0_10px_22px_rgba(0,0,255,0.2)] transition hover:-translate-y-0.5"
        >
          <Icon name="i-ph-plus-bold" class="mr-2 h-4 w-4" />
          {{ $t("pages.myProductsPage.create") }}
        </NuxtLink>
      </div>
    </section>

    <div class="grid gap-3 md:grid-cols-3">
      <div
        v-for="card in overviewCards"
        :key="card.label"
        class="rounded-[22px] border border-[#dbe3f2] bg-white p-4 shadow-[0_8px_20px_rgba(15,35,110,0.05)]"
      >
        <p class="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
          {{ card.label }}
        </p>
        <p class="mt-2 text-[1.8rem] font-black leading-none text-[#243b63]">
          {{ card.value }}
        </p>
        <p class="mt-2 text-[13px] leading-6 text-slate-500">
          {{ card.description }}
        </p>
      </div>
    </div>

    <section class="rounded-[30px] border border-[#dbe3f2] bg-[#f5f8ff]/80 px-5 py-12 shadow-[0_14px_34px_rgba(15,35,110,0.05)] sm:px-8 sm:py-16">
      <div class="mx-auto flex max-w-[560px] flex-col items-center text-center">
        <div class="flex h-20 w-20 items-center justify-center rounded-full bg-[#dfe7f3] text-[#8da1b6]">
          <Icon name="i-ph-shopping-cart-simple-fill" class="h-10 w-10" />
        </div>
        <h2 class="mt-6 text-[1.5rem] font-black tracking-[-0.05em] text-[#243b63]">
          {{ $t("pages.myProductsPage.emptyTitle") }}
        </h2>
        <p class="mt-3 text-[14px] leading-7 text-slate-500 sm:text-[15px]">
          {{ $t("pages.myProductsPage.emptyDescription") }}
        </p>

        <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
          <NuxtLink
            to="/new-product"
            class="inline-flex h-12 items-center justify-center rounded-full bg-[#0000ff] px-5 text-[14px] font-extrabold text-white shadow-[0_10px_22px_rgba(0,0,255,0.2)] transition hover:-translate-y-0.5"
          >
            <Icon name="i-ph-plus-bold" class="mr-2 h-4 w-4" />
            {{ $t("pages.myProductsPage.createFirst") }}
          </NuxtLink>
          <NuxtLink
            to="/products"
            class="inline-flex h-12 items-center justify-center rounded-full border border-[#dbe3f2] bg-white px-5 text-[14px] font-semibold text-slate-600 transition hover:border-[#c5caff] hover:text-[#243b63]"
          >
            {{ $t("pages.myProductsPage.viewMarketplace") }}
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t("pages.myProductsPage.seoTitle"),
  description: () => t("pages.myProductsPage.seoDescription"),
})

const overviewCards = computed(() => [
  {
    label: t("pages.myProductsPage.activeListings"),
    value: "0",
    description: t("pages.myProductsPage.activeListingsDescription"),
  },
  {
    label: t("pages.myProductsPage.drafts"),
    value: "0",
    description: t("pages.myProductsPage.draftsDescription"),
  },
  {
    label: t("pages.myProductsPage.sold"),
    value: "0",
    description: t("pages.myProductsPage.soldDescription"),
  },
] as const)
</script>
