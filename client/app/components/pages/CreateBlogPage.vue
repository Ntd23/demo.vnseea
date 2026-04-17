<template>
  <div class="space-y-5 pb-10">
    <BlogsCreateBlogHero
      :stats="heroStats"
      @quick-fill="quickFillDemo"
    />

    <div class="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.05fr)_360px]">
      <section class="space-y-5">
        <section class="rounded-[28px] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)] sm:p-5">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p class="text-label-secondary text-[var(--color-primary-600)]">
                Biên tập
              </p>
              <h2 class="mt-1 text-heading text-[var(--text-primary)]">
                Nội dung bài báo
              </h2>
              <p class="mt-1 text-body-secondary">
                Các trường đang mô phỏng UI tạo blog theo audit P-25, chưa gọi API thật.
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
            <span class="text-[1.02rem] font-black text-[var(--text-primary)]">Tiêu đề</span>
            <input
              v-model="title"
              class="h-[4.7rem] w-full rounded-[22px] border border-[var(--border-default)] bg-white px-5 text-[1.08rem] text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--color-primary-500)] focus:ring-4 focus:ring-[var(--bg-surface-active)]"
              maxlength="120"
              placeholder="Nhập tiêu đề bài báo"
              type="text"
            >
          </label>

          <div class="mt-7 space-y-3">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p class="text-[1.02rem] font-black text-[var(--text-primary)]">
                Nội dung
              </p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="action in editorActions"
                  :key="action.label"
                  class="inline-flex h-9 items-center gap-1.5 rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-surface-hover)] px-3 text-[12px] font-bold text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--color-primary-600)]"
                  type="button"
                  @click="applyEditorToken(action.token)"
                >
                  <Icon :name="action.icon" class="h-3.5 w-3.5" />
                  {{ action.label }}
                </button>
              </div>
            </div>

            <textarea
              v-model="content"
              class="min-h-[280px] w-full resize-y rounded-[22px] border border-[var(--border-default)] bg-white px-5 py-5 text-[1rem] leading-8 text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--color-primary-500)] focus:ring-4 focus:ring-[var(--bg-surface-active)]"
              placeholder="Viết nội dung bài báo của bạn..."
              rows="10"
            />
          </div>

          <div class="mt-7 grid gap-5 md:grid-cols-2">
            <label class="block space-y-3">
              <span class="text-[1.02rem] font-black text-[var(--text-primary)]">Thể loại</span>
              <select
                v-model="category"
                class="h-[4.7rem] w-full rounded-[22px] border border-[var(--border-default)] bg-white px-5 text-[1.02rem] font-semibold text-[var(--text-primary)] outline-none transition focus:border-[var(--color-primary-500)] focus:ring-4 focus:ring-[var(--bg-surface-active)]"
              >
                <option
                  v-for="option in categoryOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </label>

            <label class="block space-y-3">
              <span class="text-[1.02rem] font-black text-[var(--text-primary)]">Tags</span>
              <input
                v-model="tagsInput"
                class="h-[4.7rem] w-full rounded-[22px] border border-[var(--border-default)] bg-white px-5 text-[1.02rem] text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--color-primary-500)] focus:ring-4 focus:ring-[var(--bg-surface-active)]"
                placeholder="ai, cộng đồng, thị trường"
                type="text"
              >
            </label>
          </div>

          <div class="mt-4 flex min-h-9 flex-wrap gap-2">
            <span
              v-for="tag in tagList"
              :key="tag"
              class="inline-flex items-center rounded-[var(--radius-full)] bg-[var(--color-primary-50)] px-3 py-1.5 text-[12px] font-bold text-[var(--color-primary-600)]"
            >
              #{{ tag }}
            </span>
            <span v-if="tagList.length === 0" class="text-caption-secondary">
              Các tag sẽ xuất hiện tại đây sau khi nhập, phân tách bằng dấu phẩy.
            </span>
          </div>

          <div class="mt-8 space-y-3">
            <p class="text-[1.02rem] font-black text-[var(--text-primary)]">Ảnh đại diện</p>
            <div class="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
              <label
                class="group flex min-h-[170px] cursor-pointer items-center justify-center rounded-[22px] border border-dashed border-[var(--border-strong)] bg-[var(--bg-surface-hover)] p-4 text-center transition hover:bg-[var(--color-primary-50)]"
                for="blog-thumbnail"
              >
                <input
                  id="blog-thumbnail"
                  class="sr-only"
                  type="file"
                  accept="image/*"
                  @change="onThumbnailChange"
                >
                <span>
                  <span class="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-white text-[var(--color-primary-600)] shadow-[var(--shadow-sm)]">
                    <Icon name="i-ph-image-square-fill" class="h-8 w-8" />
                  </span>
                  <span class="mt-3 block text-[13px] font-bold text-[var(--text-primary)]">
                    Chọn ảnh thumbnail
                  </span>
                  <span class="mt-1 block text-[12px] leading-5 text-[var(--text-secondary)]">
                    {{ thumbnailName || "PNG, JPG hoặc WEBP" }}
                  </span>
                </span>
              </label>

              <button
                class="relative min-h-[170px] overflow-hidden rounded-[22px] border border-[var(--border-default)] text-left shadow-[var(--shadow-sm)]"
                type="button"
                @click="cycleThumbnail"
              >
                <div class="absolute inset-0" :style="{ background: thumbnailBackground }" />
                <div class="absolute inset-0 bg-[linear-gradient(180deg,transparent_20%,rgba(15,23,42,0.55)_100%)]" />
                <div class="relative flex h-full min-h-[170px] flex-col justify-end p-4 text-white">
                  <p class="text-[12px] font-bold uppercase tracking-[0.18em] text-white/72">
                    Preview
                  </p>
                  <p class="mt-2 text-[1.1rem] font-black leading-tight">
                    {{ title || "Tiêu đề bài báo sẽ hiển thị ở đây" }}
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
            {{ submitMessage || "Mock state: form hiện chỉ mô phỏng UI, chưa submit thật." }}
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
              @click="publishMock"
            >
              Đăng bài báo
            </button>
          </div>
        </section>
      </section>

      <BlogsCreateBlogSidebar
        :title="title"
        :thumbnail-background="thumbnailBackground"
        :selected-category-label="selectedCategoryLabel"
        :read-minutes="readMinutes"
        :tag-list="tagList"
        :preview-excerpt="previewExcerpt"
        :checklist-items="checklistItems"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
type BlogCategoryValue =
  | "business"
  | "education"
  | "movies"
  | "gaming"
  | "history"
  | "lifestyle"
  | "people"
  | "pets"
  | "science"
  | "sports"
  | "travel"
  | "other"

useSeoMeta({
  title: "Viết blog | VNSEEA",
  description: "Tạo bài báo mới trên VNSEEA với tiêu đề, nội dung, chủ đề, tags và thumbnail.",
})

const title = ref("")
const content = ref("")
const category = ref<BlogCategoryValue>("business")
const tagsInput = ref("")
const thumbnailName = ref("")
const thumbnailIndex = ref(0)
const submitMessage = ref("")

const categoryOptions = [
  { label: "Kinh tế và Thương mại", value: "business" },
  { label: "Giáo dục", value: "education" },
  { label: "Phim & Hoạt hình", value: "movies" },
  { label: "Chơi game", value: "gaming" },
  { label: "Lịch sử và Sự kiện", value: "history" },
  { label: "Cách sống", value: "lifestyle" },
  { label: "Con người và Quốc gia", value: "people" },
  { label: "Thú cưng và Động vật", value: "pets" },
  { label: "Khoa học và Công nghệ", value: "science" },
  { label: "Thể thao", value: "sports" },
  { label: "Du lịch và Sự kiện", value: "travel" },
  { label: "Khác", value: "other" },
] satisfies { label: string; value: BlogCategoryValue }[]

const editorActions = [
  { label: "Đậm", icon: "i-ph-text-b-bold", token: "**nội dung đậm**" },
  { label: "Tiêu đề", icon: "i-ph-text-h-bold", token: "## Tiêu đề phụ" },
  { label: "Trích dẫn", icon: "i-ph-quotes-fill", token: "> Trích dẫn nổi bật" },
  { label: "Danh sách", icon: "i-ph-list-bullets-bold", token: "- Ý chính" },
] as const

const thumbnailBackgrounds = [
  "linear-gradient(135deg,#14532d 0%,#16a34a 46%,#bbf7d0 100%)",
  "linear-gradient(135deg,#172554 0%,#1d4ed8 46%,#7dd3fc 100%)",
  "linear-gradient(135deg,#111827 0%,#4f46e5 42%,#c4b5fd 100%)",
  "linear-gradient(135deg,#9f1239 0%,#fb7185 100%)",
] as const

const tagList = computed(() =>
  tagsInput.value
    .split(",")
    .map(tag => tag.trim().replace(/^#/, ""))
    .filter(Boolean)
    .slice(0, 8),
)

const selectedCategoryLabel = computed(
  () => categoryOptions.find(option => option.value === category.value)?.label ?? "Khác",
)

const thumbnailBackground = computed(
  () => thumbnailBackgrounds[thumbnailIndex.value % thumbnailBackgrounds.length],
)

const readMinutes = computed(() => {
  const words = content.value.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 180))
})

const completionCount = computed(() =>
  [
    title.value.trim().length >= 12,
    content.value.trim().length >= 80,
    Boolean(category.value),
    tagList.value.length > 0,
    thumbnailName.value.length > 0 || thumbnailIndex.value > 0,
  ].filter(Boolean).length,
)

const completionText = computed(() => `${completionCount.value}/5 mục chính đã hoàn thiện`)

const heroStats = computed(() => [
  {
    label: "Hoàn thiện",
    value: `${completionCount.value}/5`,
    description: "Theo dõi các trường bắt buộc trước khi đăng.",
  },
  {
    label: "Thời lượng",
    value: `${readMinutes.value}p`,
    description: "Ước tính thời gian đọc theo nội dung hiện tại.",
  },
  {
    label: "Tags",
    value: String(tagList.value.length),
    description: "Hashtags giúp bài viết dễ được tìm thấy.",
  },
])

const previewExcerpt = computed(() => {
  const clean = content.value.replace(/[#>*-]/g, "").trim()
  if (!clean) return "Đoạn mở đầu của bài báo sẽ hiển thị trong preview để bạn kiểm tra nhịp đọc trước khi đăng."
  return clean.length > 180 ? `${clean.slice(0, 180)}...` : clean
})

const checklistItems = computed(() => [
  {
    label: "Tiêu đề rõ ràng",
    description: "Tối thiểu 12 ký tự để card blog không bị trống hoặc quá ngắn.",
    done: title.value.trim().length >= 12,
  },
  {
    label: "Nội dung đủ dài",
    description: "Tối thiểu 80 ký tự để reader layout có phần nội dung chính.",
    done: content.value.trim().length >= 80,
  },
  {
    label: "Chủ đề và tags",
    description: "Chọn đúng thể loại và thêm ít nhất một hashtag.",
    done: Boolean(category.value) && tagList.value.length > 0,
  },
  {
    label: "Thumbnail",
    description: "Ảnh đại diện giúp bài viết rõ hơn trong danh sách blogs.",
    done: thumbnailName.value.length > 0 || thumbnailIndex.value > 0,
  },
])

const applyEditorToken = (token: string) => {
  content.value = content.value.trim()
    ? `${content.value.trim()}\n\n${token}`
    : token
}

const cycleThumbnail = () => {
  thumbnailIndex.value += 1
}

const onThumbnailChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  thumbnailName.value = file.name
  cycleThumbnail()
}

const saveDraft = () => {
  submitMessage.value = "Đã lưu nháp mock. Nội dung vẫn nằm trong state hiện tại của trang."
}

const publishMock = () => {
  submitMessage.value = completionCount.value >= 5
    ? "Mock publish hoàn tất. Khi nối API, nút này sẽ gửi dữ liệu tới blogs.php."
    : "Bổ sung các mục còn thiếu trong checklist trước khi đăng thật."
}

const quickFillDemo = () => {
  title.value = "Cộng đồng địa phương trong các dự án xanh"
  content.value = "Khi cư dân tham gia từ đầu, kế hoạch trồng cây, phân loại rác và giữ vệ sinh công cộng dễ duy trì hơn. Bài viết này ghi lại cách một nhóm nhỏ phân chia vai trò, giữ lịch cập nhật và đo hiệu quả sau từng tuần triển khai.\n\n## Điểm đáng chú ý\n- Mỗi nhóm có một người phụ trách nhắc lịch.\n- Kết quả được cập nhật bằng hình ảnh trước và sau.\n- Các hoạt động nhỏ được lặp lại đều đặn thay vì tổ chức quá lớn."
  category.value = "people"
  tagsInput.value = "community, green, local"
  thumbnailName.value = "community-green.jpg"
  thumbnailIndex.value = 2
  submitMessage.value = ""
}
</script>
