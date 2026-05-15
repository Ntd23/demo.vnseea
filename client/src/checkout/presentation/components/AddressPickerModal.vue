<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <div class="addr-picker">
        <div class="addr-picker-header">
          <h3 class="addr-picker-title">{{ $t("checkout.shippingForm.selectAddress") }}</h3>
          <button type="button" class="addr-picker-close" @click="isOpen = false">
            <Icon name="i-ph-x" class="h-5 w-5" />
          </button>
        </div>

        <div v-if="loading" class="addr-picker-loading">
          <UProgress animation="carousel" />
          <p class="addr-picker-loading-text">{{ $t("checkout.shippingForm.loadingAddresses") }}</p>
        </div>

        <div v-else-if="addresses.length === 0" class="addr-picker-empty">
          <Icon name="i-ph-map-pin" class="h-8 w-8 addr-picker-empty-icon" />
          <p>{{ $t("checkout.shippingForm.noAddresses") }}</p>
        </div>

        <div v-else class="addr-picker-list">
          <button
            v-for="addr in addresses"
            :key="addr.id || addr.phone"
            type="button"
            class="addr-picker-item"
            @click="selectAddress(addr)"
          >
            <div class="addr-picker-item-name">{{ addr.fullName }}</div>
            <div class="addr-picker-item-phone">{{ addr.phone }}</div>
            <div class="addr-picker-item-detail">
              {{ [addr.streetAddress, addr.city, addr.country].filter(Boolean).join(', ') }}
            </div>
          </button>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { SavedShippingAddress } from "../../domain/types/checkout.types"

const props = defineProps<{
  fetchAddresses: () => Promise<SavedShippingAddress[]>
}>()

const isOpen = defineModel<boolean>("open", { default: false })

const emit = defineEmits<{
  select: [address: SavedShippingAddress]
}>()

const loading = ref(true)
const addresses = ref<SavedShippingAddress[]>([])

const loadAddresses = async () => {
  loading.value = true
  try {
    addresses.value = await props.fetchAddresses()
  }
  catch {
    addresses.value = []
  }
  finally {
    loading.value = false
  }
}

const selectAddress = (addr: SavedShippingAddress) => {
  emit("select", addr)
  isOpen.value = false
}

watch(isOpen, (val) => {
  if (val) {
    loadAddresses()
  }
})
</script>

<style scoped>
.addr-picker {
  padding: 24px;
  min-width: 420px;
}

.addr-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.addr-picker-title {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: #111827;
}

.addr-picker-close {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: background 0.15s;
}

.addr-picker-close:hover {
  background: #f3f4f6;
  color: #111827;
}

.addr-picker-loading {
  padding: 32px 0;
  text-align: center;
}

.addr-picker-loading-text {
  margin-top: 12px;
  font-size: 14px;
  color: #6b7280;
}

.addr-picker-empty {
  text-align: center;
  padding: 40px 0;
  color: #6b7280;
  font-size: 14px;
}

.addr-picker-empty-icon {
  color: #d1d5db;
  margin-bottom: 12px;
}

.addr-picker-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.addr-picker-item {
  text-align: left;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.addr-picker-item:hover {
  border-color: #4361ee;
  box-shadow: 0 0 0 2px rgba(67, 97, 238, 0.1);
}

.addr-picker-item-name {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 2px;
}

.addr-picker-item-phone {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 6px;
}

.addr-picker-item-detail {
  font-size: 13px;
  color: #4b5563;
  line-height: 1.4;
}
</style>
