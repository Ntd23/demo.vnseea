<template>
  <div class="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.05fr)_360px]">
    <section class="space-y-5">
      <section class="rounded-[28px] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)] sm:p-5">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p class="text-label-secondary text-[var(--color-primary-600)]">
              Biên tập
            </p>
            <h2 class="mt-1 text-heading text-[var(--text-primary)]">
              Thông tin sự kiện
            </h2>
            <p class="mt-1 text-body-secondary">
              Form đang mô phỏng UI tạo sự kiện theo audit P-28, chưa gọi API tạo sự kiện thật.
            </p>
          </div>

          <div class="inline-flex items-center gap-2 rounded-[var(--radius-full)] bg-[var(--color-primary-50)] px-3 py-2 text-[12px] font-bold text-[var(--color-primary-600)]">
            <Icon name="i-ph-seal-check-fill" class="h-4 w-4" />
            {{ completionText }}
          </div>
        </div>
      </section>

      <section class="rounded-[28px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-md)] sm:p-6">
        <label class="block space-y-3">
          <span class="text-[1.02rem] font-black text-[var(--text-primary)]">Tên sự kiện</span>
          <input
            v-model="title"
            class="h-[4.7rem] w-full rounded-[22px] border border-[var(--border-default)] bg-white px-5 text-[1.08rem] text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--color-primary-500)] focus:ring-4 focus:ring-[var(--bg-surface-active)]"
            maxlength="120"
            placeholder="Nhập tên sự kiện"
            type="text"
          >
        </label>

        <label class="mt-7 block space-y-3">
          <span class="text-[1.02rem] font-black text-[var(--text-primary)]">Mô tả</span>
          <textarea
            v-model="description"
            class="min-h-[210px] w-full resize-y rounded-[22px] border border-[var(--border-default)] bg-white px-5 py-5 text-[1rem] leading-8 text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--color-primary-500)] focus:ring-4 focus:ring-[var(--bg-surface-active)]"
            placeholder="Mô tả nội dung, lịch trình và điều người tham dự cần chuẩn bị..."
            rows="7"
          />
        </label>

        <div class="mt-7 grid gap-5 md:grid-cols-2">
          <label class="block space-y-3">
            <span class="text-[1.02rem] font-black text-[var(--text-primary)]">Địa điểm</span>
            <span class="relative block">
              <Icon
                name="i-ph-map-pin-bold"
                class="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-tertiary)]"
              />
              <input
                v-model="location"
                class="h-[4.7rem] w-full rounded-[22px] border border-[var(--border-default)] bg-white pl-14 pr-5 text-[1.02rem] text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--color-primary-500)] focus:ring-4 focus:ring-[var(--bg-surface-active)]"
                placeholder="Nhập địa điểm hoặc link online"
                type="text"
              >
            </span>
          </label>

          <label class="block space-y-3">
            <span class="text-[1.02rem] font-black text-[var(--text-primary)]">Danh mục</span>
            <select
              v-model="category"
              class="h-[4.7rem] w-full rounded-[22px] border border-[var(--border-default)] bg-white px-5 text-[1.02rem] font-semibold text-[var(--text-primary)] outline-none transition focus:border-[var(--color-primary-500)] focus:ring-4 focus:ring-[var(--bg-surface-active)]"
            >
              <option
                v-for="option in eventCategories.slice(1)"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </label>
        </div>

        <div class="mt-7 grid gap-5 md:grid-cols-2">
          <label class="block space-y-3">
            <span class="text-[1.02rem] font-black text-[var(--text-primary)]">Ngày bắt đầu</span>
            <input
              v-model="startDate"
              class="h-[4.7rem] w-full rounded-[22px] border border-[var(--border-default)] bg-white px-5 text-[1.02rem] font-semibold text-[var(--text-primary)] outline-none transition focus:border-[var(--color-primary-500)] focus:ring-4 focus:ring-[var(--bg-surface-active)]"
              type="date"
            >
          </label>

          <label class="block space-y-3">
            <span class="text-[1.02rem] font-black text-[var(--text-primary)]">Giờ bắt đầu</span>
            <input
              v-model="startTime"
              class="h-[4.7rem] w-full rounded-[22px] border border-[var(--border-default)] bg-white px-5 text-[1.02rem] font-semibold text-[var(--text-primary)] outline-none transition focus:border-[var(--color-primary-500)] focus:ring-4 focus:ring-[var(--bg-surface-active)]"
              type="time"
            >
          </label>
        </div>

        <div class="mt-7 grid gap-5 md:grid-cols-2">
          <label class="block space-y-3">
            <span class="text-[1.02rem] font-black text-[var(--text-primary)]">Ngày kết thúc</span>
            <input
              v-model="endDate"
              class="h-[4.7rem] w-full rounded-[22px] border border-[var(--border-default)] bg-white px-5 text-[1.02rem] font-semibold text-[var(--text-primary)] outline-none transition focus:border-[var(--color-primary-500)] focus:ring-4 focus:ring-[var(--bg-surface-active)]"
              type="date"
            >
          </label>

          <label class="block space-y-3">
            <span class="text-[1.02rem] font-black text-[var(--text-primary)]">Giờ kết thúc</span>
            <input
              v-model="endTime"
              class="h-[4.7rem] w-full rounded-[22px] border border-[var(--border-default)] bg-white px-5 text-[1.02rem] font-semibold text-[var(--text-primary)] outline-none transition focus:border-[var(--color-primary-500)] focus:ring-4 focus:ring-[var(--bg-surface-active)]"
              type="time"
            >
          </label>
        </div>

        <div class="mt-8 space-y-3">
          <p class="text-[1.02rem] font-black text-[var(--text-primary)]">Ảnh bìa</p>
          <div class="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
            <label
              class="group flex min-h-[170px] cursor-pointer items-center justify-center rounded-[22px] border border-dashed border-[var(--border-strong)] bg-[var(--bg-surface-hover)] p-4 text-center transition hover:bg-[var(--color-primary-50)]"
              for="event-cover"
            >
              <input
                id="event-cover"
                class="sr-only"
                type="file"
                accept="image/*"
                @change="onCoverChange"
              >
              <span>
                <span class="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-white text-[var(--color-primary-600)] shadow-[var(--shadow-sm)]">
                  <Icon name="i-ph-image-square-fill" class="h-8 w-8" />
                </span>
                <span class="mt-3 block text-[13px] font-bold text-[var(--text-primary)]">
                  Chọn ảnh bìa
                </span>
                <span class="mt-1 block text-[12px] leading-5 text-[var(--text-secondary)]">
                  {{ coverName || "PNG, JPG hoặc WEBP" }}
                </span>
              </span>
            </label>

            <button
              class="relative min-h-[170px] overflow-hidden rounded-[22px] border border-[var(--border-default)] text-left shadow-[var(--shadow-sm)]"
              type="button"
              @click="cycleCover"
            >
              <div class="absolute inset-0" :style="{ background: activeCoverFallback }" />
              <img
                v-if="coverPreviewUrl"
                :src="coverPreviewUrl"
                alt="Preview ảnh bìa sự kiện"
                class="absolute inset-0 h-full w-full object-cover"
              >
              <div class="absolute inset-0 bg-[linear-gradient(180deg,transparent_20%,rgba(15,23,42,0.58)_100%)]" />
              <div class="relative flex h-full min-h-[170px] flex-col justify-end p-4 text-white">
                <p class="text-[12px] font-bold uppercase tracking-[0.18em] text-white/72">
                  Preview
                </p>
                <p class="mt-2 text-[1.1rem] font-black leading-tight">
                  {{ title || "Tên sự kiện sẽ hiển thị ở đây" }}
                </p>
                <p class="mt-2 text-[12px] text-white/78">
                  Nhấn để đổi nền mẫu
                </p>
              </div>
            </button>
          </div>
        </div>
      </section>

      <section class="flex flex-col gap-3 rounded-[28px] border border-[var(--border-default)] bg-white/90 p-4 shadow-[var(--shadow-md)] md:flex-row md:items-center md:justify-between">
        <p class="text-body-secondary">
          {{ submitMessage || "Mock state: form hiện chỉ mô phỏng UI, chưa tạo event thật." }}
        </p>
        <div class="flex flex-wrap gap-3">
          <button
            class="inline-flex h-11 items-center justify-center rounded-[var(--radius-full)] border border-[var(--border-default)] bg-white px-5 text-[14px] font-bold text-[var(--color-primary-600)] transition hover:border-[var(--border-strong)]"
            type="button"
            @click="saveDraft"
          >
            Lưu nháp
          </button>
          <button
            class="inline-flex h-11 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-primary-500)] px-5 text-[14px] font-extrabold text-white shadow-[var(--shadow-brand)] transition hover:-translate-y-0.5"
            type="button"
            @click="publishEvent"
          >
            Tạo sự kiện
          </button>
        </div>
      </section>
    </section>

    <aside class="space-y-4">
      <section class="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]">
        <div class="relative aspect-[16/10] overflow-hidden">
          <div class="absolute inset-0" :style="{ background: activeCoverFallback }" />
          <img
            v-if="coverPreviewUrl"
            :src="coverPreviewUrl"
            alt="Ảnh bìa preview"
            class="absolute inset-0 h-full w-full object-cover"
          >
          <div class="absolute inset-0 bg-[linear-gradient(180deg,transparent_18%,rgba(15,23,42,0.72)_100%)]" />
          <div class="absolute left-4 top-4 rounded-[16px] bg-white text-center shadow-[var(--shadow-md)]">
            <p class="rounded-t-[16px] bg-[var(--color-primary-500)] px-3 py-1 text-[11px] font-black uppercase text-white">
              {{ previewMonth }}
            </p>
            <p class="px-3 py-2 text-[1.35rem] font-black leading-none text-[var(--text-primary)]">
              {{ previewDay }}
            </p>
          </div>
          <div class="absolute bottom-4 left-4 right-4 text-white">
            <p class="text-[12px] font-bold uppercase tracking-[0.18em] text-white/72">
              {{ currentCategoryLabel }}
            </p>
            <h2 class="mt-2 text-[1.25rem] font-black leading-tight">
              {{ title || "Tên sự kiện" }}
            </h2>
          </div>
        </div>
        <div class="p-4">
          <div class="space-y-3 text-[13px] font-semibold text-[var(--text-secondary)]">
            <div class="flex items-center gap-2">
              <Icon name="i-ph-calendar-check-fill" class="h-4 w-4 text-[var(--color-primary-600)]" />
              <span>{{ dateSummary }}</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon name="i-ph-map-pin-fill" class="h-4 w-4 text-[var(--color-primary-600)]" />
              <span>{{ location || "Địa điểm sự kiện" }}</span>
            </div>
          </div>
          <p class="mt-4 text-[13px] leading-6 text-[var(--text-secondary)]">
            {{ description || "Mô tả ngắn sẽ giúp người tham dự hiểu lý do nên tham gia sự kiện này." }}
          </p>
        </div>
      </section>

      <section class="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)]">
        <p class="text-label-secondary text-[var(--color-primary-600)]">
          Checklist
        </p>
        <div class="mt-4 space-y-3">
          <div
            v-for="item in checklist"
            :key="item.label"
            class="flex items-center gap-3"
          >
            <span
              class="flex h-8 w-8 items-center justify-center rounded-full"
              :class="item.done
                ? 'bg-[var(--color-primary-500)] text-white'
                : 'bg-[var(--color-secondary-100)] text-[var(--text-tertiary)]'"
            >
              <Icon :name="item.done ? 'i-ph-check-bold' : 'i-ph-circle'" class="h-4 w-4" />
            </span>
            <span class="text-[13px] font-semibold text-[var(--text-secondary)]">
              {{ item.label }}
            </span>
          </div>
        </div>
      </section>
    </aside>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  quickFillSeed: number
}>()

const { eventCategories } = useMockEventsData()

const title = ref("")
const description = ref("")
const location = ref("")
const category = ref("community")
const startDate = ref("2026-05-14")
const startTime = ref("09:00")
const endDate = ref("2026-05-14")
const endTime = ref("17:30")
const coverName = ref("")
const coverPreviewUrl = ref("")
const coverIndex = ref(0)
const submitMessage = ref("")

const coverFallbacks = [
  "linear-gradient(135deg,#0f766e 0%,#0000ff 58%,#f59e0b 120%)",
  "linear-gradient(135deg,#0ea5e9 0%,#16a34a 60%,#f59e0b 120%)",
  "linear-gradient(135deg,#111827 0%,#0000ff 58%,#10b981 120%)",
]

const activeCoverFallback = computed(() => coverFallbacks[coverIndex.value])

const currentCategoryLabel = computed(() =>
  eventCategories.find((option) => option.value === category.value)?.label || "Cộng đồng",
)

const previewDate = computed(() => {
  const date = new Date(`${startDate.value}T${startTime.value}`)
  if (Number.isNaN(date.getTime())) return null
  return date
})

const previewMonth = computed(() => {
  if (!previewDate.value) return "TH"
  return `TH${previewDate.value.getMonth() + 1}`
})

const previewDay = computed(() => {
  if (!previewDate.value) return "--"
  return String(previewDate.value.getDate()).padStart(2, "0")
})

const dateSummary = computed(() => {
  if (!startDate.value || !startTime.value || !endDate.value || !endTime.value) {
    return "Chọn ngày giờ diễn ra"
  }

  return `${startDate.value} ${startTime.value} - ${endDate.value} ${endTime.value}`
})

const checklist = computed(() => [
  { label: "Tên sự kiện", done: title.value.trim().length >= 8 },
  { label: "Mô tả", done: description.value.trim().length >= 24 },
  { label: "Địa điểm", done: location.value.trim().length >= 4 },
  { label: "Thời gian bắt đầu", done: Boolean(startDate.value && startTime.value) },
  { label: "Thời gian kết thúc", done: Boolean(endDate.value && endTime.value) },
  { label: "Ảnh bìa", done: Boolean(coverName.value || coverPreviewUrl.value || coverIndex.value >= 0) },
])

const completedItems = computed(() => checklist.value.filter((item) => item.done).length)
const completionText = computed(() => `${completedItems.value}/${checklist.value.length} mục đã sẵn sàng`)

const cycleCover = () => {
  coverIndex.value = (coverIndex.value + 1) % coverFallbacks.length
}

const onCoverChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  if (coverPreviewUrl.value) {
    URL.revokeObjectURL(coverPreviewUrl.value)
  }

  coverName.value = file.name
  coverPreviewUrl.value = URL.createObjectURL(file)
}

const quickFillDemo = () => {
  title.value = "Workshop vận hành cộng đồng sản phẩm"
  description.value = "Buổi workshop thực hành dành cho admin cộng đồng: thiết kế lịch nội dung, chia nhóm thành viên, đo tương tác và chuẩn bị kế hoạch sau sự kiện."
  location.value = "Innovation Hub, Quận 1"
  category.value = "community"
  startDate.value = "2026-05-14"
  startTime.value = "09:00"
  endDate.value = "2026-05-14"
  endTime.value = "17:30"
  submitMessage.value = "Đã điền dữ liệu mẫu để kiểm tra giao diện tạo sự kiện."
}

watch(() => props.quickFillSeed, () => {
  quickFillDemo()
})

const saveDraft = () => {
  submitMessage.value = "Đã mô phỏng lưu nháp sự kiện. Dữ liệu sẽ mất khi reload vì chưa nối API."
}

const publishEvent = () => {
  submitMessage.value = "Đã mô phỏng tạo sự kiện. Bước backend sau này sẽ gọi create-event.php."
}

onUnmounted(() => {
  if (coverPreviewUrl.value) {
    URL.revokeObjectURL(coverPreviewUrl.value)
  }
})
</script>
