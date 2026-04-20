<template>
  <section class="overflow-hidden rounded-[1.4rem] border border-[#dbe3f2] bg-white shadow-[0_12px_28px_rgba(13,38,76,0.05)]">
    <button
      class="flex w-full items-start gap-3 p-4 text-left sm:p-5"
      type="button"
      @click="expanded = !expanded"
    >
      <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(145deg,#1f34ff_0%,#0000ff_100%)] text-[12px] font-black text-white shadow-[0_8px_18px_rgba(0,0,255,0.18)]">
        VN
      </div>
      <div class="min-w-0 flex-1">
        <p class="truncate text-[0.95rem] font-semibold text-[#243b63]">
          {{ t("feed.publisherBox.prompt") }}
        </p>
        <p class="mt-1 text-[0.8rem] text-slate-500">
          {{ expanded ? t("feed.publisherBox.expandedOpen") : t("feed.publisherBox.expandedClosed") }}
        </p>
      </div>
      <div class="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f8ff] text-[#6a7ea5]">
        <Icon :name="expanded ? 'i-ph-caret-up-bold' : 'i-ph-smiley'" class="h-4.5 w-4.5" />
      </div>
    </button>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="expanded" class="border-t border-[#e8eef8] px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          <button v-for="action in actions" :key="action.label" class="publisher-action" type="button">
            <Icon :name="action.icon" class="h-4.5 w-4.5 text-[#6a7ea5]" />
            <span>{{ action.label }}</span>
          </button>
        </div>

        <div class="mt-3 flex flex-wrap items-center gap-2">
          <button v-for="chip in chips" :key="chip.label" class="publisher-chip" type="button">
            <Icon :name="chip.icon" class="h-3.5 w-3.5" />
            <span>{{ chip.label }}</span>
          </button>
          <button class="ml-auto rounded-full bg-[linear-gradient(180deg,#2749ff_0%,#0000ff_100%)] px-5 py-2 text-sm font-bold text-white shadow-[0_8px_18px_rgba(0,0,255,0.18)]" type="button">
            {{ t("feed.publisherBox.share") }}
          </button>
        </div>
      </div>
    </Transition>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()

const expanded = ref(false)

const actions = computed(() => [
  { label: t("feed.publisherBox.actionImage"), icon: "i-ph-image" },
  { label: t("feed.publisherBox.actionVideo"), icon: "i-ph-video-camera" },
  { label: t("feed.publisherBox.actionPoll"), icon: "i-ph-list-checks" },
  { label: t("feed.publisherBox.actionGif"), icon: "i-ph-film-strip" },
  { label: t("feed.publisherBox.actionFeeling"), icon: "i-ph-smiley" },
  { label: t("feed.publisherBox.actionAudio"), icon: "i-ph-music-note" },
  { label: t("feed.publisherBox.actionFile"), icon: "i-ph-file-text" },
  { label: t("feed.publisherBox.actionStory"), icon: "i-ph-sparkle" },
])

const chips = computed(() => [
  { label: t("feed.publisherBox.chipOnlyMe"), icon: "i-ph-lock-key" },
  { label: t("feed.publisherBox.chipAddLocation"), icon: "i-ph-map-pin" },
  { label: t("feed.publisherBox.chipTagFriends"), icon: "i-ph-user-plus" },
  { label: t("feed.publisherBox.chipColors"), icon: "i-ph-palette" },
])
</script>

<style scoped>
.publisher-action {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  border-radius: 9999px;
  border: 1px solid #e3eaf5;
  background: #f8fbff;
  padding: 0.7rem 0.9rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: #364a6b;
  transition: all 0.15s ease;
}

.publisher-action:hover {
  border-color: #cfdcf2;
  background: #eef4ff;
  color: #0000ff;
}

.publisher-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border-radius: 9999px;
  border: 1px solid #e3eaf5;
  background: #fff;
  padding: 0.45rem 0.7rem;
  font-size: 0.76rem;
  font-weight: 700;
  color: #4f607d;
}

.publisher-chip:hover {
  border-color: #cfdcf2;
  color: #0000ff;
}
</style>
