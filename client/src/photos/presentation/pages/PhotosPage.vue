<template>
  <div class="mx-auto max-w-[1280px] space-y-5 pb-10 sm:space-y-6">
    <PhotosHero
      :eyebrow="t('pages.photosPage.heroEyebrow')"
      :title="t('pages.photosPage.heroTitle')"
      :description="t('pages.photosPage.heroDescription')"
      :photo="heroPhoto"
      :stats="heroStats"
      :primary-label="t('pages.photosPage.heroPrimaryAction')"
      :secondary-label="t('pages.photosPage.heroSecondaryAction')"
      @open="openPhoto(heroPhoto.id)"
    />

    <PhotosFilters
      v-model:search="search"
      v-model:selected-category="selectedCategory"
      :categories="categories"
      :placeholder="t('pages.photosPage.searchPlaceholder')"
    />

    <div class="grid gap-5 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
      <section class="min-w-0 space-y-4 sm:space-y-5">
        <div class="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 sm:pb-1">
          <NuxtLink
            v-for="album in albums"
            :key="album.title"
            :to="album.to"
            class="group min-w-[240px] shrink-0 overflow-hidden rounded-[24px] border border-[#dbe3f2] bg-white shadow-[0_14px_32px_rgba(15,35,110,0.06)] transition hover:-translate-y-1 sm:min-w-[280px]"
          >
            <div class="relative h-36 overflow-hidden">
              <img :alt="album.title" :src="album.cover" class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]">
              <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,23,42,0.78))]" />
              <div class="absolute left-4 top-4 inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white" :style="{ background: album.accent }">
                {{ album.badge }}
              </div>
              <div class="absolute right-4 top-4 rounded-full bg-white/88 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#243b63]">
                {{ t("pages.photosPage.albumCount", { count: album.count }) }}
              </div>
            </div>

            <div class="p-4">
              <h2 class="text-[1.05rem] font-black text-[#243b63]">{{ album.title }}</h2>
              <p class="mt-2 text-[13px] font-semibold leading-6 text-slate-500">{{ album.description }}</p>
              <div class="mt-4 inline-flex items-center gap-2 text-[12px] font-black text-[#0000ff]">
                {{ t("pages.photosPage.openLink") }}
                <Icon name="i-ph-arrow-up-right-bold" class="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </NuxtLink>
        </div>

        <section class="rounded-[30px] border border-[#dbe3f2] bg-white px-4 py-4 shadow-[0_14px_32px_rgba(15,35,110,0.06)] sm:px-5 sm:py-5">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-[11px] font-black uppercase tracking-[0.18em] text-[#0000ff]/60">
                {{ t("pages.photosPage.resultEyebrow") }}
              </p>
              <h2 class="mt-2 text-[1.45rem] font-black tracking-[-0.04em] text-[#243b63]">
                {{ resultHeading }}
              </h2>
              <p class="mt-2 text-[14px] leading-6 text-slate-500">
                {{ t("pages.photosPage.resultCount", { count: filteredPhotos.length }) }}
              </p>
            </div>

            <button
              class="inline-flex h-11 w-full items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-4 text-[13px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff] sm:w-auto"
              type="button"
              @click="resetFilters"
            >
              <Icon name="i-ph-arrow-counter-clockwise-bold" class="mr-2 h-4 w-4" />
              {{ t("pages.photosPage.resetFilters") }}
            </button>
          </div>
        </section>

        <section
          v-if="filteredPhotos.length === 0"
          class="rounded-[30px] border border-[#dbe3f2] bg-white px-5 py-12 shadow-[0_14px_34px_rgba(15,35,110,0.06)] sm:px-8 sm:py-16"
        >
          <div class="mx-auto max-w-2xl text-center">
            <FoundationEmptyState
              icon="i-ph-images-square"
              :title="t('pages.photosPage.emptyTitle')"
              :description="t('pages.photosPage.emptyDescription')"
            />
          </div>
        </section>

        <div v-else class="columns-1 gap-4 sm:columns-2 xl:columns-3">
          <div
            v-for="photo in filteredPhotos"
            :key="photo.id"
            class="mb-4 break-inside-avoid"
          >
            <PhotosCard
              :photo="photo"
              :photographer-label="t('pages.photosPage.photographerLabel')"
              :open-label="t('pages.photosPage.cardPrimaryAction')"
              :detail-label="t('pages.photosPage.cardSecondaryAction')"
              @open="openPhoto"
            />
          </div>
        </div>
      </section>

      <PhotosSidebar
        :hashtags="topTags"
        :hashtags-eyebrow="t('pages.photosPage.sidebarHashtagsEyebrow')"
        :hashtags-title="t('pages.photosPage.sidebarHashtagsTitle')"
        :creators="topCreators"
        :creators-eyebrow="t('pages.photosPage.sidebarCreatorsEyebrow')"
        :creators-title="t('pages.photosPage.sidebarCreatorsTitle')"
        :quick-links="quickLinks"
        :links-eyebrow="t('pages.photosPage.sidebarLinksEyebrow')"
        :links-title="t('pages.photosPage.sidebarLinksTitle')"
      />
    </div>

    <LightboxModal
      :open="lightboxOpen"
      :items="lightboxItems"
      :current-index="currentLightboxIndex"
      :title="currentPhoto.title"
      :description="currentPhoto.location"
      :author="currentPhoto.photographer"
      :caption="currentPhoto.albumTitle"
      @close="lightboxOpen = false"
      @change="currentPhotoId = filteredPhotos[$event]?.id ?? filteredPhotos[0]?.id ?? currentPhotoId"
      @share="navigateTo(currentPhoto.companionTo)"
      @download="noop"
      @like="noop"
      @comment="navigateTo(currentPhoto.companionTo)"
    />
  </div>
</template>

<script setup lang="ts">
import { usePhotosPage } from "../../application/composables/usePhotosPage"
import LightboxModal from "../../../lightbox/presentation/components/LightboxModal.vue"
import PhotosCard from "../components/Card.vue"
import PhotosFilters from "../components/Filters.vue"
import PhotosHero from "../components/Hero.vue"
import PhotosSidebar from "../components/Sidebar.vue"

const { t } = useI18n()

const {
  albums,
  categories,
  currentLightboxIndex,
  currentPhoto,
  currentPhotoId,
  filteredPhotos,
  heroPhoto,
  heroStats,
  lightboxItems,
  lightboxOpen,
  quickLinks,
  resultHeading,
  search,
  selectedCategory,
  topCreators,
  topTags,
  noop,
  openPhoto,
  resetFilters,
} = usePhotosPage()
</script>

<style scoped>
.scrollbar-hide {
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
