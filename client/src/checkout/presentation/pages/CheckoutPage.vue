<!-- English description: Single-screen marketplace checkout with modal address creation and order confirmation. -->
<template>
  <CheckoutLayout
    :left-label="$t('checkout.page.formRegion')"
    :right-label="$t('checkout.page.summaryRegion')"
  >
    <template #left>
      <section class="address-panel" aria-labelledby="shipping-address-title">
        <div class="address-panel__header">
          <h1 id="shipping-address-title" class="address-panel__title">
            {{ $t("checkout.shippingForm.shippingAddress") }}
          </h1>

          <UButton
            type="button"
            color="primary"
            variant="solid"
            size="sm"
            icon="i-ph-plus-bold"
            class="address-panel__add"
            @click="openAddressModal()"
          >
            {{ $t("checkout.shippingForm.addNewAddress") }}
          </UButton>
        </div>

        <div v-if="isLoadingAddresses" class="address-panel__skeleton" aria-hidden="true">
          <USkeleton class="h-5 w-2/5" />
          <USkeleton class="h-4 w-3/5" />
          <USkeleton class="h-4 w-4/5" />
        </div>

        <div v-else-if="savedAddresses.length" class="address-panel__list">
          <URadioGroup
            v-model="selectedAddressId"
            :legend="$t('checkout.shippingForm.selectAddress')"
            :items="addressOptions"
            value-key="value"
            color="primary"
            variant="card"
            indicator="end"
            size="lg"
            required
            :ui="{
              fieldset: 'gap-3',
              item: 'p-4',
              label: 'font-bold text-[var(--color-secondary-900)]',
              description: 'mt-1 whitespace-normal leading-5 text-[var(--color-secondary-600)]',
            }"
          >
            <template #label="{ item }">
              <span
                class="address-panel__option-text address-panel__option-name"
                @click="selectAddressOption(item.value)"
              >
                {{ item.label }}
              </span>
            </template>
            <template #description="{ item }">
              <span
                class="address-panel__option-text address-panel__option-description"
                @click="selectAddressOption(item.value)"
              >
                {{ item.description }}
              </span>
            </template>
          </URadioGroup>

          <div v-if="savedAddress" class="address-panel__selection-actions">
            <UButton
              type="button"
              color="error"
              variant="soft"
              size="sm"
              icon="i-ph-trash-bold"
              @click="showDeleteAddressModal = true"
            >
              {{ $t("checkout.shippingForm.deleteAddress") }}
            </UButton>
          </div>
        </div>

        <div v-else class="address-panel__empty">
          <Icon name="i-ph-map-pin-line-duotone" class="h-6 w-6" />
          <p>{{ $t("checkout.shippingForm.addAddressHint") }}</p>
        </div>
      </section>
    </template>

    <template #right>
      <div v-if="isLoading" class="summary-skeleton" aria-hidden="true">
        <USkeleton class="h-7 w-1/3" />
        <div class="summary-skeleton__item">
          <USkeleton class="h-24 w-32" />
          <div class="flex-1 space-y-3">
            <USkeleton class="h-5 w-3/4" />
            <USkeleton class="h-4 w-2/5" />
          </div>
        </div>
        <USkeleton class="h-12 w-full" />
      </div>

      <CheckoutSummary
        v-else
        :items="cartItems"
        :shipping-fee="shippingFee"
        :currency="checkoutCurrency"
        :currency-symbol="checkoutCurrencySymbol"
        :currency-rule="checkoutCurrencyRule"
        :address-ready="hasSavedAddress"
        :checkout-state="checkoutState"
        @decrease-quantity="decreaseQuantity"
        @increase-quantity="increaseQuantity"
        @remove-item="removeItem"
        @submit="triggerCheckoutConfirmation"
      />
    </template>
  </CheckoutLayout>

  <UModal v-model:open="showAddressModal" :dismissible="!isSavingAddress">
    <template #content>
      <div class="address-modal">
        <div class="address-modal__header">
          <div>
            <p class="address-modal__eyebrow">{{ $t("checkout.shippingForm.shippingAddress") }}</p>
            <h2 class="address-modal__title">{{ $t("checkout.shippingForm.addNewAddress") }}</h2>
          </div>

          <UButton
            type="button"
            color="neutral"
            variant="ghost"
            icon="i-ph-x-bold"
            :disabled="isSavingAddress"
            :aria-label="$t('checkout.confirmModal.cancel', 'Close')"
            @click="showAddressModal = false"
          />
        </div>

        <ShippingAddressFormUI
          :key="addressModalKey"
          :save-address="saveAndApplyAddress"
          @saved="finishAddressSave"
          @cancel="showAddressModal = false"
        />
      </div>
    </template>
  </UModal>

  <UModal
    v-model:open="showDeleteAddressModal"
    :dismissible="!isDeletingAddress"
    :ui="{
      content: 'w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-lg p-0 ring-1 ring-[var(--color-secondary-200)]',
    }"
  >
    <template #content>
      <div class="p-6 sm:p-7">
        <div class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-600">
          <Icon name="i-ph-trash-duotone" class="h-7 w-7" aria-hidden="true" />
        </div>

        <div class="mt-4 text-center">
          <h2 class="m-0 text-xl font-extrabold text-[var(--color-secondary-900)]">
            {{ $t("checkout.shippingForm.deleteAddress") }}
          </h2>
          <p class="mt-2 text-sm leading-6 text-[var(--color-secondary-600)]">
            {{ $t("checkout.shippingForm.confirmDeleteAddress") }}
          </p>
        </div>

        <div
          v-if="savedAddress"
          class="mt-5 rounded-md border border-[var(--color-secondary-200)] bg-[var(--color-secondary-50)] p-4 text-left"
        >
          <p class="m-0 font-bold text-[var(--color-secondary-900)]">{{ savedAddress.fullName }}</p>
          <p class="mt-1 text-sm leading-5 text-[var(--color-secondary-600)]">{{ savedAddress.phone }}</p>
          <p class="mt-1 text-sm leading-5 text-[var(--color-secondary-600)]">
            {{ formatAddress(savedAddress) }}
          </p>
        </div>

        <div class="mt-6 grid grid-cols-2 gap-3 border-t border-[var(--color-secondary-200)] pt-5">
          <UButton
            type="button"
            color="neutral"
            variant="soft"
            size="lg"
            block
            :disabled="isDeletingAddress"
            @click="showDeleteAddressModal = false"
          >
            {{ $t("checkout.confirmModal.cancel") }}
          </UButton>
          <UButton
            type="button"
            color="error"
            variant="solid"
            size="lg"
            icon="i-ph-trash-bold"
            block
            :loading="isDeletingAddress"
            @click="confirmAddressDeletion"
          >
            {{ $t("checkout.shippingForm.deleteAddress") }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>

  <PaymentConfirmModal
    v-model:open="showConfirmModal"
    :items="cartItems"
    :shipping-fee="shippingFee"
    :currency="checkoutCurrency"
    :currency-symbol="checkoutCurrencySymbol"
    :currency-rule="checkoutCurrencyRule"
    @confirm="confirmPurchase"
  />
</template>

<script setup lang="ts">
import CheckoutLayout from "../components/CheckoutLayout.vue"
import CheckoutSummary from "../components/CheckoutSummary.vue"
import ShippingAddressFormUI from "../components/ShippingAddressFormUI.vue"
import PaymentConfirmModal from "../components/PaymentConfirmModal.vue"
import { useCheckoutPageVM } from "../../application/view-models/useCheckoutPageVM"
import type { SavedShippingAddress } from "../../domain/types/checkout.types"

const showAddressModal = ref(false)
const showDeleteAddressModal = ref(false)
const showConfirmModal = ref(false)
const addressModalKey = ref(0)
const isSavingAddress = ref(false)

const {
  isLoading,
  isLoadingAddresses,
  isDeletingAddress,
  cartItems,
  savedAddress,
  savedAddresses,
  shippingFee,
  checkoutCurrency,
  checkoutCurrencySymbol,
  checkoutCurrencyRule,
  checkoutState,
  handleAddressSubmit,
  deleteSavedAddress,
  selectAddress,
  increaseQuantity,
  decreaseQuantity,
  removeItem,
  handleCheckoutAction,
} = useCheckoutPageVM()

const hasSavedAddress = computed(() => Boolean(
  savedAddress.value?.id
  && savedAddresses.value.some(address => address.id === savedAddress.value?.id),
))

const formatAddress = (address: SavedShippingAddress) => [
  address.streetAddress,
  address.city,
  address.country,
].filter(Boolean).join(", ")

const addressOptions = computed(() => savedAddresses.value.map(address => ({
  label: address.fullName,
  description: `${address.phone} | ${formatAddress(address)}`,
  value: String(address.id),
})))

const selectedAddressId = computed({
  get: () => savedAddress.value?.id ? String(savedAddress.value.id) : "",
  set: (addressId: string) => {
    const address = savedAddresses.value.find(entry => String(entry.id) === String(addressId))
    if (address) {
      selectAddress(address)
    }
  },
})

function openAddressModal() {
  addressModalKey.value += 1
  showAddressModal.value = true
}

function selectAddressOption(addressId: unknown) {
  selectedAddressId.value = String(addressId ?? "")
}

async function saveAndApplyAddress(address: SavedShippingAddress) {
  isSavingAddress.value = true
  try {
    const { id: _discardedId, ...newAddress } = address
    return await handleAddressSubmit(newAddress)
  }
  finally {
    isSavingAddress.value = false
  }
}

function finishAddressSave() {
  showAddressModal.value = false
}

async function confirmAddressDeletion() {
  if (!savedAddress.value?.id) {
    showDeleteAddressModal.value = false
    return
  }

  try {
    await deleteSavedAddress(savedAddress.value.id)
    showDeleteAddressModal.value = false
  }
  catch {
    // The view model displays the delete error toast.
  }
}

function triggerCheckoutConfirmation() {
  if (!hasSavedAddress.value) {
    void handleCheckoutAction()
    openAddressModal()
    return
  }

  showConfirmModal.value = true
}

async function confirmPurchase() {
  showConfirmModal.value = false
  await handleCheckoutAction()
}
</script>

<style scoped>
.address-panel,
.summary-skeleton {
  border: 1px solid #dfe6f3;
  border-radius: 8px;
  background: var(--bg-surface);
  box-shadow: 0 4px 14px rgb(31 51 92 / 7%);
}

.address-panel {
  padding: 18px;
}

.address-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.address-panel__title {
  margin: 0;
  font-size: 19px;
  font-weight: 800;
  color: var(--color-secondary-900);
}

.address-panel__add {
  flex-shrink: 0;
  justify-content: center;
  font-weight: 700;
}

.address-panel__skeleton,
.summary-skeleton {
  display: grid;
  gap: 14px;
  padding: 20px;
}

.address-panel__list,
.address-panel__empty {
  border: 1px solid var(--color-secondary-200);
  border-radius: 8px;
  background: var(--color-secondary-50);
}

.address-panel__list {
  padding: 16px;
}

.address-panel__selection-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--color-secondary-200);
}

.address-panel__option-text {
  display: block;
  width: 100%;
  cursor: pointer;
}

.address-panel__option-name {
  font-weight: 800;
}

.address-panel__option-description {
  color: var(--color-secondary-600);
  line-height: 1.5;
}

.address-panel__empty {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 64px;
  padding: 14px;
  color: var(--color-secondary-600);
}

.address-panel__empty p {
  margin: 0;
}

.summary-skeleton__item {
  display: flex;
  gap: 16px;
  padding: 20px 0;
}

.address-modal {
  width: min(560px, 100%);
  max-height: 88dvh;
  overflow-y: auto;
  padding: 20px;
}

.address-modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.address-modal__eyebrow {
  margin: 0 0 4px;
  color: var(--color-primary-600, #1b08ff);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

.address-modal__title {
  margin: 0;
  color: var(--color-secondary-900);
  font-size: 22px;
  font-weight: 800;
}

@media (max-width: 520px) {
  .address-panel__header {
    align-items: stretch;
    flex-direction: column;
  }

  .address-modal {
    padding: 16px;
  }
}
</style>
