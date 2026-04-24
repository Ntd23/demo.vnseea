<template>
  <div class="mx-auto max-w-[1280px] space-y-10 pb-28 px-4 sm:px-6">
    <ProductHeroBanner
      variant="edit"
      :badge="$t('pages.editProductPage.badge')"
      :title="$t('pages.editProductPage.title', { id: productId })"
      :description="$t('pages.editProductPage.description')"
      :secondary-action-label="$t('pages.editProductPage.restore')"
      :stats="heroStats"
      @secondary-action="restoreOriginal"
    />

    <div class="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
      <section class="lg:col-span-8 space-y-10">
        <!-- Completion Summary Card -->
        <div class="surface-card p-8 sm:p-10 space-y-8 ring-1 ring-secondary-200/50 shadow-2xl bg-white relative overflow-hidden group/summary">
          <div class="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent pointer-events-none opacity-0 group-hover/summary:opacity-100 transition-opacity duration-1000" />
          
          <div class="relative z-10 flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            <div class="space-y-3">
              <p class="text-[10px] font-black uppercase tracking-[0.4em] text-secondary-900 pl-1">
                {{ $t("pages.productEditor.editSectionEyebrow") }}
              </p>
              <h2 class="text-3xl font-black tracking-tight text-secondary-900 leading-none">
                {{ $t("pages.editProductPage.sectionTitle") }}
              </h2>
              <p class="text-base font-medium leading-relaxed text-secondary-500 max-w-[520px] italic">
                "{{ $t("pages.editProductPage.sectionDescription") }}"
              </p>
            </div>

            <UBadge
              variant="soft"
              size="lg"
              class="rounded-2xl px-6 font-black uppercase tracking-widest h-12 bg-primary-50 text-primary-600 ring-1 ring-primary-100 shadow-sm"
            >
              <template #leading>
                <Icon name="i-ph-seal-check-duotone" class="h-5 w-5 mr-3" />
              </template>
              {{ completionText }}
            </UBadge>
          </div>
          
          <div class="relative z-10 space-y-4">
            <div class="flex justify-between text-[11px] font-black text-secondary-400 uppercase tracking-[0.2em] px-1">
              <span>{{ $t('pages.productEditor.completionLabel') || 'Độ hoàn thiện' }}</span>
              <span class="text-secondary-900">{{ Math.round(completionPercent) }}%</span>
            </div>
            <div class="h-3 w-full rounded-full bg-secondary-50 ring-1 ring-secondary-100 overflow-hidden shadow-inner">
              <div 
                class="h-full bg-primary-500 transition-all duration-1000 shadow-[0_0_12px_rgba(var(--color-primary-500-rgb),0.5)]" 
                :style="{ width: `${completionPercent}%` }" 
              />
            </div>
          </div>
        </div>

        <UForm :state="draft.fields" class="space-y-10">
          <ProductEditorFields
            v-model:title="draft.fields.title"
            v-model:price="draft.fields.price"
            v-model:description="draft.fields.description"
            v-model:category="draft.fields.category"
            v-model:condition="draft.fields.condition"
            v-model:location="draft.fields.location"
            v-model:currency="draft.fields.currency"
            v-model:stock="draft.fields.stock"
            :description-label="$t('pages.productEditor.descriptionLabel') || 'Sự mô tả'"
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
          :cta="$t('pages.editProductPage.submitCta') || 'Lưu thay đổi'"
          class="rounded-[2.5rem] p-4 bg-white/90 backdrop-blur-3xl ring-1 ring-secondary-200/50 shadow-[0_-32px_64px_-16px_rgba(0,0,0,0.1)] transition-all hover:shadow-[0_-48px_80px_-24px_rgba(0,0,0,0.15)]"
          @save="saveDraft"
          @submit="submitMock"
        />
      </section>

      <aside class="lg:col-span-4 space-y-8">
        <ProductPreviewCard
          :preview-background="previewBackground"
          :preview-icon="previewIcon"
          :category-label="previewCategoryLabel"
          :condition-label="previewConditionLabel"
          :currency-label="previewCurrencyLabel"
          :title="draft.fields.title"
          :empty-title="$t('pages.editProductPage.emptyPreviewTitle') || 'Tên sản phẩm sẽ hiển thị ở đây'"
          :description="previewDescription"
          :price="previewPrice"
          :stock-label="stockLabel"
          :location="draft.fields.location"
          :image-count="totalImageCount"
          leading-icon="i-ph-pencil-simple"
          trailing-icon="i-ph-floppy-disk-back"
          :status-label="$t('pages.editProductPage.statusUpdated')"
        />

        <ProductChecklistCard :items="checklistItems" />

        <ProductTipsCard :tips="editingTips" />
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

const activeCategoryMeta = computed(() =>
  categoryMeta.value[draft.value.fields.category] ?? categoryMeta.value.vehicles,
)

const previewBackground = computed(() => activeCategoryMeta.value.background)
const previewIcon = computed(() => activeCategoryMeta.value.icon)
const previewCategoryLabel = computed(() => activeCategoryMeta.value.label)
const previewConditionLabel = computed(() =>
  conditionMap.value[draft.value.fields.condition] ?? conditionMap.value.new,
)
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
    label: t("pages.editProductPage.checkPrefill") || "Khởi tạo dữ liệu",
    done: true,
  },
  {
    label: t('pages.productEditor.checkTitlePriceDescription') || "Cập nhật nội dung chính",
    done: draft.value.fields.title.trim().length > 0
      && Number(draft.value.fields.price) > 0
      && draft.value.fields.description.trim().length >= 20,
  },
  {
    label: t('pages.productEditor.checkMediaLegacy') || "Xử lý ảnh cũ",
    done: draft.value.removedImageIds.length >= 0,
  },
  {
    label: t("pages.editProductPage.checkReady"),
    done: totalImageCount.value > 0 && completionCount.value >= 7,
  },
])

const editingTips = computed<string[]>(() => [
  t("pages.editProductPage.tipSmallChangesDescription"),
  t("pages.editProductPage.tipRemoveOldDescription"),
  t("pages.editProductPage.tipPreviewDescription"),
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

<style scoped>
</style>
