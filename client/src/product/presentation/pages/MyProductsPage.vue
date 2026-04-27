<template>
  <div class="mx-auto max-w-[1280px] space-y-10 pb-20 px-4 sm:px-6 pt-4">
    <!-- Header Section -->
    <section class="surface-card p-8 sm:p-10 ring-1 ring-secondary-200/50 shadow-2xl bg-white relative overflow-hidden group/header">
      <div class="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent pointer-events-none" />
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div class="flex items-center gap-6">
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-[var(--text-primary)] shadow-lg shadow-primary-500/10 ring-1 ring-primary-100/50 group-hover/header:scale-110 transition-transform duration-500">
            <Icon name="i-ph-storefront-duotone" class="h-8 w-8" />
          </div>
          <div>
            <p class="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-primary)] pl-1">
              {{ $t("pages.myProductsPage.eyebrow") }}
            </p>
            <h1 class="mt-2 text-4xl font-black tracking-tight text-[var(--text-primary)] leading-none">
              {{ $t("pages.myProductsPage.title") }}
            </h1>
          </div>
        </div>

        <NuxtLink
          to="/new-product"
          class="inline-flex h-14 items-center justify-center rounded-2xl bg-primary-600 px-8 text-sm font-black text-white hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all active:scale-95 group/btn"
        >
          <Icon name="i-ph-plus-bold" class="mr-3 h-5 w-5 group-hover/btn:rotate-90 transition-transform" />
          {{ $t("pages.myProductsPage.create") }}
        </NuxtLink>
      </div>
    </section>

    <!-- Navigation Section -->
    <section class="surface-card p-3 rounded-full bg-white/80 backdrop-blur-3xl ring-1 ring-secondary-200/50 shadow-xl inline-flex w-full md:w-auto">
      <div class="flex flex-col md:flex-row w-full gap-2">
        <button
          class="flex-1 md:flex-none inline-flex h-12 items-center justify-center rounded-full bg-primary-600 px-6 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary-600/20 active:scale-95 transition-all"
        >
          <Icon name="i-ph-shopping-bag-duotone" class="mr-3 h-4 w-4" />
          {{ $t("pages.myProductsPage.myProducts") }}
        </button>
        
        <button
          class="flex-1 md:flex-none inline-flex h-12 items-center justify-center rounded-full border border-secondary-200/50 bg-white px-6 text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)] hover:text-secondary-900 hover:bg-secondary-50 transition-all active:scale-95"
        >
          <Icon name="i-ph-receipt-duotone" class="mr-3 h-4 w-4" />
          {{ $t("pages.myProductsPage.purchased") }}
        </button>

        <NuxtLink
          to="/products"
          class="flex-1 md:flex-none inline-flex h-12 items-center justify-center rounded-full border border-secondary-200/50 bg-white px-6 text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)] hover:text-secondary-900 hover:bg-secondary-50 transition-all active:scale-95"
        >
          <Icon name="i-ph-planet-duotone" class="mr-3 h-4 w-4" />
          {{ $t("pages.myProductsPage.marketplace") }}
        </NuxtLink>
      </div>
    </section>

    <!-- Stats Section -->
    <div class="grid gap-6 md:grid-cols-3">
      <div
        v-for="card in overviewCards"
        :key="card.label"
        class="surface-card p-8 sm:p-10 ring-1 ring-secondary-200/50 shadow-2xl bg-white relative overflow-hidden group/stats hover:shadow-3xl transition-all duration-500"
      >
        <div class="absolute -right-4 -top-4 text-secondary-900/5 group-hover/stats:scale-125 transition-transform duration-700">
          <Icon :name="card.icon" class="h-24 w-24" />
        </div>

        <div class="relative z-10 space-y-4">
          <div class="flex items-center gap-3">
            <div class="h-1.5 w-1.5 rounded-full bg-primary-500" />
            <p class="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-primary)]">
              {{ card.label }}
            </p>
          </div>
          <p class="text-5xl font-black text-[var(--text-primary)] tracking-tighter">
            {{ card.value }}
          </p>
          <p class="text-sm font-medium leading-relaxed text-[var(--text-primary)] italic">
            {{ card.description }}
          </p>
        </div>
      </div>
    </div>

    <!-- Empty State Section -->
    <section class="surface-card p-16 sm:p-24 ring-1 ring-secondary-200/50 shadow-2xl bg-white relative overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(var(--color-primary-500-rgb),0.05)_0%,_transparent_70%)]" />
      
      <div class="relative z-10 mx-auto flex max-w-[560px] flex-col items-center text-center">
        <div class="flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-secondary-50 text-secondary-300 ring-4 ring-secondary-50/50 relative">
          <Icon name="i-ph-shopping-cart-simple-duotone" class="h-12 w-12" />
        </div>
        
        <h2 class="mt-10 text-3xl font-black tracking-tight text-[var(--text-primary)] leading-tight">
          {{ $t("pages.myProductsPage.emptyTitle") }}
        </h2>
        <p class="mt-4 text-base font-medium leading-relaxed text-[var(--text-primary)] max-w-[420px]">
          {{ $t("pages.myProductsPage.emptyDescription") }}
        </p>

        <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          <NuxtLink
            to="/new-product"
            class="w-full sm:w-auto inline-flex h-14 items-center justify-center rounded-2xl bg-primary-600 px-8 text-sm font-black text-white shadow-lg shadow-primary-600/20 active:scale-95 transition-all"
          >
            <Icon name="i-ph-plus-bold" class="mr-3 h-5 w-5" />
            {{ $t("pages.myProductsPage.createFirst") }}
          </NuxtLink>
          
          <NuxtLink
            to="/products"
            class="w-full sm:w-auto inline-flex h-14 items-center justify-center rounded-2xl border border-secondary-200/50 bg-white px-8 text-sm font-black text-[var(--text-primary)] hover:bg-secondary-50 active:scale-95 transition-all"
          >
            {{ $t("pages.myProductsPage.viewMarketplace") }}
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useMyProductsOverview } from "../../application/composables/useMyProductsOverview"

const { t } = useI18n()

useSeoMeta({
  title: () => t("pages.myProductsPage.seoTitle"),
  description: () => t("pages.myProductsPage.seoDescription"),
})

const { overviewCards } = useMyProductsOverview()
</script>
