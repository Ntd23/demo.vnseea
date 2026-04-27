<template>
  <div class="space-y-5 pb-10">
    <CheckoutLayout
      :eyebrow="$t('orders.page.eyebrow')"
      :title="$t('orders.page.layoutTitle')"
      :description="$t('orders.page.layoutDescription')"
    >
      <template #left>
        <div class="space-y-5">
          <OrdersFilterBar
            v-model:search="search"
            v-model:active-filter="activeFilter"
            :filters="filters"
            :visible-count="visibleOrders.length"
            :active-filter-label="activeFilterLabel"
          />

          <div
            v-if="visibleOrders.length > 0"
            class="space-y-4"
          >
            <OrdersBuyerOrderCard
              v-for="order in visibleOrders"
              :key="order.id"
              :order="order"
            />
          </div>

          <FoundationEmptyState
            v-else
            icon="i-ph-package-fill"
            :title="$t('orders.empty.noMatchedTitle')"
            :description="$t('orders.empty.noMatchedDesc')"
          />
        </div>
      </template>

      <template #right>
        <OrdersOverviewSidebar
          :cards="overviewCards"
          :next-order="nextDeliveryOrder"
          :active-filter-label="activeFilterLabel"
          :visible-count="visibleOrders.length"
        />
      </template>
    </CheckoutLayout>
  </div>
</template>

<script setup lang="ts">
import { useOrderList } from "../../application/composables/useOrderList"
import CheckoutLayout from "../../../checkout/presentation/components/CheckoutLayout.vue"
import OrdersFilterBar from "../components/OrdersFilterBar.vue"
import OrdersBuyerOrderCard from "../components/OrdersBuyerOrderCard.vue"
import OrdersOverviewSidebar from "../components/OrdersOverviewSidebar.vue"

const { t } = useI18n()

useSeoMeta({
  title: t("orders.page.title"),
  description: t("orders.page.description"),
})

const {
  search,
  activeFilter,
  filters,
  activeFilterLabel,
  visibleOrders,
  overviewCards,
  nextDeliveryOrder,
} = useOrderList()
</script>
