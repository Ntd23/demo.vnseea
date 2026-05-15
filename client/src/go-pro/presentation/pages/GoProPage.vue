<!-- English description: Backend-backed Go Pro comparison page styled after the WoWonder pro package table. -->
<template>
  <main class="go-pro-page mx-auto w-full max-w-6xl px-3 py-4 sm:px-5">
    <section class="go-pro-hero">
      <div class="go-pro-hero__copy">
        <h1>
          VNSEEA
          <span>PRO</span>
        </h1>
        <p>{{ heroDescription }}</p>
      </div>
      <img class="go-pro-hero__rocket" src="/themes/wowonder/img/go-pro/rocket.svg" alt="" aria-hidden="true">
    </section>

    <section v-if="pending" class="go-pro-panel">
      <USkeleton class="h-[520px] rounded-[18px]" />
    </section>

    <UAlert v-else-if="error" color="error" variant="soft" :title="String(error.message || error)" />

    <section v-else-if="packages.length" class="go-pro-panel">
      <p v-if="membershipSystem" class="go-pro-warning">
        {{ membershipNotice }}
      </p>

      <h2 class="go-pro-pick">{{ pickPlanLabel }}</h2>

      <div class="go-pro-table-wrap">
        <table class="go-pro-table">
          <thead>
            <tr>
              <td class="go-pro-label-col"></td>
              <th
                v-for="plan in packages"
                :key="plan.id"
                :class="{ 'is-current': plan.isCurrent }"
              >
                <span class="go-pro-plan-icon" :style="{ color: plan.color || fallbackPlanColor(plan.id) }">
                  <img v-if="plan.image" :src="plan.image" :alt="plan.name">
                  <Icon v-else :name="planIcon(plan.id)" />
                </span>
                <strong>{{ plan.name }}</strong>
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>{{ priceLabel }}</td>
              <td
                v-for="plan in packages"
                :key="`${plan.id}-price`"
                class="text-center"
                :class="{ 'is-current': plan.isCurrent }"
              >
                <strong>{{ formatMoney(plan.price, plan.currency, plan.currencySymbol) }}</strong>
              </td>
            </tr>

            <tr v-for="row in featureRows" :key="row.key">
              <td>{{ row.label }}</td>
              <td
                v-for="plan in packages"
                :key="`${plan.id}-${row.key}`"
                class="text-center"
                :class="{ 'is-current': plan.isCurrent }"
              >
                <span v-if="isBooleanFeature(plan.features[row.key])" class="go-pro-feature-icon">
                  <Icon
                    v-if="plan.features[row.key]"
                    name="i-ph-check-bold"
                    class="go-pro-check"
                  />
                  <Icon
                    v-else
                    name="i-ph-x-bold"
                    class="go-pro-cross"
                  />
                </span>
                <span v-else>{{ formatFeature(row.key, plan.features[row.key]) }}</span>
              </td>
            </tr>

            <tr>
              <td>{{ moreInfoLabel }}</td>
              <td
                v-for="plan in packages"
                :key="`${plan.id}-info`"
                class="text-center"
                :class="{ 'is-current': plan.isCurrent }"
              >
                {{ plan.name }}
              </td>
            </tr>

            <tr>
              <td></td>
              <td
                v-for="plan in packages"
                :key="`${plan.id}-action`"
                class="text-center"
                :class="{ 'is-current': plan.isCurrent }"
              >
                <UButton
                  class="go-pro-upgrade"
                  :style="{ backgroundColor: plan.color || fallbackPlanColor(plan.id) }"
                  :disabled="plan.isCurrent"
                  :loading="upgradingType === plan.id"
                  @click="upgrade(plan.id)"
                >
                  {{ plan.isCurrent ? currentLabel : upgradeLabel }}
                </UButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <section class="go-pro-features">
        <h2>{{ whyChooseLabel }}</h2>
        <div class="go-pro-feature-grid">
          <article v-for="feature in featuredBenefits" :key="feature.label" class="go-pro-feature-card">
            <img :src="feature.image" :alt="feature.label">
            <p>{{ feature.label }}</p>
          </article>
        </div>
      </section>
    </section>

    <UCard v-else class="surface-card text-center" :ui="{ body: 'p-8' }">
      <Icon name="i-ph-rocket-launch-duotone" class="mx-auto h-10 w-10 text-[var(--text-tertiary)]" />
      <h2 class="text-heading mt-3">{{ t("pages.goProPage.emptyPaymentsTitle") }}</h2>
      <p class="text-body-secondary mt-2">{{ t("pages.goProPage.emptyPaymentsDescription") }}</p>
    </UCard>
  </main>
</template>

<script setup lang="ts">
import { formatCurrency } from "../../../shared-kernel/application/utils/formatCurrency"
import { useGoProPageVM } from "../../application/view-models/useGoProPageVM"

const { t, locale } = useI18n()
const {
  packages,
  pending,
  error,
  membershipSystem,
  upgradingType,
  upgrade,
} = useGoProPageVM()

const heroDescription = "Kiểm soát hồ sơ, mở khóa nhiều quyền lợi hơn và nâng cấp tài khoản của bạn."
const membershipNotice = "Bạn cần nâng cấp thành viên để tiếp tục sử dụng đầy đủ các tính năng trên hệ thống."
const pickPlanLabel = "Chọn gói của bạn"
const priceLabel = "Giá"
const moreInfoLabel = "Thêm thông tin"
const whyChooseLabel = "Tại sao chọn Pro?"
const currentLabel = t("pages.goProPage.currentPlanLabel")
const upgradeLabel = "Nâng cấp ngay"

const baseFeatureRows = [
  { key: "featured_member", label: "Thành viên nổi bật" },
  { key: "profile_visitors", label: "Xem khách truy cập hồ sơ" },
  { key: "last_seen", label: "Ẩn/hiện lần online cuối" },
  { key: "verified_badge", label: "Huy hiệu xác minh" },
  { key: "posts_promotion", label: "Quảng bá bài viết" },
  { key: "pages_promotion", label: "Quảng bá trang" },
  { key: "discount", label: "Giảm giá" },
  { key: "max_upload", label: "Dung lượng tải lên tối đa" },
]

const featuredBenefits = [
  {
    label: "Thành viên nổi bật",
    image: "/themes/wowonder/img/go-pro/superhero.svg",
  },
  {
    label: "Ẩn/hiện lần online cuối",
    image: "/themes/wowonder/img/go-pro/lastseen.svg",
  },
  {
    label: "Quảng bá bài viết",
    image: "/themes/wowonder/img/go-pro/post.svg",
  },
  {
    label: "Huy hiệu xác minh",
    image: "/themes/wowonder/img/go-pro/verify.svg",
  },
]

const featureRows = computed(() => {
  const knownKeys = new Set(baseFeatureRows.map(row => row.key))
  const extraRows = packages.value
    .flatMap(plan => Object.keys(plan.features))
    .filter(key => !knownKeys.has(key))
    .filter((key, index, keys) => keys.indexOf(key) === index)
    .map(key => ({ key, label: normalizeFeature(key) }))

  return [...baseFeatureRows, ...extraRows]
})

const formatMoney = (amount: number, currency: string, currencySymbol: string) =>
  formatCurrency(amount, {
    currency,
    currencySymbol,
    locale: locale.value,
  })

const normalizeFeature = (key: string) =>
  key.replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase())

const isBooleanFeature = (value: unknown) =>
  typeof value === "boolean"

const formatFeature = (key: string, value: boolean | string | number | undefined) => {
  if (value === true) return t("pages.goProPage.featureIncluded")
  if (value === false || value === undefined || value === "") return t("pages.goProPage.featureNotIncluded")

  const numericValue = Number(value)
  if (key === "posts_promotion" && Number.isFinite(numericValue) && numericValue > 0) {
    return `${numericValue} bài viết`
  }
  if (key === "pages_promotion" && Number.isFinite(numericValue) && numericValue > 0) {
    return `${numericValue} trang`
  }
  if (key === "discount" && Number.isFinite(numericValue) && numericValue > 0) {
    return `${numericValue}%`
  }
  if (key === "max_upload" && Number.isFinite(numericValue) && numericValue > 0) {
    return formatUploadLimit(numericValue)
  }

  return String(value)
}

const formatUploadLimit = (bytes: number) => {
  if (bytes >= 1_000_000_000_000) return "Không giới hạn"
  if (bytes >= 1_000_000_000) return `${Math.round(bytes / 1_000_000_000)} GB`
  if (bytes >= 1_000_000) return `${Math.round(bytes / 1_000_000)} MB`
  return `${bytes} B`
}

const fallbackPlanColor = (id: string) => {
  const colors: Record<string, string> = {
    "1": "#4c7737",
    "2": "#ff9800",
    "3": "#e13c4c",
    "4": "#3f4bb8",
  }

  return colors[id] || "#0000ff"
}

const planIcon = (id: string) => {
  const icons: Record<string, string> = {
    "1": "i-ph-star-fill",
    "2": "i-ph-fire-fill",
    "3": "i-ph-lightning-fill",
    "4": "i-ph-rocket-launch-fill",
  }

  return icons[id] || "i-ph-crown-simple-fill"
}
</script>

<style scoped>
.go-pro-page {
  color: var(--text-primary);
}

.go-pro-hero {
  position: relative;
  min-height: 250px;
  overflow: hidden;
  border-radius: 0 0 18px 18px;
  background: linear-gradient(-45deg, #cf861b 0%, #eaa530 100%);
  color: #fff;
  box-shadow: var(--shadow-card);
}

.go-pro-hero__copy {
  position: relative;
  z-index: 1;
  max-width: 760px;
  margin: 0 auto;
  padding: 58px 22px 72px;
  text-align: center;
}

.go-pro-hero h1 {
  margin: 0 0 12px;
  font-size: clamp(34px, 5vw, 54px);
  font-weight: 900;
  line-height: 1;
}

.go-pro-hero h1 span {
  display: inline-block;
  margin-left: 8px;
  transform: translateY(-14px);
  border-radius: 4px;
  background: #fff;
  padding: 2px 6px;
  color: #ea4c89;
  font-size: 15px;
  line-height: 1;
  vertical-align: super;
}

.go-pro-hero p {
  margin: 0;
  font-size: clamp(18px, 2vw, 23px);
  font-weight: 700;
}

.go-pro-hero__rocket {
  position: absolute;
  right: 26px;
  bottom: 14px;
  width: 200px;
  height: 200px;
  object-fit: contain;
  opacity: .8;
}

.go-pro-panel {
  position: relative;
  z-index: 2;
  margin-top: -46px;
  border-radius: 18px;
  background: var(--bg-surface);
  padding: 24px;
  box-shadow: var(--shadow-card);
}

.go-pro-warning {
  margin: 0 0 20px;
  border-radius: 10px;
  background: #fff3cd;
  padding: 14px 16px;
  color: #856404;
  font-weight: 700;
}

.go-pro-pick,
.go-pro-features h2 {
  margin: 0 0 24px;
  text-align: center;
  font-size: 25px;
  font-weight: 900;
}

.go-pro-table-wrap {
  width: 100%;
  overflow-x: auto;
}

.go-pro-table {
  width: 100%;
  min-width: 820px;
  border-collapse: separate;
  border-spacing: 0;
  font-weight: 700;
}

.go-pro-table th,
.go-pro-table td {
  min-width: 145px;
}

.go-pro-table thead th {
  padding: 24px 8px 12px;
  text-align: center;
  font-size: 17px;
}

.go-pro-table thead th.is-current {
  border-radius: 10px 10px 0 0;
  background: #4d4d4d;
  color: #fff;
}

.go-pro-label-col {
  min-width: 225px;
}

.go-pro-plan-icon {
  position: relative;
  display: grid;
  width: 34px;
  height: 34px;
  margin: 0 auto 18px;
  place-items: center;
}

.go-pro-plan-icon::before {
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 999px;
  background: currentColor;
  content: "";
  opacity: .15;
}

.go-pro-plan-icon :deep(svg),
.go-pro-plan-icon img {
  position: relative;
  width: 32px;
  height: 32px;
}

.go-pro-plan-icon img {
  object-fit: contain;
}

.go-pro-table tbody td {
  border-bottom: 1px solid var(--border-light);
  padding: 17px 15px;
  color: var(--text-secondary);
  font-weight: 700;
}

.go-pro-table tbody tr td:first-child {
  color: #494949;
  font-weight: 900;
}

.go-pro-table tbody td.is-current {
  border-color: rgb(255 255 255 / 8%);
  background: #4d4d4d;
  color: #fff;
}

.go-pro-table tbody tr:last-child td {
  border-bottom: 0;
}

.go-pro-table tbody tr:last-child td.is-current {
  border-radius: 0 0 10px 10px;
}

.go-pro-feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.go-pro-check,
.go-pro-cross {
  width: 24px;
  height: 24px;
}

.go-pro-check {
  color: #4caf50;
}

.go-pro-cross {
  color: #bababa;
}

.go-pro-upgrade {
  min-width: 126px;
  justify-content: center;
  border-radius: 999px;
  color: #fff;
  font-weight: 900;
}

.go-pro-features {
  padding-top: 30px;
}

.go-pro-feature-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.go-pro-feature-card {
  min-height: 170px;
  border-radius: 16px;
  background: #f7f7f7;
  padding: 22px 16px;
  text-align: center;
}

.go-pro-feature-card img {
  width: 92px;
  height: 92px;
  margin: 0 auto 16px;
  object-fit: contain;
}

.go-pro-feature-card p {
  margin: 0;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 900;
}

@media (max-width: 768px) {
  .go-pro-page {
    padding-inline: 0;
  }

  .go-pro-hero {
    border-radius: 0;
  }

  .go-pro-hero__rocket {
    right: -36px;
    width: 150px;
    height: 150px;
  }

  .go-pro-panel {
    border-radius: 14px;
    padding: 16px;
  }

  .go-pro-feature-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
