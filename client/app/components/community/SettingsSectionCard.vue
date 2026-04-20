<template>
  <section class="rounded-[28px] border border-[#dbe3f2] bg-white p-5 shadow-[0_12px_30px_rgba(15,35,110,0.06)] sm:p-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="flex items-start gap-3">
        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-[#eef3ff] text-[#0000ff] shadow-[0_10px_20px_rgba(0,0,255,0.08)]">
          <Icon :name="icon" class="h-5 w-5" />
        </div>

        <div class="min-w-0">
          <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0000ff]/70">
            {{ eyebrow ? $t(eyebrow) : '' }}
          </p>
          <h2 class="mt-2 text-[1.2rem] font-black tracking-[-0.04em] text-[#243b63]">
            {{ $t(title) }}
          </h2>
          <p
            v-if="description"
            class="mt-1 text-[14px] leading-6 text-slate-500"
          >
            {{ $t(description) }}
          </p>
        </div>
      </div>

      <div v-if="$slots.trailing" class="shrink-0">
        <slot name="trailing" />
      </div>
    </div>

    <div class="mt-6">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  eyebrow?: string
  title: string
  description?: string
  icon?: string
}>(), {
  eyebrow: "community.settings.defaultEyebrow",
  description: "",
  icon: "i-ph-gear-six-bold",
})
</script>
