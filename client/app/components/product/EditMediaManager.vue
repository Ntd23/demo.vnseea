<template>
  <div class="space-y-8">
    <div class="space-y-3">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-[1.02rem] font-black text-[#2f3542]">Ảnh hiện tại</p>
        <div class="rounded-full bg-[#fff7ed] px-3 py-1.5 text-[12px] font-semibold text-[#c2410c]">
          {{ removedCount }} ảnh sẽ bị xóa
        </div>
      </div>

      <div class="flex min-h-[104px] flex-wrap gap-3 rounded-[24px] border border-[#dbe3f2] bg-[#f8fbff] p-4">
        <template v-if="currentImages.length > 0">
          <div
            v-for="image in currentImages"
            :key="image.id"
            class="relative flex h-20 w-20 items-center justify-center rounded-[20px] border border-[#dbe3f2] bg-[linear-gradient(180deg,#ffffff_0%,#eef3ff_100%)] text-[#243b63]"
          >
            <button
              class="absolute -right-1.5 -top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#be123c] text-white shadow-[0_8px_18px_rgba(190,18,60,0.28)] transition hover:scale-105"
              type="button"
              @click="$emit('removeCurrentImage', image.id)"
            >
              <Icon name="i-ph-x-bold" class="h-3.5 w-3.5" />
            </button>
            <Icon name="i-ph-image-square-fill" class="h-7 w-7" />
          </div>
        </template>

        <div
          v-else
          class="flex min-h-[72px] flex-1 items-center justify-center rounded-[20px] border border-dashed border-[#cbd5e1] bg-white px-4 text-center text-[13px] font-medium text-slate-400"
        >
          Không còn ảnh cũ nào được giữ lại.
        </div>
      </div>
    </div>

    <div class="space-y-3">
      <p class="text-[1.02rem] font-black text-[#2f3542]">Ảnh mới</p>
      <div class="flex flex-wrap items-end gap-4">
        <button
          type="button"
          class="group flex h-[160px] w-[160px] items-center justify-center rounded-[22px] border border-[#e5e7eb] bg-[#f4f6fb] transition hover:border-[#0000ff]/30 hover:bg-[#eef2ff]"
          @click="$emit('addNewImage')"
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
            v-for="item in newImageTiles"
            :key="item.name"
            class="relative flex h-20 w-20 items-center justify-center rounded-[20px] border border-[#dbe3f2] bg-[linear-gradient(180deg,#f8fbff_0%,#eef3ff_100%)] text-[#243b63]"
          >
            <button
              class="absolute -right-1.5 -top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-slate-700 text-white shadow-[0_8px_18px_rgba(51,65,85,0.2)] transition hover:scale-105"
              type="button"
              @click="$emit('removeNewImage', item.name)"
            >
              <Icon name="i-ph-x-bold" class="h-3.5 w-3.5" />
            </button>
            <Icon name="i-ph-image-square-fill" class="h-7 w-7" />
          </div>
        </div>
      </div>
      <p class="text-[13px] leading-6 text-slate-500">
        Mock UI: ảnh cũ có thể bỏ khỏi tin đăng, còn ảnh mới đang mô phỏng bằng tile để kiểm tra flow chỉnh sửa.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductCurrentImage, ProductImageTile } from "~/types/product-editor"

defineProps<{
  currentImages: ProductCurrentImage[]
  removedCount: number
  newImageTiles: ProductImageTile[]
  imageButtonLabel: string
}>()

defineEmits<{
  (e: "addNewImage"): void
  (e: "removeCurrentImage", imageId: string): void
  (e: "removeNewImage", imageName: string): void
}>()
</script>
