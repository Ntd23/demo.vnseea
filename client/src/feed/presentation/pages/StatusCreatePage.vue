<template>
  <div class="space-y-5 pb-10">
    <section class="relative overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_44%,#38bdf8_100%)] px-5 pb-10 pt-6 text-white shadow-[0_16px_40px_rgba(29,78,216,0.24)] sm:px-7 sm:pt-8 lg:px-8">
      <div class="pointer-events-none absolute inset-x-[-10%] top-[26%] h-[220px] rounded-[50%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18),transparent_65%)]" />
      <div class="pointer-events-none absolute right-[-6%] top-[-14%] h-[260px] w-[260px] rounded-full bg-white/10 blur-2xl" />
      <div class="pointer-events-none absolute bottom-[-22%] left-[-8%] h-[220px] w-[220px] rounded-full bg-[#3b82f6]/20 blur-3xl" />

      <div class="relative z-10">
        <div class="max-w-[760px]">
          <p class="text-[12px] font-extrabold uppercase tracking-[0.32em] text-white/70">
            P-09 · Story
          </p>
          <h1 class="mt-3 text-display text-[2.2rem] leading-[0.92] text-white sm:text-[2.85rem]">
            Tạo tin mới
          </h1>
          <p class="mt-3 max-w-[580px] text-[15px] leading-7 text-white/88 sm:text-[17px]">
            Form đã rút gọn về đúng nhu cầu đăng story: chọn file ảnh hoặc video,
            xem trước và đăng tin.
          </p>

          <div class="mt-6 flex flex-wrap gap-3">
            <NuxtLink
              to="/home"
              class="inline-flex h-12 items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 text-[14px] font-bold text-white transition hover:bg-white/15"
            >
              <Icon name="i-ph-arrow-left" class="mr-2 h-4 w-4" />
              Quay lại bảng tin
            </NuxtLink>

            <button
              class="inline-flex h-12 items-center justify-center rounded-full bg-[#dbeafe] px-5 text-[14px] font-extrabold text-[#1e3a8a] shadow-[0_10px_26px_rgba(219,234,254,0.22)] transition hover:-translate-y-0.5"
              type="button"
              @click="openPicker"
            >
              <Icon name="i-ph-upload-simple-bold" class="mr-2 h-4 w-4" />
              Chọn tệp ngay
            </button>
          </div>
        </div>
      </div>
    </section>

    <div class="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.06fr)_360px]">
      <section class="space-y-5">
        <div class="rounded-[28px] border border-[#dbe3f2] bg-white p-4 shadow-[0_14px_34px_rgba(15,35,110,0.07)] sm:p-5">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p class="text-[12px] font-bold uppercase tracking-[0.26em] text-[#0000ff]/70">
                Upload
              </p>
              <h2 class="mt-1 text-[1.35rem] font-black tracking-[-0.05em] text-[#243b63]">
                Đăng story bằng file
              </h2>
              <p class="mt-1 text-[14px] leading-6 text-slate-500">
                Không chia nhiều bước nữa. Chỉ cần chọn một ảnh hoặc video để đăng.
              </p>
            </div>

            <div class="inline-flex items-center gap-2 rounded-full bg-[#f7f9ff] px-3 py-2 text-[12px] font-semibold text-slate-600">
              <Icon name="i-ph-seal-check-fill" class="h-4 w-4 text-[#0000ff]" />
              {{ completionText }}
            </div>
          </div>
        </div>

        <section class="rounded-[28px] border border-[#dbe3f2] bg-white p-5 shadow-[0_14px_34px_rgba(15,35,110,0.07)] sm:p-6">
          <input
            ref="fileInputRef"
            accept="image/*,video/*"
            class="hidden"
            type="file"
            @change="handleFileSelection"
          >

          <button
            class="group flex w-full flex-col items-center justify-center rounded-[28px] border border-dashed border-[#cfd8f0] bg-[#f8fbff] px-6 py-10 text-center transition hover:border-[#0000ff]/40 hover:bg-[#eef4ff]"
            type="button"
            @click="openPicker"
          >
            <div class="flex h-18 w-18 items-center justify-center rounded-[24px] bg-white text-[#0000ff] shadow-[0_10px_24px_rgba(15,35,110,0.10)] transition group-hover:scale-105">
              <Icon :name="selectedFile ? mediaIcon : 'i-ph-upload-simple-fill'" class="h-9 w-9" />
            </div>
            <p class="mt-5 text-[1.05rem] font-black text-[#243b63]">
              {{ selectedFile ? "Đổi tệp story" : "Chọn ảnh hoặc video" }}
            </p>
            <p class="mt-2 max-w-[520px] text-[13px] leading-6 text-slate-500">
              Hỗ trợ ảnh và video. Chọn một tệp, xem trước ở khung bên phải rồi đăng tin.
            </p>
          </button>

          <div
            v-if="selectedFile"
            class="mt-5 flex flex-col gap-3 rounded-[22px] border border-[#dbe3f2] bg-[#fbfcff] p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="min-w-0">
              <p class="truncate text-[14px] font-black text-[#243b63]">{{ selectedFile.name }}</p>
              <p class="mt-1 text-[12px] text-slate-500">
                {{ mediaLabel }} • preview local đã sẵn sàng
              </p>
            </div>

            <button
              class="inline-flex h-10 items-center justify-center rounded-full border border-[#dbe3f2] px-4 text-[12px] font-bold text-slate-500 transition hover:border-[#fda4af] hover:text-[#be123c]"
              type="button"
              @click="clearSelectedFile"
            >
              Xóa tệp
            </button>
          </div>

          <div class="mt-5 rounded-[22px] bg-[#f7f9ff] px-4 py-4 text-[13px] leading-6 text-slate-500">
            Giao diện hiện chỉ tập trung vào upload story. Submit vẫn là mock UI,
            chưa nối API `create-story.php`.
          </div>
        </section>

        <FormsSubmitBar
          hint="Mock state: form upload story da duoc rut gon, chua submit that toi API."
          cta="Đăng tin"
        />
      </section>

      <aside class="space-y-5">
        <section class="overflow-hidden rounded-[28px] border border-[#dbe3f2] bg-white shadow-[0_14px_34px_rgba(15,35,110,0.07)]">
          <div class="p-5">
            <p class="text-[12px] font-bold uppercase tracking-[0.26em] text-[#0000ff]/70">
              Preview
            </p>
            <div class="mt-4 flex justify-center">
              <div class="relative h-[560px] w-full max-w-[310px] overflow-hidden rounded-[30px] bg-[linear-gradient(180deg,#0f172a_0%,#1e293b_100%)] shadow-[0_18px_40px_rgba(15,23,42,0.26)]">
                <template v-if="mediaType === 'image' && previewUrl">
                  <img
                    :src="previewUrl"
                    alt="Story preview"
                    class="absolute inset-0 h-full w-full object-cover"
                  >
                </template>
                <template v-else-if="mediaType === 'video' && previewUrl">
                  <video
                    :src="previewUrl"
                    class="absolute inset-0 h-full w-full object-cover"
                    controls
                    muted
                    playsinline
                  />
                </template>
                <template v-else>
                  <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.34),transparent_28%),linear-gradient(135deg,#0f172a_0%,#1d4ed8_48%,#38bdf8_100%)]" />
                </template>

                <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_26%),linear-gradient(180deg,rgba(15,23,42,0.12)_0%,transparent_35%,rgba(15,23,42,0.52)_100%)]" />

                <div class="absolute left-0 right-0 top-4 flex gap-1 px-4">
                  <div class="h-1 flex-1 rounded-full bg-white/35">
                    <div class="h-full rounded-full bg-white" :style="{ width: previewBarWidth }" />
                  </div>
                  <div class="h-1 flex-1 rounded-full bg-white/20" />
                  <div class="h-1 flex-1 rounded-full bg-white/20" />
                </div>

                <div class="absolute left-4 right-4 top-8 flex items-center justify-between gap-3">
                  <div class="flex items-center gap-2">
                    <div class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#0000ff] text-[12px] font-black text-white">
                      VN
                    </div>
                    <div>
                      <p class="text-[13px] font-black text-white">Bạn</p>
                      <p class="text-[11px] text-white/70">Vừa xong</p>
                    </div>
                  </div>

                  <div class="rounded-full bg-black/25 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-[4px]">
                    {{ mediaLabel }}
                  </div>
                </div>

                <div
                  v-if="!selectedFile"
                  class="absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-[26px] border border-white/15 bg-white/12 p-6 text-center text-white backdrop-blur-[10px]"
                >
                  <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-white/16">
                    <Icon name="i-ph-upload-simple-fill" class="h-8 w-8" />
                  </div>
                  <p class="mt-4 text-[15px] font-black">
                    Chưa có tệp story
                  </p>
                  <p class="mt-2 text-[12px] leading-6 text-white/75">
                    Chọn một ảnh hoặc video ở form bên trái để xem trước.
                  </p>
                </div>

                <div class="absolute inset-x-4 bottom-4 space-y-2">
                  <div class="rounded-[20px] bg-black/35 px-4 py-3 text-[12px] text-white/88 backdrop-blur-[8px]">
                    {{ previewDescription }}
                  </div>
                  <div class="flex items-center justify-between rounded-[20px] bg-white/14 px-4 py-3 text-[11px] font-semibold text-white backdrop-blur-[8px]">
                    <span>{{ mediaLabel }}</span>
                    <span>{{ selectedFile ? "1 tệp" : "Chưa chọn" }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="rounded-[28px] border border-[#dbe3f2] bg-white p-5 shadow-[0_14px_34px_rgba(15,35,110,0.07)]">
          <p class="text-[12px] font-bold uppercase tracking-[0.26em] text-[#0000ff]/70">
            Gợi ý nhanh
          </p>
          <div class="mt-4 space-y-3">
            <div
              v-for="tip in publishingTips"
              :key="tip.title"
              class="rounded-[18px] border border-[#dbe3f2] bg-[#f8fbff] p-4"
            >
              <div class="flex items-center gap-2">
                <Icon :name="tip.icon" class="h-4 w-4 text-[#0000ff]" />
                <p class="text-[13px] font-semibold text-[#243b63]">{{ tip.title }}</p>
              </div>
              <p class="mt-2 text-[12px] leading-6 text-slate-500">
                {{ tip.description }}
              </p>
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

const completionText = computed(() =>
  selectedFile.value ? "1/1 mục chính đã sẵn sàng" : "Chưa có tệp nào được chọn",
)

const mediaLabel = computed(() => {
  if (mediaType.value === "image") return "Ảnh story"
  if (mediaType.value === "video") return "Video story"
  return "Story"
})

const mediaIcon = computed(() =>
  mediaType.value === "video" ? "i-ph-video-fill" : "i-ph-image-fill",
)

const previewDescription = computed(() =>
  selectedFile.value
    ? "Story đã có preview local. Bạn có thể đăng ngay khi cần."
    : "Khung này sẽ hiển thị ảnh hoặc video sau khi bạn chọn tệp.",
)

const previewBarWidth = computed(() => (selectedFile.value ? "76%" : "24%"))

const publishingTips = [
  {
    title: "Ưu tiên ảnh hoặc video dọc",
    description: "Media dọc sẽ đầy khung story hơn và ít bị cắt.",
    icon: "i-ph-rectangle-vertical-fill",
  },
  {
    title: "Chọn tệp rõ nội dung chính",
    description: "Story nên nhìn rõ chủ thể ngay từ giây đầu tiên.",
    icon: "i-ph-eye-fill",
  },
  {
    title: "Giữ flow đăng tin thật ngắn",
    description: "Form này đã rút về một bước upload để thao tác nhanh hơn.",
    icon: "i-ph-lightning-fill",
  },
] as const

const revokePreview = () => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ""
  }
}

const openPicker = () => {
  fileInputRef.value?.click()
}

const clearSelectedFile = () => {
  revokePreview()
  selectedFile.value = null
  mediaType.value = null

  if (fileInputRef.value) {
    fileInputRef.value.value = ""
  }
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
