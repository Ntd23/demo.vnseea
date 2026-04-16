<template>
  <div class="min-w-0">
    <nav class="space-y-0.5">
      <NuxtLink
        v-for="item in sidebarNav"
        :key="item.label"
        :to="item.to"
        class="group flex min-w-0 items-center gap-2.5 rounded-[12px] px-2.5 py-2 transition duration-150"
        :class="isActive(item.to)
          ? 'bg-[#0000ff]/8 text-[#0000ff]'
          : 'text-slate-600 hover:bg-[#0000ff]/5 hover:text-[#0000ff]'"
      >
        <span
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] transition duration-150"
          :class="isActive(item.to)
            ? 'bg-[#0000ff] text-white shadow-[0_4px_10px_rgba(0,0,255,0.22)]'
            : 'bg-[#0000ff]/6 text-[#0000ff]/70 group-hover:bg-[#0000ff]/10 group-hover:text-[#0000ff]'"
        >
          <Icon :name="item.icon" class="h-4 w-4" />
        </span>
        <span class="truncate text-[13px] font-medium leading-tight">
          {{ item.label }}
        </span>
      </NuxtLink>

      <!-- Expandable section -->
      <template v-if="expanded">
        <NuxtLink
          v-for="item in sidebarNavMore"
          :key="item.label"
          :to="item.to"
          class="group flex min-w-0 items-center gap-2.5 rounded-[12px] px-2.5 py-2 text-slate-600 transition duration-150 hover:bg-[#0000ff]/5 hover:text-[#0000ff]"
        >
          <span
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#0000ff]/6 text-[#0000ff]/60 transition duration-150 group-hover:bg-[#0000ff]/10 group-hover:text-[#0000ff]"
          >
            <Icon :name="item.icon" class="h-4 w-4" />
          </span>
          <span class="truncate text-[13px] font-medium leading-tight">
            {{ item.label }}
          </span>
        </NuxtLink>
      </template>

      <!-- Xem thêm / Ẩn bớt -->
      <button
        class="group flex w-full items-center gap-2.5 rounded-[12px] px-2.5 py-2 text-left text-slate-500 transition duration-150 hover:bg-[#0000ff]/5 hover:text-[#0000ff]"
        type="button"
        @click="expanded = !expanded"
      >
        <span
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#0000ff]/6 text-[#0000ff]/60 transition group-hover:bg-[#0000ff]/10 group-hover:text-[#0000ff]"
        >
          <Icon
            :name="expanded ? 'i-ph-caret-up' : 'i-ph-caret-down'"
            class="h-4 w-4"
          />
        </span>
        <span class="text-[13px] font-medium">
          {{ expanded ? 'Ẩn bớt' : 'Xem thêm' }}
        </span>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { sidebarNav, sidebarNavMore } = useMockSocialData()
const expanded = ref(false)

const isActive = (to: string) => route.path === to.split("#")[0]
</script>
