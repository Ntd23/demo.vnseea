<!-- Description: Provides group avatar and cover upload previews for the group settings media tab. -->
<template>
  <CommunitySettingsSectionCard
    eyebrow=""
    title="Hình đại diện & Ảnh bìa"
    icon="i-ph-wrench-bold"
    :translate-text="false"
  >
    <template #trailing>
      <slot name="trailing" />
    </template>

    <div class="group-media">
      <div class="group-media__cover" :style="coverStyle">
        <button type="button" class="group-media__cover-action" aria-label="Đổi ảnh bìa" @click="coverInput?.click()">
          <Icon name="i-ph-image-duotone" class="h-7 w-7" />
        </button>
        <input
          ref="coverInput"
          type="file"
          accept="image/*"
          class="group-media__input"
          @change="event => handleFileChange(event, 'banner')"
        >
      </div>

      <div class="group-media__avatar-wrap">
        <div class="group-media__avatar" :style="avatarStyle">
          <img
            v-if="avatarUrl"
            :src="avatarUrl"
            alt=""
            class="group-media__avatar-img"
          >
          <Icon v-else name="i-ph-users-three-duotone" class="h-12 w-12 text-slate-400" />
        </div>

        <button type="button" class="group-media__avatar-action" aria-label="Đổi hình đại diện" @click="avatarInput?.click()">
          <Icon name="i-ph-camera-fill" class="h-6 w-6" />
        </button>
        <input
          ref="avatarInput"
          type="file"
          accept="image/*"
          class="group-media__input"
          @change="event => handleFileChange(event, 'avatar')"
        >
      </div>
    </div>
  </CommunitySettingsSectionCard>
</template>

<script setup lang="ts">
import CommunitySettingsSectionCard from "./SettingsSectionCard.vue"
import type {
  CommunityGroupRecord,
  CommunityGroupSettingsDraft,
} from "../../domain/types/community.types"

const props = defineProps<{
  previewGroup: CommunityGroupRecord | null
}>()

const model = defineModel<CommunityGroupSettingsDraft>({ required: true })

const coverInput = ref<HTMLInputElement | null>(null)
const avatarInput = ref<HTMLInputElement | null>(null)

const coverUrl = computed(() =>
  model.value.bannerUrl || props.previewGroup?.bannerUrl || props.previewGroup?.banner || "",
)

const avatarUrl = computed(() =>
  model.value.avatarUrl || props.previewGroup?.avatar || "",
)

const coverStyle = computed(() =>
  coverUrl.value
    ? { backgroundImage: `url(${coverUrl.value})` }
    : { backgroundColor: "#f1f5f9" },
)

const avatarStyle = computed(() => ({
  backgroundColor: props.previewGroup?.accent || "#f1f5f9",
}))

function handleFileChange(event: Event, type: "avatar" | "banner") {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    return
  }

  const objectUrl = URL.createObjectURL(file)

  if (type === "avatar") {
    model.value.avatarUrl = objectUrl
    model.value.avatarFile = file
    return
  }

  model.value.bannerUrl = objectUrl
  model.value.bannerFile = file
}
</script>

<style scoped>
.group-media {
  position: relative;
  padding-bottom: 96px;
}

.group-media__cover {
  position: relative;
  min-height: 232px;
  overflow: hidden;
  border-radius: 8px;
  background-position: center;
  background-size: cover;
}

.group-media__cover-action {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: rgba(241, 245, 249, 0.56);
  color: #000000;
  transition: background-color 0.15s ease;
}

.group-media__cover-action:hover {
  background: rgba(226, 232, 240, 0.72);
}

.group-media__avatar-wrap {
  bottom: 18px;
  left: 50%;
  position: absolute;
  transform: translateX(-50%);
}

.group-media__avatar {
  display: flex;
  height: 132px;
  width: 132px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 6px solid #ffffff;
  border-radius: 999px;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.12);
}

.group-media__avatar-img {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.group-media__avatar-action {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(241, 245, 249, 0.72);
  color: #000000;
  opacity: 0.95;
  transition: background-color 0.15s ease, transform 0.15s ease;
}

.group-media__avatar-action:hover {
  background: rgba(226, 232, 240, 0.88);
  transform: scale(1.02);
}

.group-media__input {
  display: none;
}

@media (max-width: 640px) {
  .group-media {
    padding-bottom: 78px;
  }

  .group-media__cover {
    min-height: 180px;
  }

  .group-media__avatar {
    height: 112px;
    width: 112px;
  }
}
</style>
