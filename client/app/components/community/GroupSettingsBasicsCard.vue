<template>
  <CommunitySettingsSectionCard
    eyebrow="community.settings.basics.eyebrow"
    title="community.settings.basics.title"
    description="community.settings.basics.desc"
    icon="i-ph-identification-card-bold"
  >
    <template #trailing>
      <NuxtLink
        :to="groupPath"
        class="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-4 text-[12px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
      >
        <Icon name="i-ph-arrow-square-out-bold" class="mr-1.5 h-4 w-4" />
        {{ $t('community.settings.basics.viewGroup') }}
      </NuxtLink>
    </template>

    <div class="space-y-5">
      <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.82fr)]">
        <label class="block">
          <span class="text-[15px] font-black text-[#243b63]">{{ $t('community.settings.basics.fields.name') }}</span>
          <input
            v-model="model.name"
            class="mt-3 h-14 w-full rounded-[18px] border border-[#dbe3f2] bg-white px-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0000ff]/35 focus:ring-4 focus:ring-[#0000ff]/8"
            :placeholder="$t('community.settings.basics.fields.namePlaceholder')"
            type="text"
          >
        </label>

        <label class="block">
          <span class="text-[15px] font-black text-[#243b63]">{{ $t('community.settings.basics.fields.url') }}</span>
          <div class="relative mt-3">
            <div class="absolute inset-y-0 left-0 flex items-center pl-4 text-[13px] font-semibold text-slate-500">
              {{ urlPrefix }}
            </div>
            <input
              v-model="model.slug"
              class="h-14 w-full rounded-[18px] border border-[#dbe3f2] bg-white pl-[130px] pr-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0000ff]/35 focus:ring-4 focus:ring-[#0000ff]/8"
              :placeholder="$t('community.settings.basics.fields.urlPlaceholder')"
              type="text"
            >
          </div>

          <div class="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-slate-500">
            <span class="rounded-full bg-[#f8fbff] px-3 py-1.5 font-medium text-[#243b63]">
              {{ $t('community.settings.basics.fields.suggested', { slug: suggestedSlug || "ten-nhom" }) }}
            </span>
            <button
              v-if="suggestedSlug && model.slug.trim() !== suggestedSlug"
              class="rounded-full border border-[#dbe3f2] bg-white px-3 py-1.5 font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
              type="button"
              @click="model.slug = suggestedSlug"
            >
              {{ $t('community.settings.basics.fields.useSuggested') }}
            </button>
          </div>
        </label>
      </div>

      <label class="block">
        <span class="text-[15px] font-black text-[#243b63]">{{ $t('community.settings.basics.fields.desc') }}</span>
        <textarea
          v-model="model.summary"
          class="mt-3 min-h-[160px] w-full rounded-[18px] border border-[#dbe3f2] bg-white px-4 py-3 text-[15px] leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0000ff]/35 focus:ring-4 focus:ring-[#0000ff]/8"
          :placeholder="$t('community.settings.basics.fields.descPlaceholder')"
        />
      </label>

      <div class="grid gap-5 lg:grid-cols-2">
        <label class="block">
          <span class="text-[15px] font-black text-[#243b63]">{{ $t('community.settings.basics.fields.category') }}</span>
          <div class="relative mt-3">
            <select
              v-model="model.category"
              class="h-14 w-full appearance-none rounded-[18px] border border-[#dbe3f2] bg-white px-4 pr-12 text-[15px] text-slate-900 outline-none transition focus:border-[#0000ff]/35 focus:ring-4 focus:ring-[#0000ff]/8"
            >
              <option
                v-for="option in communityCategoryOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ $t(option.label) }}
              </option>
            </select>
            <Icon name="i-ph-caret-down" class="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </div>
        </label>

        <label class="block">
          <span class="text-[15px] font-black text-[#243b63]">{{ $t('community.settings.basics.fields.location') }}</span>
          <input
            v-model="model.locationLabel"
            class="mt-3 h-14 w-full rounded-[18px] border border-[#dbe3f2] bg-white px-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0000ff]/35 focus:ring-4 focus:ring-[#0000ff]/8"
            :placeholder="$t('community.settings.basics.fields.locationPlaceholder')"
            type="text"
          >
        </label>
      </div>

      <div class="grid gap-5 lg:grid-cols-2">
        <label class="block">
          <span class="text-[15px] font-black text-[#243b63]">{{ $t('community.settings.basics.fields.website') }}</span>
          <input
            v-model="model.website"
            class="mt-3 h-14 w-full rounded-[18px] border border-[#dbe3f2] bg-white px-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0000ff]/35 focus:ring-4 focus:ring-[#0000ff]/8"
            :placeholder="$t('community.settings.basics.fields.websitePlaceholder')"
            type="text"
          >
        </label>

        <label class="block">
          <span class="text-[15px] font-black text-[#243b63]">{{ $t('community.settings.basics.fields.tags') }}</span>
          <input
            v-model="model.tags"
            class="mt-3 h-14 w-full rounded-[18px] border border-[#dbe3f2] bg-white px-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0000ff]/35 focus:ring-4 focus:ring-[#0000ff]/8"
            :placeholder="$t('community.settings.basics.fields.tagsPlaceholder')"
            type="text"
          >
        </label>
      </div>

      <label class="block">
        <span class="text-[15px] font-black text-[#243b63]">{{ $t('community.settings.basics.fields.guidelines') }}</span>
        <textarea
          v-model="model.guidelines"
          class="mt-3 min-h-[148px] w-full rounded-[18px] border border-[#dbe3f2] bg-white px-4 py-3 text-[15px] leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0000ff]/35 focus:ring-4 focus:ring-[#0000ff]/8"
          :placeholder="$t('community.settings.basics.fields.guidelinesPlaceholder')"
        />
      </label>

      <div class="grid gap-3 sm:grid-cols-3">
        <div class="rounded-[18px] bg-[#f8fbff] px-4 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">{{ $t('community.settings.basics.stats.descLength') }}</p>
          <p class="mt-1 text-[15px] font-black text-[#243b63]">{{ $t('community.settings.basics.stats.charCount', { count: model.summary.trim().length }) }}</p>
        </div>
        <div class="rounded-[18px] bg-[#f8fbff] px-4 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">{{ $t('community.settings.basics.stats.tagCount') }}</p>
          <p class="mt-1 text-[15px] font-black text-[#243b63]">{{ $t('community.settings.basics.stats.topicCount', { count: tagCount }) }}</p>
        </div>
        <div class="rounded-[18px] bg-[#f8fbff] px-4 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">{{ $t('community.settings.basics.stats.guidelinesCount') }}</p>
          <p class="mt-1 text-[15px] font-black text-[#243b63]">{{ $t('community.settings.basics.stats.itemCount', { count: guidelineCount }) }}</p>
        </div>
      </div>
    </div>
  </CommunitySettingsSectionCard>
</template>

<script setup lang="ts">
import {
  communityCategoryOptions,
  createCommunitySlug,
} from "../../../types/community"
import type { CommunityGroupSettingsDraft } from "../../../types/community"

const model = defineModel<CommunityGroupSettingsDraft>({ required: true })

defineProps<{
  groupPath: string
}>()

const urlPrefix = "vnseea.vn/g/"

const suggestedSlug = computed(() =>
  createCommunitySlug(model.value.name),
)

const tagCount = computed(() =>
  model.value.tags
    .split(",")
    .map(tag => tag.trim())
    .filter(Boolean)
    .length,
)

const guidelineCount = computed(() =>
  model.value.guidelines
    .split("\n")
    .map(rule => rule.trim())
    .filter(Boolean)
    .length,
)
</script>
