<template>
  <section class="publisher">
    <!-- Compact mode: click to expand -->
    <div v-if="!expanded" class="publisher__compact" @click="expanded = true">
      <div class="publisher__compact-avatar">VN</div>
      <div class="publisher__compact-input">
        {{ t("feed.publisherBox.prompt") }}
      </div>
      <div class="publisher__compact-actions">
        <button v-for="action in compactActions" :key="action.icon" class="publisher__compact-btn" type="button" @click.stop="expanded = true; draft.action = action.value">
          <Icon :name="action.icon" class="h-4.5 w-4.5" />
        </button>
      </div>
    </div>

    <!-- Expanded mode: full composer -->
    <div v-else class="publisher__expanded">
      <div class="publisher__head">
        <div class="publisher__avatar">VN</div>
        <div class="publisher__meta">
          <p class="publisher__name">{{ t("feed.publisherBox.expandedOpen") }}</p>
          <div class="publisher__audience-row">
            <button
              v-for="audience in audiences"
              :key="audience.value"
              class="publisher__audience-pill"
              :class="{ 'publisher__audience-pill--active': draft.audience === audience.value }"
              type="button"
              @click="draft.audience = audience.value"
            >
              {{ audience.label }}
            </button>
          </div>
        </div>
        <button class="publisher__close" type="button" @click="expanded = false">
          <Icon name="i-ph-x-bold" class="h-4 w-4" />
        </button>
      </div>

      <div v-if="statusMessage" class="publisher__status" :data-tone="statusTone">
        {{ statusMessage }}
      </div>

      <textarea
        v-model="draft.text"
        class="publisher__textarea"
        rows="3"
        maxlength="280"
        :placeholder="t('feed.publisherBox.composerPlaceholder')"
      />

      <div class="publisher__toolbar">
        <div class="publisher__actions">
          <button
            v-for="action in actions"
            :key="action.value"
            class="publisher__action-chip"
            :class="{ 'publisher__action-chip--active': draft.action === action.value }"
            type="button"
            @click="draft.action = draft.action === action.value ? '' : action.value"
          >
            <Icon :name="action.icon" class="h-4 w-4" />
            <span class="publisher__action-label">{{ action.label }}</span>
          </button>
        </div>

        <div class="publisher__submit-area">
          <span class="publisher__count">{{ draft.text.length }}/280</span>
          <button class="publisher__submit-btn" type="button" :disabled="submitting" @click="publish">
            <Icon v-if="submitting" name="i-lucide-loader-2" class="h-4 w-4 animate-spin" />
            <Icon v-else name="i-ph-paper-plane-tilt-fill" class="h-4 w-4" />
            {{ submitting ? t("feed.publisherBox.submitLoading") : t("feed.publisherBox.share") }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useStorage } from "@vueuse/core"

type PublisherAction = "image" | "video" | "feeling" | "story" | ""
type PublisherAudience = "public" | "connections" | "group"

const { t } = useI18n()
const route = useRoute()
const toast = useToast()

const expanded = ref(false)

const storageKey = `feed-publisher-draft:${route.path || "/"}`
const draft = useStorage<{
  text: string
  audience: PublisherAudience
  action: PublisherAction
}>(
  storageKey,
  {
    text: "",
    audience: "public",
    action: "",
  },
  undefined,
  {
    initOnMounted: true,
    mergeDefaults: true,
  },
)

const submitting = ref(false)
const statusMessage = ref("")
const statusTone = ref<"neutral" | "success" | "warning">("neutral")

const compactActions = [
  { value: "image" as const, icon: "i-ph-image-bold" },
  { value: "video" as const, icon: "i-ph-video-camera-bold" },
  { value: "feeling" as const, icon: "i-ph-smiley-bold" },
]

const actions = computed(() => [
  { value: "image" as const, label: t("feed.publisherBox.actionImage"), icon: "i-ph-image-bold" },
  { value: "video" as const, label: t("feed.publisherBox.actionVideo"), icon: "i-ph-video-camera-bold" },
  { value: "feeling" as const, label: t("feed.publisherBox.actionFeeling"), icon: "i-ph-smiley-bold" },
  { value: "story" as const, label: t("feed.publisherBox.actionStory"), icon: "i-ph-sparkle-bold" },
])

const audiences = computed(() => [
  { value: "public" as const, label: t("feed.publisherBox.audiencePublic") },
  { value: "connections" as const, label: t("feed.publisherBox.audienceConnections") },
  { value: "group" as const, label: t("feed.publisherBox.audienceGroup") },
])

function resetDraft() {
  draft.value.text = ""
  draft.value.action = ""
  draft.value.audience = "public"
  statusMessage.value = ""
  statusTone.value = "neutral"
}

async function publish() {
  if (!draft.value.text.trim()) {
    statusTone.value = "warning"
    statusMessage.value = t("feed.publisherBox.statusErrorDescription")
    return
  }

  submitting.value = true
  statusTone.value = "neutral"
  statusMessage.value = t("feed.publisherBox.statusLoadingDescription")

  await new Promise(resolve => setTimeout(resolve, 650))

  submitting.value = false
  statusTone.value = "success"
  statusMessage.value = t("feed.publisherBox.statusSuccessDescription")

  toast.add({
    color: "success",
    icon: "i-ph-check-circle-fill",
    title: t("feed.publisherBox.statusSuccessTitle"),
    description: t("feed.publisherBox.statusSuccessDescription"),
  })

  draft.value.text = ""
  draft.value.action = ""
  expanded.value = false
}
</script>

<style scoped>
/* ---- Compact mode ---- */
.publisher__compact {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 255, 0.06);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 255, 0.03);
  cursor: pointer;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.publisher__compact:hover {
  border-color: rgba(0, 0, 255, 0.12);
  box-shadow: 0 2px 8px rgba(0, 0, 255, 0.06);
}

.publisher__compact-avatar {
  display: flex;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(145deg, #3333ff 0%, #0000ff 100%);
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  box-shadow: 0 4px 12px rgba(0, 0, 255, 0.18);
}

.publisher__compact-input {
  flex: 1;
  min-width: 0;
  padding: 8px 14px;
  border-radius: 999px;
  background: #f1f5f9;
  font-size: 14px;
  color: #94a3b8;
  font-weight: 500;
}

.publisher__compact-actions {
  display: flex;
  gap: 2px;
}

.publisher__compact-btn {
  display: flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.15s ease;
}

.publisher__compact-btn:hover {
  background: rgba(0, 0, 255, 0.05);
  color: #0000ff;
}

/* ---- Expanded mode ---- */
.publisher__expanded {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 255, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), 0 8px 28px rgba(0, 0, 255, 0.05);
  animation: publisher-in 0.2s ease;
}

@keyframes publisher-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.publisher__head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.publisher__avatar {
  display: flex;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(145deg, #3333ff 0%, #0000ff 100%);
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
  box-shadow: 0 6px 18px rgba(0, 0, 255, 0.16);
}

.publisher__meta {
  flex: 1;
  min-width: 0;
}

.publisher__name {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}

.publisher__audience-row {
  display: flex;
  gap: 4px;
  margin-top: 6px;
}

.publisher__audience-pill {
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: transparent;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
}

.publisher__audience-pill--active {
  border-color: rgba(0, 0, 255, 0.2);
  background: rgba(0, 0, 255, 0.05);
  color: #0000ff;
}

.publisher__close {
  display: flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.12s ease;
}

.publisher__close:hover {
  background: #f1f5f9;
  color: #475569;
}

.publisher__status {
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 13px;
  line-height: 1.5;
}

.publisher__status[data-tone="neutral"] {
  background: #f1f5ff;
  color: #475569;
}

.publisher__status[data-tone="success"] {
  background: #ecfdf5;
  color: #16a34a;
}

.publisher__status[data-tone="warning"] {
  background: #fffbeb;
  color: #d97706;
}

.publisher__textarea {
  width: 100%;
  min-height: 100px;
  resize: vertical;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: #fafbfe;
  padding: 14px 16px;
  font-size: 14.5px;
  line-height: 1.7;
  color: #334155;
  outline: none;
  transition: border-color 0.15s ease;
  font-family: inherit;
}

.publisher__textarea:focus {
  border-color: rgba(0, 0, 255, 0.2);
}

.publisher__toolbar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top: 1px solid #f1f5f9;
  padding-top: 12px;
}

@media (min-width: 640px) {
  .publisher__toolbar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.publisher__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.publisher__action-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 10px;
  border: none;
  background: transparent;
  font-size: 12.5px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
}

.publisher__action-chip:hover {
  background: rgba(0, 0, 255, 0.04);
  color: #0000ff;
}

.publisher__action-chip--active {
  background: rgba(0, 0, 255, 0.06);
  color: #0000ff;
}

.publisher__action-label {
  display: none;
}

@media (min-width: 480px) {
  .publisher__action-label {
    display: inline;
  }
}

.publisher__submit-area {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.publisher__count {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
}

.publisher__submit-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(180deg, #2233ff 0%, #0000ff 100%);
  padding: 8px 18px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0, 0, 255, 0.2);
  transition: all 0.15s ease;
}

.publisher__submit-btn:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 255, 0.28);
  transform: translateY(-1px);
}

.publisher__submit-btn:active {
  transform: scale(0.97);
}

.publisher__submit-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
</style>
