<template>
  <section class="relative z-10 -mt-10 overflow-hidden rounded-[30px] border border-white/70 bg-white/95 p-4 shadow-[var(--shadow-xl)] backdrop-blur sm:p-5">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p class="text-label-secondary text-[var(--color-primary-600)]">Bộ lọc</p>
        <h2 class="mt-1 text-heading text-[var(--text-primary)]">Tìm chiến dịch phù hợp</h2>
        <p class="mt-1 max-w-[620px] text-body-secondary">
          Tìm theo tên chiến dịch, chủ dự án, địa điểm; lọc theo lĩnh vực và trạng thái gây quỹ.
        </p>
      </div>
      <NuxtLink
        to="/create_funding"
        class="inline-flex h-14 items-center justify-center gap-2 rounded-[20px] bg-[var(--color-primary-500)] px-6 text-[14px] font-extrabold text-white shadow-[var(--shadow-brand)] transition hover:-translate-y-0.5 lg:min-w-[190px]"
      >
        <Icon name="i-ph-plus-circle-fill" class="h-5 w-5" />
        Tạo quỹ
      </NuxtLink>
    </div>

    <label class="relative mt-5 block">
      <Icon name="i-ph-magnifying-glass" class="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-tertiary)]" />
      <input
        :value="search"
        class="h-16 w-full rounded-[22px] border border-[var(--border-default)] bg-[var(--color-secondary-100)] pl-14 pr-5 text-[15px] font-semibold text-[var(--text-primary)] outline-none transition placeholder:font-medium placeholder:text-[var(--text-tertiary)] focus:border-[var(--color-primary-200)] focus:bg-white focus:ring-4 focus:ring-[var(--bg-surface-active)]"
        placeholder="Tìm kiếm chiến dịch, chủ dự án hoặc địa điểm"
        type="search"
        @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
      >
    </label>

    <div class="mt-5 grid gap-5 xl:grid-cols-2">
      <div class="rounded-[24px] bg-[var(--color-secondary-50)] p-3">
        <p class="px-1 text-[11px] font-black uppercase tracking-[0.14em] text-[var(--text-tertiary)]">Lĩnh vực</p>
        <div class="mt-3 grid gap-2 sm:grid-cols-2">
          <button
            v-for="category in categories"
            :key="category.value"
            class="flex min-h-12 items-center gap-2 rounded-[18px] px-3 py-2 text-left text-[13px] font-extrabold transition"
            :class="selectedCategory === category.value ? 'bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-brand)]' : 'bg-white text-[var(--color-primary-900)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-600)]'"
            type="button"
            @click="$emit('update:selectedCategory', category.value)"
          >
            <Icon :name="category.icon" class="h-4 w-4 shrink-0" />
            {{ category.label }}
          </button>
        </div>
      </div>

      <div class="rounded-[24px] bg-[var(--color-secondary-50)] p-3">
        <p class="px-1 text-[11px] font-black uppercase tracking-[0.14em] text-[var(--text-tertiary)]">Trạng thái</p>
        <div class="mt-3 grid gap-2 sm:grid-cols-2">
          <button
            v-for="status in statuses"
            :key="status.value"
            class="flex min-h-12 items-center gap-2 rounded-[18px] px-3 py-2 text-left text-[13px] font-extrabold transition"
            :class="selectedStatus === status.value ? 'bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-brand)]' : 'bg-white text-[var(--color-primary-900)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-600)]'"
            type="button"
            @click="$emit('update:selectedStatus', status.value)"
          >
            <Icon :name="status.icon" class="h-4 w-4 shrink-0" />
            {{ status.label }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  search: string
  selectedCategory: string
  selectedStatus: string
  categories: ReadonlyArray<{ label: string; value: string; icon: string }>
  statuses: ReadonlyArray<{ label: string; value: string; icon: string }>
}>()

defineEmits<{
  "update:search": [value: string]
  "update:selectedCategory": [value: string]
  "update:selectedStatus": [value: string]
}>()
</script>
