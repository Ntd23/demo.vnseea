<!-- English description: Renders the global Nuxt error screen with Nuxt UI recovery actions. -->
<template>
  <UApp :locale="nuxtUiLocale">
    <UError :error="displayError" :clear="false">
      <template #message>
        <span class="block">
          {{ statusDescription }}
        </span>
        <span
          v-if="errorMessage"
          class="mt-3 block max-w-2xl break-words rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--bg-muted)] px-4 py-3 text-left text-sm text-[var(--text-secondary)]"
        >
          {{ errorMessage }}
        </span>
      </template>

      <template #links>
        <UButton
          type="button"
          size="lg"
          icon="i-ph-arrow-clockwise-bold"
          class="w-full justify-center sm:w-auto"
          @click="retryCurrentPage"
        >
          {{ $t("appShell.runtimeError.retry") }}
        </UButton>
        <UButton
          type="button"
          size="lg"
          color="neutral"
          variant="outline"
          icon="i-ph-house-bold"
          class="w-full justify-center sm:w-auto"
          @click="recoverToSafeRoute"
        >
          {{ $t("appShell.runtimeError.safe") }}
        </UButton>
      </template>
    </UError>
  </UApp>
</template>

<script setup lang="ts">
import type { NuxtError } from "#app";
import { en_gb, vi } from "@nuxt/ui/locale";

const props = defineProps<{
  error: NuxtError;
}>();

const { locale, t } = useI18n();
const route = useRoute();
const lastSafeRoute = useState("last-safe-route", () => "/home");

const nuxtUiLocale = computed(() => (locale.value === "vi" ? vi : en_gb));
const statusCode = computed(() => Number(props.error.statusCode || 500));

const statusTitle = computed(() => {
  if (statusCode.value === 404) return t("errorScreen.statusNotFound");
  if (statusCode.value >= 500) return t("errorScreen.statusServerError");
  return t("errorScreen.statusFallback");
});

const statusDescription = computed(() => {
  if (statusCode.value === 404) return t("errorScreen.descNotFound");
  if (statusCode.value >= 500) return t("errorScreen.descServerError");
  return t("errorScreen.descFallback");
});

const errorMessage = computed(() => {
  const message = props.error.message?.trim();

  if (
    !message ||
    message === statusTitle.value ||
    message === statusDescription.value
  ) {
    return "";
  }

  return message;
});

const displayError = computed(() => ({
  statusCode: statusCode.value,
  statusMessage: statusTitle.value,
  message: statusDescription.value,
}));

const safeRoute = computed(() => {
  const fallback = lastSafeRoute.value || "/home";

  if (fallback !== route.fullPath) {
    return fallback;
  }

  return route.fullPath === "/home" ? "/" : "/home";
});

async function retryCurrentPage() {
  await clearError({ redirect: route.fullPath || "/" });
}

async function recoverToSafeRoute() {
  await clearError({ redirect: safeRoute.value });
}
</script>
