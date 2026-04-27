<template>
  <section class="surface-card group relative overflow-hidden rounded-[2.5rem] shadow-2xl ring-1 ring-secondary-100 transition-all duration-700">
    <!-- Cover Photo -->
    <div class="relative h-[280px] w-full overflow-hidden sm:h-[420px]">
      <img :src="user.cover" class="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Cover" />
      <div class="absolute inset-0 bg-gradient-to-t from-secondary-900/80 via-secondary-900/20 to-transparent" />
      
      <UButton
        class="absolute bottom-6 right-6 h-12 rounded-2xl bg-white/10 px-6 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-xl ring-1 ring-white/20 transition-all hover:bg-white hover:text-black"
        icon="i-ph-camera-duotone"
      >
        {{ $t("pages.profilePage.editCover") }}
      </UButton>
    </div>

    <!-- Content -->
    <div class="relative px-6 pb-12 sm:px-12">
      <div class="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between -mt-20 sm:-mt-32">
        <div class="flex flex-col items-center gap-8 lg:flex-row lg:items-end">
          <!-- Avatar -->
          <div class="relative">
            <div class="h-40 w-40 overflow-hidden rounded-[2.5rem] bg-white p-2 shadow-2xl ring-4 ring-white sm:h-56 sm:w-56">
              <img :src="user.avatar" class="h-full w-full rounded-[2.15rem] object-cover" alt="Avatar" />
            </div>
            <button class="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-xl shadow-primary-500/30 ring-4 ring-white transition-transform hover:scale-110 active:scale-95">
              <Icon name="i-ph-camera-fill" class="h-6 w-6" />
            </button>
          </div>

          <!-- Title -->
          <div class="space-y-3 pb-2 text-center lg:text-left">
            <div class="space-y-1">
              <h1 class="text-4xl font-black tracking-tight text-secondary-900 sm:text-5xl">{{ user.fullName }}</h1>
              <p class="text-lg font-bold text-secondary-400">@{{ user.username }}</p>
            </div>
            <p class="max-w-md text-sm font-medium leading-relaxed text-secondary-500">
              {{ user.bio }}
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-wrap items-center justify-center gap-4 pb-4">
          <UButton
            size="xl"
            icon="i-ph-plus-circle-duotone"
            class="h-14 rounded-2xl bg-primary-600 px-8 text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-primary-500/20 active:scale-95 transition-all"
          >
            {{ $t("pages.profilePage.addToStory") }}
          </UButton>
          <UButton
            size="xl"
            icon="i-ph-pencil-duotone"
            class="h-14 rounded-2xl bg-secondary-100 px-8 text-[11px] font-black uppercase tracking-widest text-secondary-900 transition-all hover:bg-secondary-200 active:scale-95"
          >
            {{ $t("pages.profilePage.editProfile") }}
          </UButton>
          <UButton
            size="xl"
            icon="i-ph-dots-three-outline-fill"
            class="h-14 w-14 rounded-2xl bg-secondary-100 p-0 text-secondary-900 transition-all hover:bg-secondary-200 active:scale-95"
          />
        </div>
      </div>

      <!-- Stats -->
      <div class="mt-12 flex flex-wrap items-center justify-center gap-10 border-t border-secondary-50 pt-10 lg:justify-start">
        <div v-for="(val, key) in user.stats" :key="key" class="flex items-center gap-3">
          <span class="text-2xl font-black tracking-tight text-secondary-900">{{ val }}</span>
          <span class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-400">{{ key }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ProfileUser } from "../../domain/types/profile.types"

defineProps<{
  user: ProfileUser
}>()
</script>


<style scoped>
/** Fixed CSS parsing error by providing explicit style block */
</style>

