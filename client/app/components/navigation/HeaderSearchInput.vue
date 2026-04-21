<template>
  <form class="relative w-full" @submit.prevent="submitSearch">
    <Icon
      name="i-ph-magnifying-glass-bold"
      class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8090d8]"
    />

    <input
      v-model="search"
      class="h-11 w-full rounded-full border border-[#dbe3f2] bg-white pl-12 pr-4 text-[14px] text-slate-900 outline-none transition placeholder:text-[#90a0d5] focus:border-[#0000ff] focus:ring-4 focus:ring-[#dfe3ff]"
      :placeholder="$t('navigation.headerSearchInput.placeholder')"
      type="search"
    >
  </form>
</template>

<script setup lang="ts">
function readQueryValue(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || "")
  return typeof value === "string" ? value : ""
}

const route = useRoute()
const router = useRouter()
const search = ref(readQueryValue(route.query.q))

watch(
  () => route.query.q,
  (value) => {
    const nextValue = readQueryValue(value)
    if (nextValue !== search.value) search.value = nextValue
  },
)

function submitSearch() {
  const keyword = search.value.trim()
  const nextQuery = keyword ? { q: keyword } : {}
  void router.push({ path: "/search", query: nextQuery })
}
</script>
