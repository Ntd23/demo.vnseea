<template>
  <div class="rounded-[18px] border border-[#0000ff]/10 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,255,0.04)]">
    <div class="flex items-center justify-between">
      <h3 class="text-title-primary">Ảnh</h3>
      <button class="text-caption-secondary hover:text-[#0000ff] transition" type="button">Xem tất cả</button>
    </div>

    <div class="mt-3 grid grid-cols-3 gap-1.5">
      <div
        v-for="i in 9"
        :key="i"
        class="group aspect-square cursor-pointer overflow-hidden rounded-[10px] border-2 border-slate-100 transition hover:border-[#0000ff]/20"
      >
        <div class="flex h-full w-full items-center justify-center mock-image">
          <Icon name="i-ph-image" class="h-5 w-5 text-[#0000ff]/20" />
        </div>
      </div>
    </div>
  </div>
</template>
