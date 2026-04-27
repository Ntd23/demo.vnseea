<template>
  <section class="overflow-hidden rounded-[32px] border border-[#dbe3f2] bg-white shadow-[0_20px_50px_rgba(15,35,110,0.08)]">
    <div class="grid gap-8 p-6 sm:p-10 xl:grid-cols-[minmax(0,1fr)_480px] xl:items-stretch">
      <div class="flex min-w-0 flex-col justify-between gap-10 rounded-[28px] bg-[#0f172a] p-6 text-white sm:p-10">
        <div class="space-y-6">
          <div class="flex flex-wrap items-center gap-3">
            <span class="inline-flex h-9 items-center rounded-2xl bg-white/10 px-4 text-[12px] font-black uppercase tracking-[0.15em] text-white backdrop-blur-xl border border-white/20">
              {{ $t("pages.eventsPage.heroEyebrow") }}
            </span>
            <span class="inline-flex h-9 items-center rounded-2xl bg-primary-600 px-4 text-[12px] font-black uppercase tracking-[0.15em] text-white shadow-lg shadow-primary-600/30">
              EXPLORE EVENTS
            </span>
          </div>

          <div class="space-y-4">
            <h1 class="max-w-[720px] text-[38px] font-black leading-tight tracking-tight sm:text-[56px]">
              {{ $t("pages.eventsPage.heroTitle") }}
            </h1>
            <p class="max-w-xl text-[16px] font-medium leading-relaxed text-white/60">
              {{ $t("pages.eventsPage.heroDescription") }}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <span class="rounded-xl bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-white border border-white/10">
              {{ statusLabel }}
            </span>
            <span class="rounded-xl bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-white border border-white/10">
              {{ totalEvents }} ACTIVE EVENTS
            </span>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-4">
          <UButton
            to="/events/create-event"
            size="xl"
            class="h-14 rounded-2xl bg-white px-8 font-black text-[#0f172a] transition-all hover:bg-primary-50 active:scale-95 shadow-2xl"
          >
            <template #leading>
              <Icon name="i-ph-plus-bold" class="h-5 w-5" />
            </template>
            {{ $t("pages.eventsPage.createEvent") }}
          </UButton>
          
          <button
            class="flex h-14 items-center gap-3 rounded-2xl bg-white/10 px-6 text-[13px] font-black uppercase tracking-widest text-white backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all"
            @click="$emit('showMyEvents')"
          >
            <Icon name="i-ph-user-circle-check-fill" class="h-6 w-6" />
            {{ $t("pages.eventsPage.myEvents") }}
          </button>
        </div>
      </div>

      <div class="grid gap-4">
        <div v-for="(item, index) in stats" :key="item.label" 
          class="rounded-[28px] p-8 transition-all hover:shadow-xl border border-slate-100"
          :class="index === 0 ? 'bg-primary-600 text-white shadow-2xl shadow-primary-600/20' : 'bg-slate-50 text-[#0f172a] shadow-inner'"
        >
          <div class="relative flex items-start justify-between">
            <div class="space-y-1">
              <p class="text-[11px] font-black uppercase tracking-widest" :class="index === 0 ? 'text-white/70' : 'text-slate-400'">
                {{ item.label }}
              </p>
              <p class="text-[38px] font-black leading-none">
                {{ item.value }}
              </p>
            </div>
            <div class="flex h-12 w-12 items-center justify-center rounded-xl" :class="index === 0 ? 'bg-white/20' : 'bg-white shadow-md'">
              <Icon :name="index === 0 ? 'i-ph-calendar-fill' : index === 1 ? 'i-ph-users-three-fill' : 'i-ph-envelope-simple-fill'" class="h-6 w-6" />
            </div>
          </div>
          <p class="mt-4 text-[13px] font-bold" :class="index === 0 ? 'text-white/80' : 'text-slate-500'">{{ item.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  myEventsActive: boolean
  totalEvents: number
  statusLabel: string
  stats: ReadonlyArray<{
    label: string
    value: string | number
    description: string
  }>
}>()

defineEmits<{
  showMyEvents: []
}>()
</script>
