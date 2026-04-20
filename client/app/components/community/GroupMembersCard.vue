<template>
  <section class="rounded-[24px] border border-[#dbe3f2] bg-white p-5 shadow-[0_12px_30px_rgba(15,35,110,0.06)]">
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0000ff]/70">
          {{ $t('community.settings.sidebar.members') }}
        </p>
        <h3 class="mt-2 text-[1.15rem] font-black tracking-[-0.04em] text-[#243b63]">
          {{ memberCountLabel }}
        </h3>
      </div>

      <button
        class="inline-flex h-10 items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-4 text-[12px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
        type="button"
      >
        <Icon name="i-ph-user-circle-plus-bold" class="mr-1.5 h-4 w-4" />
        {{ $t('community.settings.sidebar.inviteMore') }}
      </button>
    </div>

    <div class="mt-4 space-y-3">
      <div
        v-for="member in members"
        :key="member.id"
        class="flex items-center gap-3 rounded-[18px] bg-[#fbfcff] px-3.5 py-3"
      >
        <div class="relative shrink-0">
          <div class="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#dbeafe_0%,#eef2ff_100%)] text-[13px] font-black text-[#1d4ed8]">
            {{ member.initials }}
          </div>
          <span
            class="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white"
            :class="member.online ? 'bg-[#31a24c]' : 'bg-[#cbd5e1]'"
          />
        </div>

        <div class="min-w-0 flex-1">
          <p class="truncate text-[13px] font-semibold text-[#243b63]">{{ member.name }}</p>
          <p class="mt-0.5 text-[12px] text-slate-500">{{ member.role }}</p>
          <p class="mt-0.5 truncate text-[11px] text-slate-400">{{ member.meta }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CommunityGroupMember } from "../../../types/community"

defineProps<{
  members: CommunityGroupMember[]
  memberCountLabel: string
}>()
</script>
