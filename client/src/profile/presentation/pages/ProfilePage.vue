<template>
  <div class="space-y-6 pb-20 pt-4 px-4 sm:px-6 max-w-[1440px] mx-auto">
    <ProfileHero :user="user" />

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
      <section class="space-y-6 min-w-0">
        <!-- Profile Completion (Simplified for now) -->
        <div class="surface-card p-6 sm:p-10 shadow-xl ring-1 ring-secondary-100">
           <h3 class="text-xl font-black text-secondary-900 border-b border-secondary-50 pb-6 mb-6">
             {{ $t("pages.profilePage.completionTitle") }}
           </h3>
           <div class="space-y-4">
             <div v-for="item in checklist" :key="item" class="flex items-center gap-4 group cursor-pointer">
               <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary-50 text-secondary-300 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                 <Icon name="i-ph-check-bold" class="h-4 w-4" />
               </div>
               <span class="text-sm font-black text-secondary-500 group-hover:text-secondary-900 transition-colors">{{ item }}</span>
             </div>
           </div>
        </div>

        <slot name="feed" />
      </section>

      <aside class="space-y-6 sticky top-24">
        <!-- Friends Card -->
        <div class="surface-card p-6 sm:p-8 shadow-xl ring-1 ring-secondary-100">
          <div class="flex items-center justify-between border-b border-secondary-50 pb-6 mb-6">
            <h3 class="text-[11px] font-black uppercase tracking-[0.2em] text-secondary-900">
              {{ $t("pages.profilePage.mutualFriends") }}
            </h3>
            <NuxtLink to="#" class="text-[10px] font-black uppercase tracking-widest text-primary-600 hover:text-primary-700">
              {{ $t("pages.profilePage.viewAll") }}
            </NuxtLink>
          </div>
          <div class="space-y-5">
            <div v-for="friend in mutualFriends" :key="friend.name" class="flex items-center gap-4 group cursor-pointer">
              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 font-black text-xs group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm">
                {{ friend.initials }}
              </div>
              <div class="min-w-0">
                <p class="text-sm font-black text-secondary-900 group-hover:text-primary-600 transition-colors">{{ friend.name }}</p>
                <p class="text-[10px] font-bold text-secondary-400">{{ friend.meta }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Photos Card -->
        <div class="surface-card p-6 sm:p-8 shadow-xl ring-1 ring-secondary-100">
          <h3 class="text-[11px] font-black uppercase tracking-[0.2em] text-secondary-900 border-b border-secondary-50 pb-6 mb-6">
            {{ $t("pages.profilePage.photos") }}
          </h3>
          <div class="grid grid-cols-2 gap-3">
            <div v-for="photo in highlightPhotos" :key="photo" class="aspect-square rounded-2xl bg-secondary-50 border border-secondary-100 overflow-hidden group cursor-pointer">
              <img :src="`https://picsum.photos/seed/${photo + 10}/200/200`" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProfile } from "../../application/composables/use-profile"
import ProfileHero from "../components/ProfileHero.vue"

const { t } = useI18n()
const { user, mutualFriends, highlightPhotos } = useProfile()

const checklist = computed(() => [
  t("pages.profilePage.checklistAvatar"),
  t("pages.profilePage.checklistCover"),
  t("pages.profilePage.checklistIntro"),
  t("pages.profilePage.checklistPosts"),
])

useSeoMeta({
  title: () => t("pages.profilePage.seoTitle"),
})
</script>
