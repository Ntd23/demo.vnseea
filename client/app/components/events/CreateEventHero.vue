<template>
  <section class="relative overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#0f766e_0%,var(--color-primary-600)_58%,var(--color-accent-500)_132%)] px-5 pb-10 pt-7 text-white shadow-[var(--shadow-xl)] sm:px-7 lg:px-8">
    <div class="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:42px_42px] opacity-25" />
    <div class="pointer-events-none absolute right-[-7%] top-[-24%] h-[280px] w-[280px] rounded-full bg-white/12 blur-3xl" />
    <div class="pointer-events-none absolute bottom-[-22%] left-[-8%] h-[240px] w-[240px] rounded-full bg-[#f59e0b]/24 blur-3xl" />

    <div class="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
      <div class="max-w-[760px]">
        <p class="text-label-secondary text-white/72">
          P-28 · Tạo sự kiện
        </p>
        <h1 class="mt-4 text-display text-[2.2rem] leading-[0.95] text-white sm:text-[2.85rem]">
          Tạo sự kiện mới
        </h1>
        <p class="mt-4 max-w-[620px] text-[15px] leading-7 text-white/88 sm:text-[17px]">
          Chuẩn bị tên, mô tả, địa điểm, thời gian và ảnh bìa để đăng sự kiện vào cộng đồng VNSEEA.
        </p>

        <div class="mt-7 flex flex-wrap gap-3">
          <NuxtLink
            to="/events"
            class="inline-flex h-12 items-center justify-center rounded-[var(--radius-full)] border border-white/20 bg-white/10 px-5 text-[14px] font-bold text-white transition hover:bg-white/15"
          >
            <Icon name="i-ph-arrow-left" class="mr-2 h-4 w-4" />
            Quay lại Sự kiện
          </NuxtLink>

          <button
            class="inline-flex h-12 items-center justify-center rounded-[var(--radius-full)] bg-[#fde7b2] px-5 text-[14px] font-extrabold text-[#27345f] shadow-[var(--shadow-lg)] transition hover:-translate-y-0.5"
            type="button"
            @click="$emit('quickFill')"
          >
            Điền nhanh dữ liệu mẫu
          </button>
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
          <p class="mt-2 text-[1.55rem] font-black leading-none text-white">
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
