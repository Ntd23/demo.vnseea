<!-- English description: Renders the backend-backed offer directory using the offer bounded context. -->
<template>
  <main class="offers-page">
    <section class="offers-page__hero">
      <div>
        <p class="offers-page__eyebrow">{{ t("offers.heroEyebrow") }}</p>
        <h1>{{ t("offers.title") }}</h1>
      </div>
    </section>

    <UAlert
      v-if="error"
      color="warning"
      variant="soft"
      icon="i-ph-warning-circle-fill"
      :title="t('offers.errors.load')"
      :description="String(error.message || error)"
      class="rounded-[18px]"
    />

    <section v-else class="offers-page__content">
      <div v-if="pending" class="offers-page__stack">
        <USkeleton v-for="item in 4" :key="item" class="h-38.5 rounded-[20px]" />
      </div>

      <div v-else-if="offers.length" class="offers-page__stack">
        <OfferCard
          v-for="offer in offers"
          :key="offer.id"
          :offer="offer"
          :deleting="deletingId === offer.id"
          @edit="openEditOffer"
          @delete="deleteOffer"
        />

        <UAlert
          v-if="loadMoreError"
          color="warning"
          variant="soft"
          icon="i-ph-warning-circle-fill"
          :title="t('offers.errors.loadMore')"
          :description="loadMoreError"
          class="rounded-[18px]"
        />

        <div v-if="hasMore" class="offers-page__load-more">
          <UButton
            color="neutral"
            variant="soft"
            icon="i-ph-caret-down-bold"
            class="rounded-full"
            :loading="loadingMore"
            @click="loadMore"
          >
            {{ t("offers.loadMore") }}
          </UButton>
        </div>
      </div>

      <div v-else class="offers-page__empty">
        <Icon name="i-ph-tag-chevron-duotone" class="offers-page__empty-icon" />
        <h2>{{ t("offers.emptyTitle") }}</h2>
        <p>{{ t("offers.emptyDescription") }}</p>
      </div>
    </section>

    <OfferFormModal
      v-if="editingOffer"
      v-model:open="offerModalOpen"
      :mode="'edit'"
      :page-id="editingOffer.pageId"
      :offer="editingOffer"
      @saved="handleOfferSaved"
    />
  </main>
</template>

<script setup lang="ts">
import OfferCard from "../components/OfferCard.vue"
import OfferFormModal from "../components/OfferFormModal.vue"
import { useOfferListVM } from "../../application/view-models/useOfferListVM"
import type { Offer } from "../../domain/types/offer.types"

const { t } = useI18n()
const editingOffer = ref<Offer | null>(null)
const offerModalOpen = ref(false)
const {
  offers,
  pending,
  error,
  hasMore,
  loadingMore,
  loadMoreError,
  deletingId,
  loadMore,
  deleteOffer,
  refresh,
} = useOfferListVM({ limit: 10 })

function openEditOffer(offer: Offer) {
  editingOffer.value = offer
  offerModalOpen.value = true
}

async function handleOfferSaved() {
  await refresh()
}
</script>

<style scoped>
.offers-page {
  display: flex;
  width: min(100%, 960px);
  flex-direction: column;
  gap: 18px;
  margin: 0 auto;
  /* padding: 18px 12px 40px; */
}

.offers-page__hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  background: #ffffff;
  padding: 22px;
  box-shadow: 0 12px 32px rgba(15, 35, 110, 0.08);
}

.offers-page__eyebrow {
  margin: 0 0 6px;
  color: #0000ff;
  font-size: 12px;
  font-weight: 800;
}

.offers-page__hero h1 {
  margin: 0;
  color: #020617;
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 800;
  line-height: 1.05;
}

.offers-page__hero p:last-child {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 15px;
}

.offers-page__hero-icon {
  width: 54px;
  height: 54px;
  flex: 0 0 54px;
  color: #0000ff;
}

.offers-page__stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.offers-page__load-more {
  display: flex;
  justify-content: center;
  padding: 10px 0;
}

.offers-page__empty {
  border: 1px dashed #cbd5e1;
  border-radius: 22px;
  background: #ffffff;
  padding: 32px 18px;
  text-align: center;
}

.offers-page__empty-icon {
  width: 44px;
  height: 44px;
  color: #0000ff;
}

.offers-page__empty h2 {
  margin: 10px 0 6px;
  color: #020617;
  font-size: 20px;
  font-weight: 800;
}

.offers-page__empty p {
  margin: 0;
  color: #64748b;
}
</style>
