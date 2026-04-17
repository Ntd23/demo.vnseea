<template>
  <div class="space-y-3">
    <p class="text-[1.02rem] font-black text-[#2f3542]">Hình ảnh</p>
    <div class="flex flex-wrap items-end gap-4">
      <button
        type="button"
        class="group flex h-[160px] w-[160px] items-center justify-center rounded-[22px] border border-[#e5e7eb] bg-[#f4f6fb] transition hover:border-[#0000ff]/30 hover:bg-[#eef2ff]"
        @click="$emit('addImage')"
      >
        <div class="text-center">
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-white text-slate-400 shadow-sm transition group-hover:text-[#0000ff]">
            <Icon name="i-ph-camera-fill" class="h-8 w-8" />
          </div>
          <p class="mt-3 text-[13px] font-semibold text-slate-500">
            {{ imageButtonLabel }}
          </p>
        </div>
      </button>

      <div class="flex min-w-[220px] flex-1 flex-wrap gap-2">
        <div
          v-for="item in imageTiles"
          :key="item.name"
          class="flex h-20 w-20 items-center justify-center rounded-[20px] border border-[#dbe3f2] bg-[linear-gradient(180deg,#f8fbff_0%,#eef3ff_100%)] text-[#243b63]"
        >
          <Icon name="i-ph-image-square-fill" class="h-7 w-7" />
        </div>
      </div>
    </div>
    <p class="text-[13px] leading-6 text-slate-500">
      Mock UI: nhấn ô camera để thay đổi số lượng ảnh mẫu, tối đa 10 ảnh.
    </p>
  </div>
</template>

<script setup lang="ts">
import type { ProductImageTile } from "~/types/product-editor"

defineProps<{
  imageTiles: ProductImageTile[]
  imageButtonLabel: string
}>()

defineEmits<{
  (e: "addImage"): void
}>()
</script>
