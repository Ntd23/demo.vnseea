<template>
  <div class="surface-card rounded-[20px] border border-[#0000ff]/10 p-4 shadow-[0_2px_14px_rgba(0,0,255,0.05)]">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-title-primary">Hoàn thành hồ sơ</p>
        <p class="text-caption-secondary mt-1">Ảnh đại diện, cover, giới thiệu, bài đăng, bạn bè.</p>
      </div>
      <button class="btn-secondary px-3 py-2 text-[13px]" type="button">Chỉnh sửa</button>
    </div>
    <div class="mt-4 flex flex-wrap gap-2">
      <span v-for="item in items" :key="item" class="rounded-full bg-[#0000ff]/5 px-3 py-1 text-[12px] font-medium text-[#0000ff]">{{ item }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ items: string[] }>()
</script>
