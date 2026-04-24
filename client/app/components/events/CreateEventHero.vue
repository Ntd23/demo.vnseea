<template>
  <UCard class="overflow-hidden rounded-[30px] border border-[var(--border-default)] bg-[linear-gradient(135deg,#0369a1_0%,var(--color-primary-600)_58%,var(--color-accent-500)_132%)] text-white shadow-[var(--shadow-xl)]" :ui="{ body: 'relative p-5 sm:p-7 lg:p-8' }">
    <div class="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:42px_42px] opacity-25" />
    <div class="pointer-events-none absolute right-[-7%] top-[-24%] h-[280px] w-[280px] rounded-full bg-white/12 blur-3xl" />
    <div class="pointer-events-none absolute bottom-[-22%] left-[-8%] h-[240px] w-[240px] rounded-full bg-[#f59e0b]/24 blur-3xl" />

    <div class="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
      <div class="max-w-[760px]">
        <UBadge color="neutral" variant="soft" class="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
          {{ $t("pages.createEventPage.heroEyebrow") }}
        </UBadge>
        <h1 class="mt-4 text-display text-[2.2rem] leading-[0.95] text-white sm:text-[2.85rem]">
          {{ $t("pages.createEventPage.heroTitle") }}
        </h1>
        <p class="mt-4 max-w-[620px] text-[15px] leading-7 text-white/88 sm:text-[17px]">
          {{ $t("pages.createEventPage.heroDescription") }}
        </p>

        <div class="mt-7 flex flex-wrap gap-3">
          <UButton
            to="/events"
            color="neutral"
            variant="outline"
            size="xl"
            class="rounded-full border-white/20 bg-white/10 text-white"
          >
            <Icon name="i-ph-arrow-left" class="mr-2 h-4 w-4" />
            {{ $t("pages.createEventPage.backToEvents") }}
          </UButton>

          <UButton
            color="neutral"
            variant="solid"
            size="xl"
            class="rounded-full bg-[#fde7b2] text-[#27345f]"
            type="button"
            @click="$emit('quickFill')"
          >
            {{ $t("pages.createEventPage.quickFill") }}
          </UButton>
        </div>
      </div>

      <div class="grid gap-3 sm:grid-cols-3 xl:w-[430px] xl:grid-cols-1">
        <UCard
          v-for="item in stats"
          :key="item.label"
          class="rounded-[24px] border border-white/15 bg-white/10 backdrop-blur-[6px]"
          :ui="{ body: 'p-4' }"
        >
          <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-white/62">
            {{ item.label }}
          </p>
          <p class="mt-2 text-[1.55rem] font-black leading-none text-white">
            {{ item.value }}
          </p>
          <p class="mt-1 text-[13px] leading-5 text-white/74">
            {{ item.description }}
          </p>
        </UCard>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  stats: ReadonlyArray<{
    label: string
    value: string
    description: string
  }>
}>()

defineEmits<{
  quickFill: []
}>()
</script>
