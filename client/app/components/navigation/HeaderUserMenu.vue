<template>
  <details class="group relative">
    <summary class="flex list-none cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-white/12 px-2 py-1.5 text-white transition hover:border-white/35 hover:bg-white/18">
      <div class="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold text-[#0000ff]">
        VN
      </div>
      <div class="hidden text-left lg:block">
        <p class="text-xs font-semibold text-white">Van Nguyen</p>
        <p class="text-[10px] text-white/70">Mock user</p>
      </div>
      <Icon name="i-lucide-chevron-down" class="h-4 w-4 text-white/70 transition group-open:rotate-180" />
    </summary>
    <div class="absolute right-0 top-[calc(100%+0.55rem)] z-20 w-52 rounded-[20px] border border-[#d8e1ff] bg-white p-2 shadow-[0_14px_34px_rgba(15,35,110,0.12)]">
      <NuxtLink class="block rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-[#f2f5ff] hover:text-[#0000ff]" to="/">Bang tin</NuxtLink>
      <NuxtLink class="block rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-[#f2f5ff] hover:text-[#0000ff]" to="/messages">Tin nhan</NuxtLink>
      <NuxtLink class="block rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-[#f2f5ff] hover:text-[#0000ff]" to="/welcome">Dang xuat mock</NuxtLink>
    </div>
  </details>
</template>
