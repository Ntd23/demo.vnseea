<template>
  <aside class="surface-card h-fit p-6 sm:p-10 shadow-xl ring-1 ring-secondary-100 sticky top-24">
    <div class="space-y-10">
      <div class="space-y-1 text-center">
        <p class="text-[10px] font-black uppercase tracking-[0.3em] text-secondary-900">
          {{ $t("pages.withdrawalPage.savedProfiles") }}
        </p>
        <h2 class="text-3xl font-black tracking-tight text-secondary-900">
          {{ $t("pages.withdrawalPage.paymentInfo") }}
        </h2>
      </div>

      <div class="space-y-4">
        <div
          v-for="profile in profiles"
          :key="profile.value"
          class="group/profile flex items-center gap-4 rounded-2xl border border-secondary-100 p-5 transition-all hover:border-primary-100 hover:bg-primary-50/20"
        >
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm border border-secondary-50 transition-transform group-hover/profile:scale-110" :class="profile.color">
            <Icon :name="profile.icon" class="h-6 w-6" />
          </div>
          <div class="min-w-0">
            <p class="text-sm font-black text-secondary-900">{{ profile.label }}</p>
            <p class="text-xs font-semibold text-secondary-400">{{ profile.value }}</p>
          </div>
        </div>

        <UButton
          size="xl"
          variant="ghost"
          block
          icon="i-ph-plus-circle-duotone"
          class="h-14 rounded-2xl text-[11px] font-black uppercase tracking-widest text-primary-600 hover:bg-primary-50 active:scale-95 transition-all"
        >
          {{ $t("pages.withdrawalPage.addNewAccount") }}
        </UButton>
      </div>

      <div class="rounded-3xl bg-secondary-50 p-6 border border-secondary-100/50">
        <div class="flex gap-4">
          <Icon name="i-ph-info-duotone" class="h-6 w-6 text-secondary-400 shrink-0" />
          <p class="text-[11px] font-medium leading-relaxed text-secondary-500">
            {{ $t("pages.withdrawalPage.withdrawalNotice") }}
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { PaymentProfile } from "../../domain/types/withdrawal.types"

defineProps<{
  profiles: PaymentProfile[]
}>()
</script>
