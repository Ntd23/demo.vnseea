<template>
  <section class="surface-card p-6 ring-1 ring-secondary-100 shadow-xl relative overflow-hidden">
    <!-- Visual Decor -->
    <div class="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none" />

    <div class="relative z-10 flex items-center justify-between gap-4 mb-6">
      <div class="space-y-1">
        <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 px-1">
          {{ t("pages.groupDetailPage.membersEyebrow") }}
        </p>
        <h3 class="text-xl font-black text-secondary-900 tracking-tighter">
          {{ $t('community.groups.format.members', { count: memberCountLabel }) }}
        </h3>
      </div>

      <UButton
        variant="soft"
        size="md"
        class="rounded-xl font-black text-[10px] uppercase tracking-widest px-4 bg-primary-50 text-primary-600 ring-1 ring-primary-100 hover:bg-primary-600 hover:text-white transition-all shadow-sm active:scale-95"
      >
        <template #leading>
          <Icon name="i-ph-user-circle-plus-duotone" class="h-4 w-4" />
        </template>
        {{ t("pages.groupDetailPage.inviteMore") }}
      </UButton>
    </div>

    <div class="relative z-10 space-y-3">
      <div
        v-for="member in members"
        :key="member.id"
        class="flex items-center gap-4 rounded-2xl bg-secondary-50/50 p-3.5 ring-1 ring-secondary-100/50 transition-all hover:ring-primary-100/50 hover:bg-white group"
      >
        <div class="relative shrink-0">
          <div class="flex h-11 w-11 items-center justify-center rounded-[14px] bg-gradient-to-br from-primary-50 to-primary-100 text-[13px] font-black text-primary-600 shadow-sm ring-1 ring-primary-200 transition-transform group-hover:scale-105">
            {{ member.initials }}
          </div>
          <span
            class="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[3px] border-white shadow-sm"
            :class="member.online ? 'bg-green-500' : 'bg-secondary-300'"
          />
        </div>

        <div class="min-w-0 flex-1 space-y-0.5">
          <p class="truncate text-[13px] font-black uppercase tracking-widest text-secondary-900 group-hover:text-primary-600 transition-colors">{{ member.name }}</p>
          <div class="flex items-center gap-2">
            <p class="text-[10px] font-bold uppercase tracking-widest text-primary-600/70">{{ member.role }}</p>
            <span class="h-1 w-1 rounded-full bg-secondary-300" />
            <p class="truncate text-[10px] font-bold uppercase tracking-widest text-secondary-400">{{ member.meta }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CommunityGroupMember } from "../../../types/community"

const { t } = useI18n()

defineProps<{
  members: CommunityGroupMember[]
  memberCountLabel: string
}>()
</script>
