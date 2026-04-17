<template>
  <section class="relative overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,var(--color-primary-700)_0%,var(--color-primary-500)_58%,var(--color-accent-500)_132%)] px-5 pb-16 pt-7 text-white shadow-[var(--shadow-xl)] sm:px-7 lg:px-8">
    <div class="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:44px_44px] opacity-25" />
    <div class="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.14)_100%)]" />

    <div class="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
      <div class="max-w-[780px]">
        <p class="text-label-secondary text-white/72">
          P-30 · Việc làm
        </p>
        <h1 class="mt-4 text-display text-[2.25rem] leading-[0.95] text-white sm:text-[3rem]">
          Cơ hội nghề nghiệp cho cộng đồng VNSEEA
        </h1>
        <p class="mt-4 max-w-[640px] text-[15px] leading-7 text-white/88 sm:text-[17px]">
          Khám phá vị trí đang tuyển, xem chi tiết công việc, nộp hồ sơ và đăng tin tuyển dụng mới.
        </p>

        <div class="mt-7 flex flex-wrap items-center gap-3">
          <button
            class="inline-flex h-12 items-center justify-center rounded-[var(--radius-full)] bg-white px-5 text-[14px] font-extrabold text-[var(--color-primary-600)] shadow-[var(--shadow-lg)] transition hover:-translate-y-0.5"
            type="button"
            @click="$emit('openPost')"
          >
            <Icon name="i-ph-briefcase-fill" class="mr-2 h-4 w-4" />
            Đăng việc mới
          </button>

          <button
            class="inline-flex h-12 items-center justify-center rounded-[var(--radius-full)] px-5 text-[14px] font-extrabold shadow-[var(--shadow-lg)] transition hover:-translate-y-0.5"
            :class="savedOnly ? 'bg-white text-[var(--color-primary-600)]' : 'bg-[var(--color-accent-100)] text-[var(--color-primary-900)]'"
            type="button"
            @click="$emit('toggleSaved')"
          >
            <Icon name="i-ph-bookmark-simple-fill" class="mr-2 h-4 w-4" />
            Việc đã lưu
          </button>

          <div class="inline-flex items-center gap-2 rounded-[var(--radius-full)] border border-white/20 bg-white/10 px-4 py-2 text-[13px] font-semibold text-white/90">
            <Icon name="i-ph-list-magnifying-glass-fill" class="h-4 w-4 text-[var(--color-accent-100)]" />
            {{ jobCount }} tin tuyển dụng
          </div>
        </div>
      </div>

      <div class="grid gap-3 sm:grid-cols-3 xl:w-[430px] xl:grid-cols-1">
        <div
          v-for="item in stats"
          :key="item.label"
          class="rounded-[var(--radius-xl)] border border-white/15 bg-white/10 p-4 backdrop-blur-[6px]"
        >
          <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-white/62">
            {{ item.label }}
          </p>
          <p class="mt-2 text-[1.6rem] font-black leading-none text-white">
            {{ item.value }}
          </p>
          <p class="mt-1 text-[13px] leading-5 text-white/74">
            {{ item.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  jobCount: number
  savedOnly: boolean
  stats: ReadonlyArray<{
    label: string
    value: string | number
    description: string
  }>
}>()

defineEmits<{
  openPost: []
  toggleSaved: []
}>()
</script>
