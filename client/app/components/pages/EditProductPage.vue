  <div class="space-y-8 pb-20 pt-4 px-4 sm:px-6 max-w-[1440px] mx-auto">
    <ProductHeroBanner
      variant="edit"
      :badge="$t('pages.editProductPage.badge')"
      :title="$t('pages.editProductPage.title', { id: productId })"
      :description="$t('pages.editProductPage.description')"
      :secondary-action-label="$t('pages.editProductPage.restore')"
      :stats="heroStats"
      @secondary-action="restoreOriginal"
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
                {{ $t("pages.editProductPage.sectionTitle") }}
              </h2>
              <p class="text-sm font-medium leading-relaxed text-secondary-500 max-w-[480px]">
                {{ $t("pages.editProductPage.sectionDescription") }}
              </p>
            </div>

            <UBadge color="primary" variant="soft" size="lg" class="rounded-full px-5 font-black uppercase tracking-tighter h-10 ring-1 ring-primary-100">
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
            :category-options="categoryOptions"
            :condition-options="conditionOptions"
            :currency-options="currencyOptions"
            :media-summary="mediaSummary"
          >
            <template #media>
              <ProductEditMediaManager
                v-model:files="newFiles"
                :current-images="currentImages"
                :removed-count="draft.removedImageIds.length"
                :image-button-label="imageButtonLabel"
                @remove-current-image="removeCurrentImage"
              />
            </template>
          </ProductEditorFields>
        </UForm>

        <FormsSubmitBar
          :hint="saveHint"
          cta="Lưu thay đổi"
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
          empty-title="Tên sản phẩm sẽ hiển thị ở đây"
          :description="previewDescription"
          :price="previewPrice"
          :stock-label="stockLabel"
          :location="draft.fields.location"
          :image-count="totalImageCount"
          leading-icon="i-ph-pencil-simple-fill"
          trailing-icon="i-ph-floppy-disk-back-fill"
          :status-label="$t('pages.editProductPage.statusUpdated')"
        />

        <ProductChecklistCard :items="checklistItems" />

        <ProductTipsCard
          :title="$t('pages.editProductPage.tipsTitle')"
          :items="editingTips"
        />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  ProductChecklistItem,
  ProductCurrentImage,
  ProductEditorDraft,
  ProductHeroStat,
  ProductTipItem,
} from "../../../types/product-editor"
import { useTimeAgo, watchDebounced } from "@vueuse/core"

type MockProduct = {
  fields: ProductEditorDraft["fields"]
  oldImages: ProductCurrentImage[]
  updatedAt: string
}

const props = defineProps<{
  productId: string
}>()

const { t } = useI18n()

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

const toast = useToast()

const mockProducts: Record<string, MockProduct> = {
  "101": {
    fields: {
      title: "Honda Vision 2024",
      price: "1250",
      description: "Xe đi ít, giấy tờ đầy đủ, máy êm và ngoại hình còn mới. Phù hợp đi lại hằng ngày hoặc mua cho sinh viên.",
      category: "vehicles",
      condition: "like-new",
      location: "Đà Nẵng",
      currency: "USD",
      stock: "2",
    },
    oldImages: [
      createProductMockImage("old-1", "Vision Front", 0),
      createProductMockImage("old-2", "Vision Side", 1),
      createProductMockImage("old-3", "Vision Detail", 2),
    ],
    updatedAt: "Cập nhật 2 giờ trước",
  },
  "202": {
    fields: {
      title: "Bộ nồi chiên không dầu 6L",
      price: "185",
      description: "Bộ nồi chiên còn đẹp, hoạt động ổn định, đầy đủ khay và phụ kiện. Phù hợp gia đình nhỏ và căn hộ.",
      category: "home",
      condition: "used",
      location: "TP. Hồ Chí Minh",
      currency: "USD",
      stock: "5",
    },
    oldImages: [
      createProductMockImage("old-1", "Air Fryer Main", 0),
      createProductMockImage("old-2", "Air Fryer Tray", 3),
    ],
    updatedAt: "Cập nhật hôm qua",
  },
}

const fallbackProduct: MockProduct = {
  fields: {
    title: "Sản phẩm demo đang chỉnh sửa",
    price: "89",
    description: "Đây là dữ liệu mẫu để kiểm tra flow sửa sản phẩm trong marketplace.",
    category: "tech",
    condition: "new",
    location: "Hà Nội",
    currency: "USD",
    stock: "3",
  },
  oldImages: [
    createProductMockImage("old-1", "Demo Main", 0),
    createProductMockImage("old-2", "Demo Secondary", 1),
  ],
  updatedAt: "Cập nhật gần đây",
}

const activeProduct = computed(() => mockProducts[props.productId] ?? fallbackProduct)
const storageKey = computed(() => `product-editor:edit:${props.productId}`)

const createDraftFromProduct = (product: MockProduct): ProductEditorDraft => ({
  mode: "edit",
  productId: props.productId,
  fields: { ...product.fields },
  removedImageIds: [],
  lastSavedAt: null,
})

const { draft, replaceSource, markSaved } = useProductEditorDraft(storageKey, createDraftFromProduct(activeProduct.value))
const newFiles = shallowRef<File[]>([])
const savedAgo = useTimeAgo(computed(() => draft.value.lastSavedAt || Date.now()))

const currentImages = computed(() =>
  activeProduct.value.oldImages.filter(image => !draft.value.removedImageIds.includes(image.id)),
)

watch(
  () => props.productId,
  () => {
    replaceSource(createDraftFromProduct(activeProduct.value))
    newFiles.value = []
  },
  { immediate: true },
)

const totalImageCount = computed(() => currentImages.value.length + newFiles.value.length)

const completionCount = computed(() =>
  [
    draft.value.fields.title.trim(),
    draft.value.fields.price.trim(),
    draft.value.fields.description.trim(),
    draft.value.fields.category,
    draft.value.fields.condition,
    draft.value.fields.location.trim(),
    draft.value.fields.stock.trim(),
    totalImageCount.value > 0,
  ].filter(Boolean).length,
)

const completionText = computed(() => `${completionCount.value}/8 trường chính đã hoàn thiện`)
const completionPercent = computed(() => (completionCount.value / 8) * 100)

const mediaSummary = computed(() => {
  if (totalImageCount.value === 0) return t("pages.editProductPage.noImages")
  return totalImageCount.value === 1
    ? t("pages.editProductPage.oneKeptImage")
    : t("pages.editProductPage.keptImages", { count: totalImageCount.value })
})

const imageButtonLabel = computed(() =>
  newFiles.value.length >= 6 ? "Đã đủ 6 ảnh mới" : "Thêm ảnh mới",
)

const heroStats = computed<ProductHeroStat[]>(() => [
  {
    label: t("pages.editProductPage.statCompletion"),
    value: `${completionCount.value}/8`,
    description: t("pages.editProductPage.statCompletionDescription"),
  },
  {
    label: t("pages.editProductPage.statImagesLeft"),
    value: String(currentImages.value.length),
    description: t("pages.editProductPage.statImagesLeftDescription"),
  },
  {
    label: t("pages.editProductPage.statStatus"),
    value: activeProduct.value.updatedAt,
    description: t("pages.editProductPage.statStatusDescription"),
  },
])

const previewBackground = computed(() => categoryMeta[draft.value.fields.category].background)
const previewIcon = computed(() => categoryMeta[draft.value.fields.category].icon)
const previewCategoryLabel = computed(() => categoryMeta[draft.value.fields.category].label)
const previewConditionLabel = computed(() => conditionMap[draft.value.fields.condition])
const previewCurrencyLabel = computed(() => currencyMeta[draft.value.fields.currency].label)
const previewDescription = computed(() =>
  draft.value.fields.description.trim() || "Mô tả cập nhật sẽ hiển thị ở đây để bạn kiểm tra trước khi lưu.",
)

const previewPrice = computed(() => formatProductPrice(draft.value.fields.price, draft.value.fields.currency))
const stockLabel = computed(() => formatProductStockLabel(draft.value.fields.stock))

const saveHint = computed(() =>
  draft.value.lastSavedAt
    ? `Nháp chỉnh sửa được lưu cục bộ ${savedAgo.value}. Ảnh local mới chỉ phục vụ preview UI.`
    : "Nháp chỉnh sửa chưa được lưu cục bộ. Ảnh local mới chỉ phục vụ preview UI.",
)

const checklistItems = computed<ProductChecklistItem[]>(() => [
  {
    label: t("pages.editProductPage.checkPrefill"),
    description: t("pages.editProductPage.checkPrefillDescription"),
    done: true,
  },
  {
    label: "Cập nhật nội dung chính",
    description: "Điền đủ tên sản phẩm, giá bán và mô tả để card hiển thị chuẩn.",
    done: draft.value.fields.title.trim().length > 0
      && Number(draft.value.fields.price) > 0
      && draft.value.fields.description.trim().length >= 20,
  },
  {
    label: "Xử lý ảnh cũ",
    description: "Bạn có thể bỏ bớt ảnh hiện tại trước khi lưu thay đổi.",
    done: draft.value.removedImageIds.length >= 0,
  },
  {
    label: t("pages.editProductPage.checkReady"),
    description: t("pages.editProductPage.checkReadyDescription"),
    done: totalImageCount.value > 0 && completionCount.value >= 7,
  },
])

const editingTips = computed<ProductTipItem[]>(() => [
  {
    title: t("pages.editProductPage.tipSmallChanges"),
    description: t("pages.editProductPage.tipSmallChangesDescription"),
    icon: "i-ph-pencil-line-fill",
  },
  {
    title: t("pages.editProductPage.tipRemoveOld"),
    description: t("pages.editProductPage.tipRemoveOldDescription"),
    icon: "i-ph-trash-fill",
  },
  {
    title: t("pages.editProductPage.tipPreview"),
    description: t("pages.editProductPage.tipPreviewDescription"),
    icon: "i-ph-eye-fill",
  },
])

const removeCurrentImage = (imageId: string) => {
  if (!draft.value.removedImageIds.includes(imageId)) {
    draft.value.removedImageIds.push(imageId)
  }
}

const restoreOriginal = () => {
  replaceSource(createDraftFromProduct(activeProduct.value))
  newFiles.value = []

  toast.add({
    title: "Đã khôi phục dữ liệu gốc",
    description: "Form đã quay về trạng thái mock ban đầu của sản phẩm.",
    color: "primary",
  })
}

watchDebounced(
  [() => draft.value.fields, () => draft.value.removedImageIds.slice(), () => newFiles.value.length],
  () => {
    markSaved()
  },
  { deep: true, debounce: 800, maxWait: 2000 },
)

const saveDraft = () => {
  markSaved()
  toast.add({
    title: "Đã lưu nháp chỉnh sửa",
    description: "Thay đổi hiện tại đã được lưu cục bộ theo mã sản phẩm.",
    color: "success",
  })
}

const submitMock = () => {
  markSaved()
  toast.add({
    title: "Chưa nối API chỉnh sửa",
    description: "Flow hiện vẫn dừng ở mức UI mock với preview và quản lý ảnh local.",
    color: "neutral",
  })
}
</script>
