<template>
  <section class="overflow-hidden rounded-[32px] border border-[#dbe3f2] bg-white shadow-[0_20px_50px_rgba(15,35,110,0.08)]">
    <div class="grid gap-8 p-6 sm:p-10 xl:grid-cols-[minmax(0,1fr)_480px] xl:items-stretch">
      <div class="flex min-w-0 flex-col justify-between gap-10 rounded-[28px] bg-[#0f172a] p-6 text-white sm:p-10">
        <div class="space-y-6">
          <div class="flex flex-wrap items-center gap-3">
            <span class="inline-flex h-9 items-center rounded-2xl bg-white/10 px-4 text-[12px] font-black uppercase tracking-[0.15em] text-white backdrop-blur-xl border border-white/20">
              {{ t("pages.directoryPage.heroEyebrow") }}
            </span>
            <span v-if="activeCategoryLabel" class="inline-flex h-9 items-center rounded-2xl bg-primary-600 px-4 text-[12px] font-black uppercase tracking-[0.15em] text-white shadow-lg shadow-primary-600/30">
              {{ activeCategoryLabel }}
            </span>
          </div>

          <div class="space-y-4">
            <h1 class="max-w-[720px] text-[38px] font-black leading-tight tracking-tight sm:text-[56px]">
              {{ t("pages.directoryPage.heroTitle") }}
            </h1>
            <p class="max-w-xl text-[16px] font-medium leading-relaxed text-white/60">
              {{ t("pages.directoryPage.heroDescription") }}
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-4">
          <UButton
            color="primary"
            size="xl"
            class="h-14 rounded-2xl px-8 font-black shadow-2xl shadow-primary-500/40 hover:-translate-y-1 transition-all"
          >
            <template #leading>
              <Icon name="i-ph-lightning-fill" class="h-5 w-5" />
            </template>
            {{ t("pages.directoryPage.heroPrimaryCta") }}
          </UButton>
          
          <button class="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all">
            <Icon name="i-ph-share-network-duotone" class="h-6 w-6" />
          </button>
        </div>
      </div>

      <div class="grid gap-4">
        <div class="rounded-[28px] bg-slate-50 p-8 text-[#0f172a] shadow-inner relative overflow-hidden group border border-slate-100">
          <div class="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-500/5 blur-3xl transition-transform group-hover:scale-150" />
          
          <div class="relative flex items-start justify-between">
            <div class="space-y-1">
              <p class="text-[11px] font-black uppercase tracking-widest text-slate-400">
                {{ statusLabel }}
              </p>
              <p class="text-[38px] font-black leading-none">
                {{ stats[1].value }}
              </p>
            </div>
            <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl">
              <Icon name="i-ph-squares-four-fill" class="h-7 w-7 text-primary-600" />
            </div>
          </div>
          <p class="mt-4 text-[13px] font-bold text-slate-500">{{ t("pages.directoryPage.heroDescription") }}</p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div v-for="stat in [stats[0], stats[2]]" :key="stat.label" class="rounded-[24px] border border-[#dbe3f2] bg-white p-6 shadow-sm">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {{ stat.label }}
            </p>
            <p class="mt-2 text-[28px] font-black text-[#0f172a]">
              {{ stat.value }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()

defineProps<{
  stats: ReadonlyArray<{ label: string; value: string | number; description: string }>
  statusLabel: string
  activeCategoryLabel?: string
  searchTerm?: string
}>()
</script>
