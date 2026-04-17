<template>
  <div class="space-y-6">
    <section class="px-1 pt-1">
      <p class="text-[12px] font-extrabold uppercase tracking-[0.28em] text-[#0000ff]/65">
        {{ eyebrow }}
      </p>
      <h1 class="mt-2 text-display text-[2rem] text-[#2f3542] sm:text-[2.3rem]">
        {{ title }}
      </h1>
      <div class="mt-4 h-[5px] w-20 rounded-full bg-[#2f3542]" />
      <p
        v-if="description"
        class="mt-4 max-w-[720px] text-[14px] leading-7 text-slate-500 sm:text-[15px]"
      >
        {{ description }}
      </p>
    </section>

    <div class="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_380px] xl:grid-cols-[minmax(0,1.08fr)_420px] 2xl:grid-cols-[minmax(0,1.1fr)_450px]">
      <section class="min-w-0 order-2 lg:order-1">
        <slot name="left" />
      </section>

      <aside class="min-w-0 order-1 self-start lg:order-2 lg:sticky lg:top-[84px]">
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
  eyebrow: "P-14 · Thanh toán",
  description: "",
})
</script>
