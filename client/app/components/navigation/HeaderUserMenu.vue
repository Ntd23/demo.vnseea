<template>
  <UDropdownMenu
    :items="items"
    :ui="{
      width: 'w-64',
      item: {
        active: 'bg-primary-50 text-[var(--text-primary)]',
        inactive: 'text-[var(--text-primary)] hover:bg-primary-50/50 hover:text-secondary-900',
        base: 'flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-black transition-all group/item',
        padding: 'px-3 py-2.5',
        icon: {
          base: 'flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-50 group-hover/item:bg-white border border-secondary-100 transition-colors h-4.5 w-4.5',
        }
      },
      container: 'surface-card p-2 ring-1 ring-secondary-100 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300'
    }"
    :content="{ side: 'bottom', align: 'end', sideOffset: 12 }"
  >
    <button class="flex list-none cursor-pointer items-center gap-3 rounded-2xl border border-secondary-100 bg-secondary-50/50 px-3 py-1.5 transition-all hover:bg-white hover:ring-2 hover:ring-primary-500/20 focus:ring-2 focus:ring-primary-500/20 outline-none">
      <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 text-[10px] font-black text-white shadow-lg shadow-primary-500/20 ring-2 ring-white">
        VN
      </div>
      <div class="hidden text-left xl:block">
        <p class="text-xs font-black text-[var(--text-primary)] tracking-tight">Van Nguyen</p>
        <p class="text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-widest">Mock User</p>
      </div>
      <Icon name="i-ph-caret-down-bold" class="h-3.5 w-3.5 text-[var(--text-primary)] transition-transform duration-300 group-open:rotate-180" />
    </button>

    <template #item="{ item }">
      <div class="flex items-center gap-3 w-full" :class="item.label === 'Dang xuat' ? 'text-rose-500' : ''">
        <div 
          class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors border"
          :class="item.label === 'Dang xuat' ? 'bg-rose-50 border-rose-100' : 'bg-secondary-50 border-secondary-100 group-hover/item:bg-white'"
        >
          <Icon :name="item.icon" class="h-4.5 w-4.5" />
        </div>
        <span class="uppercase tracking-widest">{{ $t(item.label) || item.label }}</span>
      </div>
    </template>
  </UDropdownMenu>
</template>

<script setup lang="ts">
const { t } = useI18n()

const items = [
  [{
    label: "navigation.headerBar.home",
    to: "/home",
    icon: "i-ph-house-duotone"
  }, {
    label: "navigation.headerBar.messages",
    to: "/messages",
    icon: "i-ph-chat-circle-dots-duotone"
  }],
  [{
    label: "Dang xuat",
    to: "/welcome",
    icon: "i-ph-sign-out-duotone"
  }]
]
</script>
