<template>
  <div class="space-y-5 pb-10">
    <ProductHeroBanner
      variant="edit"
      badge="P-12 · Chỉnh sửa sản phẩm"
      :title="`Sửa sản phẩm #${productId}`"
      description="Giao diện chỉnh sửa dùng cùng visual system với trang tạo sản phẩm, nhưng được pre-fill dữ liệu cũ và hỗ trợ xóa ảnh hiện tại trước khi lưu."
      secondary-action-label="Khôi phục dữ liệu gốc"
      :stats="heroStats"
      @secondary-action="restoreOriginal"
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
                Cập nhật thông tin sản phẩm
              </h2>
              <p class="mt-1 text-[14px] leading-6 text-slate-500">
                Dữ liệu đang được nạp sẵn theo mã sản phẩm để bạn chỉnh nhanh rồi lưu thay đổi.
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
          :category-options="categoryOptions"
          :condition-options="conditionOptions"
          :currency-options="currencyOptions"
          :media-summary="mediaSummary"
        >
          <template #media>
            <ProductEditMediaManager
              :current-images="currentImages"
              :removed-count="removedImages.length"
              :new-image-tiles="newImageTiles"
              :image-button-label="imageButtonLabel"
              @add-new-image="addNewImage"
              @remove-current-image="removeCurrentImage"
              @remove-new-image="removeNewImage"
            />
          </template>
        </ProductEditorFields>

        <FormsSubmitBar
          hint="Mock state: giao diện sửa sản phẩm đã có pre-fill dữ liệu cũ và xóa ảnh cũ, chưa submit thật tới edit-product.php."
          cta="Lưu thay đổi"
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
          empty-title="Tên sản phẩm sẽ hiển thị ở đây"
          :description="previewDescription"
          :price="previewPrice"
          :stock-label="stockLabel"
          :location="location"
          :image-count="totalImageCount"
          leading-icon="i-ph-pencil-simple-fill"
          trailing-icon="i-ph-floppy-disk-back-fill"
          status-label="Cập nhật"
        />

        <ProductChecklistCard :items="checklistItems" />

        <ProductTipsCard
          title="Gợi ý chỉnh sửa"
          :items="editingTips"
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
  ProductCurrentImage,
  ProductHeroStat,
  ProductImageTile,
  ProductTipItem,
} from "~/types/product-editor"

type MockProduct = {
  title: string
  price: string
  description: string
  category: CategoryValue
  condition: ConditionValue
  location: string
  currency: CurrencyValue
  stock: string
  oldImages: ProductCurrentImage[]
  updatedAt: string
}

const props = defineProps<{
  productId: string
}>()

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

const mockProducts: Record<string, MockProduct> = {
  "101": {
    title: "Honda Vision 2024",
    price: "1250",
    description: "Xe đi ít, giấy tờ đầy đủ, máy êm và ngoại hình còn mới. Phù hợp đi lại hằng ngày hoặc mua cho sinh viên.",
    category: "vehicles",
    condition: "like-new",
    location: "Đà Nẵng",
    currency: "USD",
    stock: "2",
    oldImages: [{ id: "old-1" }, { id: "old-2" }, { id: "old-3" }],
    updatedAt: "Cập nhật 2 giờ trước",
  },
  "202": {
    title: "Bộ nồi chiên không dầu 6L",
    price: "185",
    description: "Bộ nồi chiên còn đẹp, hoạt động ổn định, đầy đủ khay và phụ kiện. Phù hợp gia đình nhỏ và căn hộ.",
    category: "home",
    condition: "used",
    location: "TP. Hồ Chí Minh",
    currency: "USD",
    stock: "5",
    oldImages: [{ id: "old-1" }, { id: "old-2" }],
    updatedAt: "Cập nhật hôm qua",
  },
}

const fallbackProduct: MockProduct = {
  title: "Sản phẩm demo đang chỉnh sửa",
  price: "89",
  description: "Đây là dữ liệu mẫu để kiểm tra flow sửa sản phẩm trong marketplace.",
  category: "tech",
  condition: "new",
  location: "Hà Nội",
  currency: "USD",
  stock: "3",
  oldImages: [{ id: "old-1" }, { id: "old-2" }],
  updatedAt: "Cập nhật gần đây",
}

const title = ref("")
const price = ref("")
const description = ref("")
const category = ref<CategoryValue>("vehicles")
const condition = ref<ConditionValue>("new")
const location = ref("")
const currency = ref<CurrencyValue>("USD")
const stock = ref("")
const currentImages = ref<ProductCurrentImage[]>([])
const removedImages = ref<string[]>([])
const newImages = ref<ProductImageTile[]>([])

const activeProduct = computed(() => mockProducts[props.productId] ?? fallbackProduct)

const applyProduct = (product: MockProduct) => {
  title.value = product.title
  price.value = product.price
  description.value = product.description
  category.value = product.category
  condition.value = product.condition
  location.value = product.location
  currency.value = product.currency
  stock.value = product.stock
  currentImages.value = product.oldImages.map(image => ({ ...image }))
  removedImages.value = []
  newImages.value = []
}

watch(
  () => props.productId,
  () => {
    applyProduct(activeProduct.value)
  },
  { immediate: true },
)

const totalImageCount = computed(() => currentImages.value.length + newImages.value.length)

const completionCount = computed(() =>
  [
    title.value.trim(),
    price.value.trim(),
    description.value.trim(),
    category.value,
    condition.value,
    location.value.trim(),
    stock.value.trim(),
    totalImageCount.value > 0,
  ].filter(Boolean).length,
)

const completionText = computed(() => `${completionCount.value}/8 trường chính đã hoàn thiện`)

const mediaSummary = computed(() => {
  if (totalImageCount.value === 0) return "Không còn ảnh"
  return totalImageCount.value === 1 ? "1 ảnh đang giữ" : `${totalImageCount.value} ảnh đang giữ`
})

const newImageTiles = computed(() => newImages.value)

const imageButtonLabel = computed(() =>
  newImages.value.length >= 6 ? "Đã đủ 6 ảnh mới" : "Thêm ảnh mới",
)

const heroStats = computed<ProductHeroStat[]>(() => [
  {
    label: "Mức hoàn thiện",
    value: `${completionCount.value}/8`,
    description: "Theo dõi nhanh các trường chính trước khi lưu cập nhật.",
  },
  {
    label: "Ảnh còn lại",
    value: String(currentImages.value.length),
    description: "Ảnh cũ vẫn giữ trên tin sau khi loại bỏ các ảnh không cần.",
  },
  {
    label: "Trạng thái",
    value: activeProduct.value.updatedAt,
    description: "Mốc dữ liệu mock được nạp sẵn cho trang chỉnh sửa này.",
  },
])

const previewBackground = computed(() => categoryMeta[category.value].background)
const previewIcon = computed(() => categoryMeta[category.value].icon)
const previewCategoryLabel = computed(() => categoryMeta[category.value].label)
const previewConditionLabel = computed(() => conditionMap[condition.value])
const previewCurrencyLabel = computed(() => currencyMeta[currency.value].label)
const previewDescription = computed(() =>
  description.value.trim() || "Mô tả cập nhật sẽ hiển thị ở đây để bạn kiểm tra trước khi lưu.",
)

const previewPrice = computed(() => formatProductPrice(price.value, currency.value))
const stockLabel = computed(() => formatProductStockLabel(stock.value))

const checklistItems = computed<ProductChecklistItem[]>(() => [
  {
    label: "Pre-fill dữ liệu cũ",
    description: "Tên, giá bán, mô tả và phân loại đã được nạp sẵn theo mã sản phẩm.",
    done: true,
  },
  {
    label: "Cập nhật nội dung chính",
    description: "Điền đủ tên sản phẩm, giá bán và mô tả để card hiển thị chuẩn.",
    done: title.value.trim().length > 0 && Number(price.value) > 0 && description.value.trim().length >= 20,
  },
  {
    label: "Xử lý ảnh cũ",
    description: "Bạn có thể bỏ bớt ảnh hiện tại trước khi lưu thay đổi.",
    done: removedImages.value.length >= 0,
  },
  {
    label: "Sẵn sàng lưu",
    description: "Ít nhất một ảnh còn lại hoặc có ảnh mới và đủ dữ liệu cốt lõi.",
    done: totalImageCount.value > 0 && completionCount.value >= 7,
  },
])

const editingTips: ProductTipItem[] = [
  {
    title: "Không đổi quá nhiều cùng lúc",
    description: "Nếu chỉ cập nhật giá hoặc tồn kho, hãy giữ nguyên các trường còn lại để tránh sai lệch tin đăng.",
    icon: "i-ph-pencil-line-fill",
  },
  {
    title: "Loại bỏ ảnh đã lỗi thời",
    description: "Ảnh cũ không còn đúng tình trạng sản phẩm nên được bỏ khỏi tin trước khi cập nhật.",
    icon: "i-ph-trash-fill",
  },
  {
    title: "Kiểm tra lại preview",
    description: "Khung xem trước bên phải giúp bạn chắc rằng nội dung sau khi sửa vẫn đọc tốt trên card marketplace.",
    icon: "i-ph-eye-fill",
  },
]

const addNewImage = () => {
  if (newImages.value.length >= 6) return
  newImages.value.push({ name: `new-image-${newImages.value.length + 1}` })
}

const removeCurrentImage = (imageId: string) => {
  currentImages.value = currentImages.value.filter(image => image.id !== imageId)
  if (!removedImages.value.includes(imageId)) {
    removedImages.value.push(imageId)
  }
}

const removeNewImage = (imageName: string) => {
  newImages.value = newImages.value.filter(image => image.name !== imageName)
}

const restoreOriginal = () => {
  applyProduct(activeProduct.value)
}
</script>
