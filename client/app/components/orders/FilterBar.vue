<template>
  <OrdersFilterBar
    v-model:search="searchModel"
    v-model:active-filter="activeFilterModel"
    :filters="filters"
    :visible-count="visibleCount"
    :active-filter-label="activeFilterLabel"
  />
</template>

<script setup lang="ts">
import OrdersFilterBar from "../../../src/orders/presentation/components/OrdersFilterBar.vue"
import type { BuyerOrderFilter, OrdersFilterOption } from "../../../types/orders"

defineProps<{
  filters: OrdersFilterOption[]
  visibleCount: number
  activeFilterLabel: string
}>()

const searchModel = defineModel<string>("search", { required: true })
const activeFilterModel = defineModel<BuyerOrderFilter>("activeFilter", { required: true })
</script>
