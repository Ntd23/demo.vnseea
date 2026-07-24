<template>
  <section class="overflow-hidden rounded-[28px] border border-[var(--border-light)] bg-[var(--bg-surface)] shadow-[var(--shadow-md)]">
    <div class="grid gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_460px] xl:items-stretch">
      <div class="flex min-w-0 flex-col justify-between gap-8 rounded-[24px] bg-[linear-gradient(135deg,var(--bg-surface)_0%,var(--bg-muted)_100%)] p-5 ring-1 ring-[var(--border-light)] sm:p-7">
        <div class="space-y-4">
          <div class="flex flex-wrap items-center gap-2">
            <span class="inline-flex h-8 items-center rounded-full bg-[var(--bg-surface)] px-3 text-[12px] font-semibold text-[var(--text-brand)] ring-1 ring-[var(--bg-brand)]/20">
              {{ eyebrow }}
            </span>
            <span
              v-if="mainStat"
              class="inline-flex h-8 items-center rounded-full bg-[var(--bg-brand)] px-3 text-[12px] font-semibold text-[var(--text-inverse)]"
            >
              {{ mainStat.value }} {{ mainStat.label }}
            </span>
          </div>

          <div class="space-y-3">
            <h1 class="max-w-[760px] text-[34px] font-extrabold leading-tight text-[var(--text-primary)] sm:text-[48px]">
              {{ title }}
            </h1>
            <p class="max-w-xl text-[15px] font-medium leading-7 text-[var(--text-secondary)]">
              {{ description }}
            </p>
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-[auto_auto_1fr] sm:items-center">
          <NuxtLink
            :to="primaryTo"
            class="inline-flex h-12 items-center justify-center rounded-[12px] border border-[var(--border-light)] bg-[var(--bg-surface)] px-5 text-[14px] font-semibold text-[var(--text-primary)] transition hover:border-[var(--bg-brand)]/20 hover:bg-[var(--bg-muted)] hover:text-[var(--text-brand)] active:scale-95"
          >
            <Icon name="i-ph-house-line-duotone" class="mr-2 h-5 w-5 shrink-0" />
            {{ primaryLabel }}
          </NuxtLink>

          <NuxtLink
            :to="secondaryTo"
            class="inline-flex h-12 items-center justify-center rounded-[12px] bg-[var(--bg-brand)] px-5 text-[14px] font-semibold text-[var(--text-inverse)] shadow-[0_4px_14px_color-mix(in srgb, var(--bg-brand) 20%, transparent)] transition hover:bg-[var(--bg-brand-hover)] active:scale-95"
          >
            <Icon name="i-ph-magnifying-glass-duotone" class="mr-2 h-5 w-5 shrink-0" />
            {{ secondaryLabel }}
          </NuxtLink>
        </div>
      </div>

      <div class="grid gap-3">
        <div
          v-if="mainStat"
          class="rounded-[24px] border border-[var(--border-light)] bg-[var(--color-secondary-900)] p-5 text-[var(--text-inverse)] shadow-[var(--shadow-lg)]"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-inverse)]/52">
                {{ mainStat.label }}
              </p>
              <p class="mt-2 text-[34px] font-extrabold leading-none">
                {{ mainStat.value }}
              </p>
              <p class="mt-3 max-w-[320px] text-[13px] font-semibold leading-6 text-[var(--text-inverse)]/68">
                {{ mainStat.description }}
              </p>
            </div>

            <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-[var(--bg-surface)] text-[var(--text-primary)]">
              <Icon name="i-ph-fire-fill" class="h-7 w-7 text-[var(--bg-brand)]" />
            </div>
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          <article
            v-for="item in secondaryStats"
            :key="item.label"
            class="rounded-[20px] border border-[var(--border-light)] bg-[var(--bg-surface)] p-4"
          >
            <p class="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
              {{ item.label }}
            </p>
            <p class="mt-2 text-[26px] font-extrabold leading-none text-[var(--text-primary)]">
              {{ item.value }}
            </p>
            <p class="mt-2 text-[12px] font-semibold leading-5 text-[var(--text-secondary)]">
              {{ item.description }}
            </p>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
  eyebrow: string
  title: string
  description: string
  primaryLabel: string
  primaryTo: string
  secondaryLabel: string
  secondaryTo: string
  stats: ReadonlyArray<{ label: string; value: string | number; description: string }>
}>()

const mainStat = computed(() => props.stats[0])
const secondaryStats = computed(() => props.stats.slice(1))
</script>
