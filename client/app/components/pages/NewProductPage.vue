<template>
  <div class="space-y-5 pb-10">
    <ProductHeroBanner
      variant="create"
      badge="P-11 · Tạo sản phẩm"
      title="Đăng sản phẩm mới"
      description="Biểu mẫu đã được rút lại theo đúng flow marketplace: tên, giá bán, mô tả, loại, loại hình, địa điểm, tiền tệ, tồn kho và hình ảnh."
      secondary-action-label="Điền nhanh dữ liệu mẫu"
      :stats="heroStats"
      @secondary-action="quickFillDemo"
    />

    <div class="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.06fr)_360px]">
      <section class="space-y-5">
        <div class="rounded-[28px] border border-[#dbe3f2] bg-white p-4 shadow-[0_14px_34px_rgba(15,35,110,0.07)] sm:p-5">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p class="text-[12px] font-bold uppercase tracking-[0.26em] text-[#0000ff]/70">
                Biên tập
              </p>
              <h2 class="mt-1 text-[1.35rem] font-black tracking-[-0.05em] text-[#243b63]">
                Thông tin sản phẩm
              </h2>
              <p class="mt-1 text-[14px] leading-6 text-slate-500">
                Form được căn lại theo thiết kế mới, tập trung vào các trường
                cốt lõi của tin đăng.
              </p>
            </div>

            <div class="inline-flex items-center gap-2 rounded-full bg-[#f7f9ff] px-3 py-2 text-[12px] font-semibold text-slate-600">
              <Icon name="i-ph-seal-check-fill" class="h-4 w-4 text-[#0000ff]" />
              {{ completionText }}
            </div>
          </div>
        </div>

        <ProductEditorFields
          v-model:title="title"
          v-model:price="price"
          v-model:description="description"
          v-model:category="category"
          v-model:condition="condition"
          v-model:location="location"
          v-model:currency="currency"
          v-model:stock="stock"
          description-label="Sự mô tả"
          :category-options="categoryOptions"
          :condition-options="conditionOptions"
          :currency-options="currencyOptions"
          :media-summary="mediaSummary"
        >
          <template #media>
            <ProductCreateMediaField
              :image-tiles="imageTiles"
              :image-button-label="imageButtonLabel"
              @add-image="cycleImageCount"
            />
          </template>
        </ProductEditorFields>

        <FormsSubmitBar
          hint="Mock state: form hiện chỉ mô phỏng UI theo design, chưa submit thật."
          cta="Đăng sản phẩm"
        />
      </section>

      <aside class="space-y-5">
        <ProductPreviewCard
          :preview-background="previewBackground"
          :preview-icon="previewIcon"
          :category-label="previewCategoryLabel"
          :condition-label="previewConditionLabel"
          :currency-label="previewCurrencyLabel"
          :title="title"
          empty-title="Tên sản phẩm của bạn sẽ hiển thị ở đây"
          :description="previewDescription"
          :price="previewPrice"
          :stock-label="stockLabel"
          :location="location"
          :image-count="imageCount"
          leading-icon="i-ph-chat-circle-text-fill"
          trailing-icon="i-ph-shopping-cart-simple-fill"
          status-label="Sẵn sàng"
        />

        <ProductChecklistCard :items="checklistItems" />

        <ProductTipsCard
          title="Gợi ý điền form"
          :items="sellingTips"
        />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  CategoryValue,
  ConditionValue,
  CurrencyValue,
  ProductChecklistItem,
  ProductHeroStat,
  ProductTipItem,
} from "~/types/product-editor"

useSeoMeta({
  title: "Tạo sản phẩm | VNSEEA",
  description: "Tạo tin đăng sản phẩm mới trong marketplace VNSEEA với bộ trường được rút gọn theo thiết kế.",
})

const {
  categoryOptions,
  conditionOptions,
  currencyOptions,
  categoryMeta,
  conditionMap,
  currencyMeta,
  formatProductPrice,
  formatProductStockLabel,
} = useProductEditorMeta()

const title = ref("")
const price = ref("")
const description = ref("")
const category = ref<CategoryValue>("vehicles")
const condition = ref<ConditionValue>("new")
const location = ref("")
const currency = ref<CurrencyValue>("USD")
const stock = ref("")
const imageCount = ref(1)

const imageTiles = computed(() =>
  Array.from({ length: imageCount.value }, (_, index) => ({
    name: `image-${index + 1}`,
  })),
)

const completionCount = computed(() =>
  [
    title.value.trim(),
    price.value.trim(),
    description.value.trim(),
    category.value,
    condition.value,
    location.value.trim(),
    stock.value.trim(),
    imageCount.value > 0,
  ].filter(Boolean).length,
)

const completionText = computed(() => `${completionCount.value}/8 trường chính đã hoàn thiện`)

const heroStats = computed<ProductHeroStat[]>(() => [
  {
    label: "Mục đã điền",
    value: `${completionCount.value}/8`,
    description: "Theo dõi mức hoàn thiện biểu mẫu trước khi đăng.",
  },
  {
    label: "Hình ảnh mock",
    value: String(imageCount.value),
    description: "Bấm ô camera để thay đổi số lượng ảnh hiển thị thử.",
  },
  {
    label: "Tiền tệ",
    value: currency.value,
    description: "Loại tiền đang dùng cho giá bán và preview bên phải.",
  },
])

const previewBackground = computed(() => categoryMeta[category.value].background)
const previewIcon = computed(() => categoryMeta[category.value].icon)
const previewCategoryLabel = computed(() => categoryMeta[category.value].label)
const previewConditionLabel = computed(() => conditionMap[condition.value])
const previewCurrencyLabel = computed(() => currencyMeta[currency.value].label)
const previewDescription = computed(() =>
  description.value.trim()
    || "Mô tả sản phẩm sẽ xuất hiện ở đây để bạn kiểm tra nội dung trước khi đăng.",
)

const previewPrice = computed(() => formatProductPrice(price.value, currency.value))
const stockLabel = computed(() => formatProductStockLabel(stock.value))

const mediaSummary = computed(() =>
  imageCount.value === 1 ? "1 ảnh mẫu" : `${imageCount.value} ảnh mẫu`,
)

const imageButtonLabel = computed(() =>
  imageCount.value >= 10 ? "Đã đủ 10 ảnh" : "Thêm ảnh",
)

const checklistItems = computed<ProductChecklistItem[]>(() => [
  {
    label: "Tên và giá bán",
    description: "Điền đủ tên sản phẩm và giá bán để card hiển thị đầy đủ.",
    done: title.value.trim().length > 0 && Number(price.value) > 0,
  },
  {
    label: "Mô tả rõ ràng",
    description: "Nội dung nên đủ dài để người mua hiểu nhanh sản phẩm.",
    done: description.value.trim().length >= 20,
  },
  {
    label: "Phân loại",
    description: "Chọn loại, loại hình và tiền tệ đúng với tin đăng.",
    done: Boolean(category.value && condition.value && currency.value),
  },
  {
    label: "Địa điểm, tồn kho và ảnh",
    description: "Hoàn thiện khu vực, số lượng còn lại và ít nhất một ảnh mẫu.",
    done: location.value.trim().length > 0 && Number(stock.value) > 0 && imageCount.value > 0,
  },
])

const sellingTips: ProductTipItem[] = [
  {
    title: "Tên sản phẩm ngắn gọn",
    description: "Đặt tên theo đúng món hàng để card marketplace dễ đọc và dễ tìm hơn.",
    icon: "i-ph-text-t-fill",
  },
  {
    title: "Giá và tiền tệ phải nhất quán",
    description: "Nếu bạn dùng USD ở form, preview và card bên phải sẽ đồng bộ ngay lập tức.",
    icon: "i-ph-currency-circle-dollar-fill",
  },
  {
    title: "Ảnh đầu tiên nên rõ sản phẩm",
    description: "Mock uploader đang mô phỏng tile camera, nhưng bố cục đã sẵn cho flow nhiều ảnh.",
    icon: "i-ph-image-square-fill",
  },
]

const cycleImageCount = () => {
  imageCount.value = imageCount.value >= 10 ? 1 : imageCount.value + 1
}

const quickFillDemo = () => {
  title.value = "Honda Vision 2024"
  price.value = "1250"
  description.value = "Xe đi ít, giấy tờ đầy đủ, máy êm và ngoại hình còn mới. Phù hợp đi lại hằng ngày hoặc mua cho sinh viên."
  category.value = "vehicles"
  condition.value = "new"
  location.value = "Đà Nẵng"
  currency.value = "USD"
  stock.value = "2"
  imageCount.value = 4
}
</script>
