<template>
  <div class="space-y-10">
    <section class="max-w-4xl space-y-2 pl-1">
      <p class="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500">
        {{ eyebrow || $t("checkout.page.eyebrow") }}
      </p>
      <h1 class="text-4xl sm:text-5xl font-black tracking-tight text-secondary-900 leading-tight">
        {{ title }}
      </h1>
      <div class="h-1.5 w-16 rounded-full bg-primary-600 shadow-sm" />
      <p
        v-if="description"
        class="text-sm sm:text-base font-medium leading-relaxed text-secondary-500 max-w-3xl"
      >
        {{ description }}
      </p>
    </section>

    <div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px] 2xl:grid-cols-[minmax(0,1fr)_450px] xl:items-start">
      <section class="min-w-0 order-2 lg:order-1">
        <slot name="left" />
      </section>

      <aside class="min-w-0 order-1 self-start lg:order-2 lg:sticky lg:top-[100px]">
        <slot name="right" />
      </aside>
    </div>
    </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  eyebrow?: string
  description?: string
}>(), {
  eyebrow: "",
  description: "",
})
</script>
