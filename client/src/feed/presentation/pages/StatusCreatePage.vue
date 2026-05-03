<!-- Description: Renders the story creation page as an upload-first flow matching the PHP create-status order. -->
<template>
  <div class="mx-auto max-w-[1280px] space-y-5 px-3 pb-10 sm:px-5 lg:px-6">
    <section class="rounded-[26px] border border-[#dbe3f2] bg-white px-5 py-5 shadow-[0_12px_28px_rgba(15,35,110,0.06)]">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-2">
          <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
            Story
          </p>
          <h1 class="text-[1.9rem] font-black tracking-[-0.04em] text-[var(--text-primary)] sm:text-[2.2rem]">
            Tạo tin mới
          </h1>
          <p class="max-w-3xl text-[14px] leading-7 text-slate-500">
            Chọn một ảnh hoặc video, xem preview rồi đăng tin. Flow này được rút lại theo đúng nhịp upload-first của trang PHP.
          </p>
        </div>

        <NuxtLink
          to="/home"
          class="inline-flex h-11 items-center justify-center rounded-[14px] border border-[#dbe3f2] bg-white px-5 text-[13px] font-bold text-[var(--text-primary)] transition hover:border-primary-200 hover:text-primary-700"
        >
          <Icon name="i-ph-arrow-left-bold" class="mr-2 h-4 w-4" />
          Quay lại bảng tin
        </NuxtLink>
      </div>
    </section>

    <div class="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section class="space-y-5">
        <section class="rounded-[26px] border border-[#dbe3f2] bg-white p-5 shadow-[0_12px_28px_rgba(15,35,110,0.06)]">
          <input
            ref="fileInputRef"
            accept="image/*,video/*"
            class="hidden"
            type="file"
            @change="handleFileSelection"
          >

          <button
            class="flex w-full flex-col items-center justify-center rounded-[22px] border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-6 py-12 text-center transition hover:border-primary-300 hover:bg-[#eff6ff]"
            type="button"
            @click="openPicker"
          >
            <div class="flex h-16 w-16 items-center justify-center rounded-[20px] bg-white text-primary-600 shadow-sm">
              <Icon :name="selectedFile ? mediaIcon : 'i-ph-upload-simple-duotone'" class="h-8 w-8" />
            </div>
            <p class="mt-4 text-lg font-black text-[var(--text-primary)]">
              {{ selectedFile ? "Đổi tệp story" : "Chọn ảnh hoặc video" }}
            </p>
            <p class="mt-2 max-w-xl text-[13px] leading-6 text-slate-500">
              Story chỉ cần một tệp media. Chọn file trước, xem trước ở cột phải, sau đó dùng nút submit mock bên dưới.
            </p>
          </button>

          <div
            v-if="selectedFile"
            class="mt-4 rounded-[18px] border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3"
          >
            <p class="text-sm font-bold text-[var(--text-primary)]">{{ selectedFile.name }}</p>
            <p class="mt-1 text-[13px] text-slate-500">{{ mediaLabel }}</p>
          </div>
        </section>

        <FormsSubmitBar
          hint="Mock state: route đã được kéo lại về upload-first, chưa submit thật tới backend."
          cta="Đăng tin"
        />
      </section>

      <aside class="space-y-5">
        <section class="rounded-[26px] border border-[#dbe3f2] bg-white p-5 shadow-[0_12px_28px_rgba(15,35,110,0.06)]">
          <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
            Preview
          </p>

          <div class="mt-4 mx-auto flex max-w-[280px] justify-center">
            <div class="relative h-[520px] w-full overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#0f172a_0%,#1e293b_100%)]">
              <template v-if="mediaType === 'image' && previewUrl">
                <img :src="previewUrl" alt="Story preview" class="absolute inset-0 h-full w-full object-cover">
              </template>
              <template v-else-if="mediaType === 'video' && previewUrl">
                <video :src="previewUrl" class="absolute inset-0 h-full w-full object-cover" controls muted playsinline />
              </template>
              <template v-else>
                <div class="absolute inset-0 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_48%,#38bdf8_100%)]" />
              </template>

              <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,transparent_35%,rgba(15,23,42,0.58)_100%)]" />

              <div class="absolute inset-x-4 top-4 flex gap-1">
                <div class="h-1 flex-1 rounded-full bg-white/35">
                  <div class="h-full rounded-full bg-white" :style="{ width: previewBarWidth }" />
                </div>
                <div class="h-1 flex-1 rounded-full bg-white/20" />
                <div class="h-1 flex-1 rounded-full bg-white/20" />
              </div>

              <div class="absolute left-4 top-8 flex items-center gap-2">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                  VN
                </div>
                <div class="text-white">
                  <p class="text-sm font-bold">Bạn</p>
                  <p class="text-xs text-white/70">Vừa xong</p>
                </div>
              </div>

              <div class="absolute inset-x-4 bottom-4 rounded-[18px] bg-black/35 px-4 py-3 text-[13px] leading-6 text-white/85 backdrop-blur-sm">
                {{ previewDescription }}
              </div>
            </div>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import FormsSubmitBar from "../../../shared-kernel/presentation/components/forms/SubmitBar.vue"

type MediaType = "image" | "video" | null

useSeoMeta({
  title: "Tạo story | VNSEEA",
  description: "Upload ảnh hoặc video để tạo story mới trên VNSEEA.",
})

const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const previewUrl = ref("")
const mediaType = ref<MediaType>(null)

const mediaLabel = computed(() => {
  if (mediaType.value === "image") return "Ảnh story"
  if (mediaType.value === "video") return "Video story"
  return "Story"
})

const mediaIcon = computed(() =>
  mediaType.value === "video" ? "i-ph-video-duotone" : "i-ph-image-duotone",
)

const previewDescription = computed(() =>
  selectedFile.value
    ? "Story đã có preview local và sẵn sàng cho bước đăng tin mock."
    : "Khung này sẽ hiện ảnh hoặc video sau khi bạn chọn tệp.",
)

const previewBarWidth = computed(() => (selectedFile.value ? "76%" : "24%"))

const revokePreview = () => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ""
  }
}

const openPicker = () => {
  fileInputRef.value?.click()
}

const handleFileSelection = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null

  revokePreview()
  selectedFile.value = file

  if (!file) {
    mediaType.value = null
    return
  }

  mediaType.value = file.type.startsWith("video/") ? "video" : "image"
  previewUrl.value = URL.createObjectURL(file)
}

onUnmounted(() => {
  revokePreview()
})
</script>
