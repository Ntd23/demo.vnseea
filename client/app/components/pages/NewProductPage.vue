  <div class="space-y-8 pb-20 pt-4 px-4 sm:px-6 max-w-[1440px] mx-auto">
    <ProductHeroBanner
      variant="create"
      :badge="$t('pages.newProductPage.badge')"
      :title="$t('pages.newProductPage.title')"
      :description="$t('pages.newProductPage.description')"
      :secondary-action-label="$t('pages.newProductPage.quickFill')"
      :stats="heroStats"
      @secondary-action="quickFillDemo"
    />

    <div class="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
      <section class="space-y-8">
        <!-- Completion Summary Card -->
        <div class="surface-card p-6 sm:p-8 space-y-6 ring-1 ring-secondary-100 shadow-xl">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="space-y-1">
              <p class="text-[10px] font-black uppercase tracking-[0.25em] text-primary-500 pl-1">
                {{ $t("pages.productEditor.editSectionEyebrow") }}
              </p>
              <h2 class="text-2xl font-black tracking-tight text-secondary-900">
                {{ $t("pages.newProductPage.sectionTitle") }}
              </h2>
              <p class="text-sm font-medium leading-relaxed text-secondary-500 max-w-[480px]">
                {{ $t("pages.newProductPage.sectionDescription") }}
              </p>
            </div>

            <UBadge color="primary" variant="soft" size="lg" class="rounded-full px-5 font-black uppercase tracking-tighter ring-1 ring-primary-100 h-10">
              <template #leading>
                <Icon name="i-ph-seal-check-duotone" class="h-5 w-5 mr-1" />
              </template>
              {{ completionText }}
            </UBadge>
          </div>
          
          <div class="space-y-2">
            <div class="flex justify-between text-[11px] font-black text-secondary-400 uppercase tracking-widest px-1">
              <span>Độ hoàn thiện</span>
              <span>{{ Math.round(completionPercent) }}%</span>
            </div>
            <UProgress :model-value="completionPercent" color="primary" size="md" class="h-2" />
          </div>
        </div>

        <UForm :state="draft.fields" class="space-y-8">
          <ProductEditorFields
            v-model:title="draft.fields.title"
            v-model:price="draft.fields.price"
            v-model:description="draft.fields.description"
            v-model:category="draft.fields.category"
            v-model:condition="draft.fields.condition"
            v-model:location="draft.fields.location"
            v-model:currency="draft.fields.currency"
            v-model:stock="draft.fields.stock"
            description-label="Sự mô tả"
            :category-options="categoryOptions"
            :condition-options="conditionOptions"
            :currency-options="currencyOptions"
            :media-summary="mediaSummary"
          >
            <template #media>
              <ProductCreateMediaField
                v-model:files="newFiles"
                :image-button-label="imageButtonLabel"
              />
            </template>
          </ProductEditorFields>
        </UForm>

        <FormsSubmitBar
          :hint="saveHint"
          cta="Đăng sản phẩm"
          @save="saveDraft"
          @submit="submitMock"
        />
      </section>

      <aside class="space-y-5">
        <ProductPreviewCard
          :preview-background="previewBackground"
          :preview-icon="previewIcon"
          :category-label="previewCategoryLabel"
          :condition-label="previewConditionLabel"
          :currency-label="previewCurrencyLabel"
          :title="draft.fields.title"
          empty-title="Tên sản phẩm của bạn sẽ hiển thị ở đây"
          :description="previewDescription"
          :price="previewPrice"
          :stock-label="stockLabel"
          :location="draft.fields.location"
          :image-count="imageCount"
          leading-icon="i-ph-chat-circle-text-fill"
          trailing-icon="i-ph-shopping-cart-simple-fill"
          :status-label="$t('pages.newProductPage.statusReady')"
        />

        <ProductChecklistCard :items="checklistItems" />

        <ProductTipsCard
          :title="$t('pages.newProductPage.tipsTitle')"
          :items="sellingTips"
        />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  ProductChecklistItem,
  ProductEditorDraft,
  ProductHeroStat,
  ProductTipItem,
} from "../../../types/product-editor"
import { useTimeAgo, watchDebounced } from "@vueuse/core"

const { t } = useI18n()

useSeoMeta({
  title: () => t("pages.newProductPage.seoTitle"),
  description: () => t("pages.newProductPage.seoDescription"),
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

const createInitialDraft = (): ProductEditorDraft => ({
  mode: "create",
  fields: {
    title: "",
    price: "",
    description: "",
    category: "vehicles",
    condition: "new",
    location: "",
    currency: "USD",
    stock: "",
  },
  removedImageIds: [],
  lastSavedAt: null,
})

const { draft, markSaved } = useProductEditorDraft("product-editor:create", createInitialDraft())
const newFiles = shallowRef<File[]>([])
const toast = useToast()
const savedAgo = useTimeAgo(computed(() => draft.value.lastSavedAt || Date.now()))

const imageCount = computed(() => newFiles.value.length)

const completionCount = computed(() =>
  [
    draft.value.fields.title.trim(),
    draft.value.fields.price.trim(),
    draft.value.fields.description.trim(),
    draft.value.fields.category,
    draft.value.fields.condition,
    draft.value.fields.location.trim(),
    draft.value.fields.stock.trim(),
    imageCount.value > 0,
  ].filter(Boolean).length,
)

const completionText = computed(() => `${completionCount.value}/8 trường chính đã hoàn thiện`)
const completionPercent = computed(() => (completionCount.value / 8) * 100)

const heroStats = computed<ProductHeroStat[]>(() => [
  {
    label: t("pages.newProductPage.statFilled"),
    value: `${completionCount.value}/8`,
    description: t("pages.newProductPage.statFilledDescription"),
  },
  {
    label: "Ảnh local",
    value: String(imageCount.value),
    description: "Ảnh được chọn từ máy để kiểm tra flow preview trước khi nối upload thật.",
  },
  {
    label: "Tiền tệ",
    value: draft.value.fields.currency,
    description: "Loại tiền đang dùng cho giá bán và preview bên phải.",
  },
])

const previewBackground = computed(() => categoryMeta[draft.value.fields.category].background)
const previewIcon = computed(() => categoryMeta[draft.value.fields.category].icon)
const previewCategoryLabel = computed(() => categoryMeta[draft.value.fields.category].label)
const previewConditionLabel = computed(() => conditionMap[draft.value.fields.condition])
const previewCurrencyLabel = computed(() => currencyMeta[draft.value.fields.currency].label)
const previewDescription = computed(() =>
  draft.value.fields.description.trim()
    || "Mô tả sản phẩm sẽ xuất hiện ở đây để bạn kiểm tra nội dung trước khi đăng.",
)

const previewPrice = computed(() => formatProductPrice(draft.value.fields.price, draft.value.fields.currency))
const stockLabel = computed(() => formatProductStockLabel(draft.value.fields.stock))

const mediaSummary = computed(() =>
  imageCount.value === 0 ? "Chưa có ảnh local" : imageCount.value === 1 ? "1 ảnh local" : `${imageCount.value} ảnh local`,
)

const imageButtonLabel = computed(() =>
  imageCount.value >= 10 ? t("pages.newProductPage.maxImages") : t("pages.newProductPage.addImage"),
)

const saveHint = computed(() =>
  draft.value.lastSavedAt
    ? `Nháp được lưu cục bộ ${savedAgo.value}. Upload local chỉ phục vụ preview UI.`
    : "Nháp chưa được lưu cục bộ. Upload local chỉ phục vụ preview UI.",
)

const checklistItems = computed<ProductChecklistItem[]>(() => [
  {
    label: "Tên và giá bán",
    description: "Điền đủ tên sản phẩm và giá bán để card hiển thị đầy đủ.",
    done: draft.value.fields.title.trim().length > 0 && Number(draft.value.fields.price) > 0,
  },
  {
    label: "Mô tả rõ ràng",
    description: "Nội dung nên đủ dài để người mua hiểu nhanh sản phẩm.",
    done: draft.value.fields.description.trim().length >= 20,
  },
  {
    label: "Phân loại",
    description: "Chọn loại, loại hình và tiền tệ đúng với tin đăng.",
    done: Boolean(draft.value.fields.category && draft.value.fields.condition && draft.value.fields.currency),
  },
  {
    label: "Địa điểm, tồn kho và ảnh",
    description: "Hoàn thiện khu vực, số lượng còn lại và ít nhất một ảnh local.",
    done: draft.value.fields.location.trim().length > 0 && Number(draft.value.fields.stock) > 0 && imageCount.value > 0,
  },
])

const sellingTips = computed<ProductTipItem[]>(() => [
  {
    title: t("pages.newProductPage.tipName"),
    description: t("pages.newProductPage.tipNameDescription"),
    icon: "i-ph-text-t-fill",
  },
  {
    title: t("pages.newProductPage.tipPrice"),
    description: t("pages.newProductPage.tipPriceDescription"),
    icon: "i-ph-currency-circle-dollar-fill",
  },
  {
    title: "Ảnh đầu tiên nên rõ sản phẩm",
    description: "Uploader local đã sẵn để kiểm tra preview trước khi nối upload thật.",
    icon: "i-ph-image-square-fill",
  },
])

const quickFillDemo = () => {
  draft.value.fields.title = "Honda Vision 2024"
  draft.value.fields.price = "1250"
  draft.value.fields.description = "Xe đi ít, giấy tờ đầy đủ, máy êm và ngoại hình còn mới. Phù hợp đi lại hằng ngày hoặc mua cho sinh viên."
  draft.value.fields.category = "vehicles"
  draft.value.fields.condition = "new"
  draft.value.fields.location = "Đà Nẵng"
  draft.value.fields.currency = "USD"
  draft.value.fields.stock = "2"

  toast.add({
    title: "Đã điền dữ liệu mẫu",
    description: "Bạn có thể tiếp tục chỉnh nội dung rồi xem preview bên phải.",
    color: "primary",
  })
}

watchDebounced(
  [() => draft.value.fields, () => newFiles.value.length],
  () => {
    markSaved()
  },
  { deep: true, debounce: 800, maxWait: 2000 },
)

const saveDraft = () => {
  markSaved()
  toast.add({
    title: "Đã lưu nháp",
    description: "Thông tin sản phẩm đã được lưu cục bộ trên trình duyệt này.",
    color: "success",
  })
}

const submitMock = () => {
  markSaved()
  toast.add({
    title: "Chưa nối submit thật",
    description: "Flow hiện đang dừng ở mức UI mock và preview local.",
    color: "neutral",
  })
}
</script>
