<template>
  <div class="mx-auto max-w-[1280px] space-y-10 pb-28 px-4 sm:px-6">
    <ProductHeroBanner
      variant="create"
      :badge="$t('pages.newProductPage.badge')"
      :title="$t('pages.newProductPage.title')"
      :description="$t('pages.newProductPage.description')"
      :secondary-action-label="$t('pages.newProductPage.quickFill')"
      :stats="heroStats"
      @secondary-action="quickFillDemo"
    />

    <div class="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
      <section class="lg:col-span-8 space-y-10">
        <!-- Completion Summary Card -->
        <div class="surface-card p-8 sm:p-10 space-y-8 ring-1 ring-secondary-200/50 shadow-2xl bg-white relative overflow-hidden group/summary">
          <div class="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent pointer-events-none opacity-0 group-hover/summary:opacity-100 transition-opacity duration-1000" />
          
          <div class="relative z-10 flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            <div class="space-y-3">
              <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1">
                {{ $t("pages.productEditor.editSectionEyebrow") }}
              </p>
              <h2 class="text-3xl font-black tracking-tight text-secondary-900 leading-none">
                {{ $t("pages.newProductPage.sectionTitle") }}
              </h2>
              <p class="text-base font-medium leading-relaxed text-secondary-500 max-w-[520px] italic">
                "{{ $t("pages.newProductPage.sectionDescription") }}"
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
              <span class="text-primary-600">{{ Math.round(completionPercent) }}%</span>
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
              <ProductCreateMediaField
                v-model:files="newFiles"
                :image-button-label="imageButtonLabel"
              />
            </template>
          </ProductEditorFields>
        </UForm>

        <FormsSubmitBar
          :hint="saveHint"
          :cta="$t('pages.newProductPage.submitCta') || 'Đăng sản phẩm'"
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
          :empty-title="$t('pages.newProductPage.emptyPreviewTitle') || 'Tên sản phẩm của bạn sẽ hiển thị ở đây'"
          :description="previewDescription"
          :price="previewPrice"
          :stock-label="stockLabel"
          :location="draft.fields.location"
          :image-count="imageCount"
          leading-icon="i-ph-chat-circle-text"
          trailing-icon="i-ph-shopping-cart-simple"
          :status-label="$t('pages.newProductPage.statusReady')"
        />

        <ProductChecklistCard :items="checklistItems" />

        <ProductTipsCard :tips="sellingTips" />
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
    label: t('pages.productEditor.checkTitlePrice') || "Tên và giá bán",
    done: draft.value.fields.title.trim().length > 0 && Number(draft.value.fields.price) > 0,
  },
  {
    label: t('pages.productEditor.checkDescription') || "Mô tả rõ ràng",
    done: draft.value.fields.description.trim().length >= 20,
  },
  {
    label: t('pages.productEditor.checkClassification') || "Phân loại",
    done: Boolean(draft.value.fields.category && draft.value.fields.condition && draft.value.fields.currency),
  },
  {
    label: t('pages.productEditor.checkLocationStock') || "Địa điểm, tồn kho và ảnh",
    done: draft.value.fields.location.trim().length > 0 && Number(draft.value.fields.stock) > 0 && imageCount.value > 0,
  },
])

const sellingTips = computed<string[]>(() => [
  t("pages.newProductPage.tipNameDescription"),
  t("pages.newProductPage.tipPriceDescription"),
  "Uploader local đã sẵn để kiểm tra preview trước khi nối upload thật.",
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
