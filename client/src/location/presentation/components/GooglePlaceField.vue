<!-- English description: Cost-conscious Google Places address select menu powered by Nuxt Scripts. -->

<template>
  <div class="google-place-field">
    <USelectMenu
      :model-value="selectedItem"
      v-model:search-term="searchText"
      :items="suggestions"
      :placeholder="selectedLocation.address || placeholder"
      :disabled="disabled"
      :loading="isLoading"
      :search-input="searchInput"
      :reset-search-term-on-blur="false"
      :reset-search-term-on-select="false"
      :content="{ sideOffset: 8 }"
      by="placeId"
      ignore-filter
      icon="i-ph-map-pin-duotone"
      class="w-full min-w-0"
      :ui="selectUi"
      @update:model-value="handleSelectedItem"
      @update:open="handleOpenChange"
      @blur="syncManualAddress"
    >
      <template #empty>
        <span class="px-2 py-1.5 text-[12px] font-medium text-slate-500">
          {{ emptyText }}
        </span>
      </template>
    </USelectMenu>

    <p v-if="helperText" class="google-place-field__help">
      {{ helperText }}
    </p>
    <p v-if="errorText" class="google-place-field__error">
      {{ errorText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { refDebounced } from "@vueuse/core"
import {
  emptyLocationSelection,
  normalizeLocationSelection,
  type LocationSelection,
} from "../../domain/types/location.types"

type PlaceSuggestionItem = {
  label: string
  placeId: string
  icon: string
}

const props = withDefaults(defineProps<{
  modelValue?: LocationSelection | string | null
  placeholder?: string
  helperText?: string
  disabled?: boolean
  requireCoordinates?: boolean
}>(), {
  modelValue: null,
  placeholder: "",
  helperText: "",
  disabled: false,
  requireCoordinates: false,
})

const emit = defineEmits<{
  "update:modelValue": [value: LocationSelection]
}>()

const searchText = ref("")
const selectedItem = shallowRef<PlaceSuggestionItem | null>(null)
const suggestions = ref<PlaceSuggestionItem[]>([])
const errorText = ref("")
const isLoading = ref(false)
const isSyncingSelection = ref(false)
const isSelectingSuggestion = ref(false)
const syncedSearchText = ref("")
const autocompleteService = shallowRef<google.maps.places.AutocompleteService | null>(null)
const placesService = shallowRef<google.maps.places.PlacesService | null>(null)
const lastPredictionRequest = ref(0)
const searchTextDebounced = refDebounced(searchText, 250)
const predictionTimeoutMs = 8000

const { load } = useScriptGoogleMaps({
  libraries: ["places"],
  trigger: "manual",
})

const selectUi = {
  base: "h-12 w-full min-w-0 rounded-xl border border-[#e2e8f0] bg-[#fafbfe] text-[13px] font-medium text-[#334155] placeholder:text-[#94a3b8] focus:border-[rgba(0,0,255,0.25)] focus:bg-white",
  leading: "shrink-0",
  value: "min-w-0 truncate",
  itemLabel: "min-w-0 truncate",
  input: "min-w-0",
}

const searchInput = computed(() => ({
  placeholder: props.placeholder || "Search address",
  icon: "i-ph-magnifying-glass-duotone",
  loading: isLoading.value,
}))

const selectedLocation = computed(() => {
  if (typeof props.modelValue === "string") {
    return normalizeLocationSelection({ address: props.modelValue })
  }

  return normalizeLocationSelection(props.modelValue)
})

const emptyText = computed(() => {
  if (isLoading.value) return "Searching addresses..."
  if ((searchText.value || "").trim().length < 3) return "Type at least 3 characters."

  return "No address suggestions found."
})

watch(
  selectedLocation,
  (value) => {
    isSyncingSelection.value = true
    syncedSearchText.value = value.address
    searchText.value = value.address
    selectedItem.value = value.address
      ? {
          label: value.address,
          placeId: value.placeId || `manual:${value.address}`,
          icon: "i-ph-map-pin-duotone",
        }
      : null
    nextTick(() => {
      isSyncingSelection.value = false
    })
  },
  { immediate: true },
)

watch(searchTextDebounced, (value) => {
  if (value.trim() === syncedSearchText.value.trim()) {
    isLoading.value = false
    suggestions.value = []
    return
  }

  void fetchSuggestions(value)
})

async function ensurePlacesServices() {
  if (autocompleteService.value && placesService.value) {
    return true
  }

  if (!import.meta.client) {
    return false
  }

  try {
    await load()
  }
  catch {
    errorText.value = "Google Maps rejected this domain. Add this site URL to the API key referrer restrictions."
    return false
  }

  const maps = window.google?.maps

  if (!maps?.places?.AutocompleteService || !maps.places.PlacesService) {
    errorText.value = "Google Places is not available for this API key and domain."
    return false
  }

  autocompleteService.value = new maps.places.AutocompleteService()
  placesService.value = new maps.places.PlacesService(document.createElement("div"))

  return true
}

async function fetchSuggestions(input: string) {
  const query = input.trim()

  if (props.disabled || query.length < 3) {
    suggestions.value = []
    isLoading.value = false
    return
  }

  try {
    isLoading.value = true
    errorText.value = ""

    const ready = await ensurePlacesServices()
    if (!ready || !autocompleteService.value) {
      suggestions.value = []
      isLoading.value = false
      return
    }

    const requestId = lastPredictionRequest.value + 1
    lastPredictionRequest.value = requestId
    const timeoutId = window.setTimeout(() => {
      if (requestId !== lastPredictionRequest.value) {
        return
      }

      isLoading.value = false
      suggestions.value = []
      errorText.value = "Google Places did not respond. Try again."
    }, predictionTimeoutMs)

    autocompleteService.value.getPlacePredictions(
      { input: query },
      (predictions, status) => {
        if (requestId !== lastPredictionRequest.value) {
          window.clearTimeout(timeoutId)
          return
        }

        window.clearTimeout(timeoutId)
        const okStatus = window.google?.maps?.places?.PlacesServiceStatus?.OK
        const zeroResultsStatus = window.google?.maps?.places?.PlacesServiceStatus?.ZERO_RESULTS
        suggestions.value = status === okStatus
          ? (predictions ?? []).map(prediction => ({
              label: prediction.description,
              placeId: prediction.place_id || prediction.description,
              icon: "i-ph-map-pin-duotone",
            }))
          : []
        errorText.value = status && status !== okStatus && status !== zeroResultsStatus
          ? `Google Places returned ${status}.`
          : ""
        isLoading.value = false
      },
    )
  }
  catch {
    isLoading.value = false
    suggestions.value = []
    errorText.value = "Unable to load Google address suggestions."
  }
}

async function selectSuggestion(item: PlaceSuggestionItem) {
  if (item.placeId.startsWith("manual:")) {
    return
  }

  try {
    isSelectingSuggestion.value = true
    isLoading.value = true
    errorText.value = ""

    const ready = await ensurePlacesServices()
    if (!ready || !placesService.value) {
      isLoading.value = false
      isSelectingSuggestion.value = false
      return
    }

    placesService.value.getDetails(
      {
        placeId: item.placeId,
        fields: ["formatted_address", "geometry", "place_id", "name"],
      },
      (place, status) => {
        const okStatus = window.google?.maps?.places?.PlacesServiceStatus?.OK
        isLoading.value = false
        isSelectingSuggestion.value = false

        if (status !== okStatus) {
          errorText.value = "Unable to read the selected address."
          return
        }

        const geometry = place?.geometry?.location
        const nextValue: LocationSelection = {
          address: String(place?.formatted_address || place?.name || item.label || "").trim(),
          lat: geometry ? geometry.lat() : null,
          lng: geometry ? geometry.lng() : null,
          placeId: String(place?.place_id || item.placeId || ""),
        }

        searchText.value = nextValue.address
        suggestions.value = []
        errorText.value = ""
        emit("update:modelValue", nextValue)
      },
    )
  }
  catch {
    isLoading.value = false
    isSelectingSuggestion.value = false
    errorText.value = "Unable to read the selected address."
  }
}

function handleSelectedItem(item: PlaceSuggestionItem | null) {
  if (!item || isSyncingSelection.value) {
    return
  }

  selectedItem.value = item
  void selectSuggestion(item)
}

function handleOpenChange(open: boolean) {
  if (open) {
    void fetchSuggestions(searchText.value)
    return
  }

  syncManualAddress()
}

function syncManualAddress() {
  if (isLoading.value || isSelectingSuggestion.value) {
    return
  }

  const address = searchText.value.trim()

  if (!address) {
    errorText.value = ""
    emit("update:modelValue", emptyLocationSelection())
    return
  }

  const current = selectedLocation.value

  if (address !== current.address) {
    emit("update:modelValue", {
      address,
      lat: null,
      lng: null,
      placeId: "",
    })
  }

  const latest = normalizeLocationSelection(address === current.address ? current : { address })
  errorText.value = props.requireCoordinates && (latest.lat === null || latest.lng === null)
    ? "Select an address suggestion so nearby search can store coordinates."
    : ""
}
</script>

<style scoped>
.google-place-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  min-width: 0;
}

.google-place-field :deep([data-slot="base"]) {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
}

.google-place-field :deep([data-slot="value"]),
.google-place-field :deep([data-slot="itemLabel"]) {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.google-place-field__help,
.google-place-field__error {
  font-size: 12px;
  font-weight: 500;
  line-height: 1.45;
}

.google-place-field__help {
  color: #64748b;
}

.google-place-field__error {
  color: #dc2626;
}
</style>
