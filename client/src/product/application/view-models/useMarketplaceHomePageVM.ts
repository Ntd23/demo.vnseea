// English description: Coordinates real marketplace data and navigation for the reversible marketplace home variant.

import { appRoutes } from "#shared-kernel/application/constants/route-registry";
import { createApiProductRepository } from "../../infrastructure/repositories/ApiProductRepository";

const categoryIcons = [
  "i-ph-squares-four-duotone",
  "i-ph-device-mobile-camera-duotone",
  "i-ph-t-shirt-duotone",
  "i-ph-armchair-duotone",
  "i-ph-car-profile-duotone",
  "i-ph-basket-duotone",
  "i-ph-book-open-text-duotone",
  "i-ph-wrench-duotone",
] as const;

export const useMarketplaceHomePageVM = (
  repository = createApiProductRepository(),
) => {
  const {
    data: marketplace,
    status,
    error,
    refresh,
  } = useAsyncData(
    "product:marketplace-home",
    () => repository.list({ limit: 12, sort: "latest" }),
    {
      default: () => ({
        items: [],
        hasMore: false,
        nextOffset: null,
        categories: [],
        subCategories: [],
        distanceFilterAvailable: false,
      }),
    },
  );

  const categories = computed(() =>
    marketplace.value.categories.slice(0, 8).map((category, index) => ({
      ...category,
      icon: categoryIcons[index % categoryIcons.length],
    })),
  );
  const products = computed(() => {
    const categoryLabels = new Map(
      marketplace.value.categories.map((category) => [
        category.value,
        category.label,
      ]),
    );

    return marketplace.value.items.map((product) => ({
      ...product,
      categoryLabel:
        categoryLabels.get(product.categoryId) || product.categoryLabel,
    }));
  });
  const isLoading = computed(
    () => status.value === "idle" || status.value === "pending",
  );

  onMounted(() => {
    // Refreshes a previously cached empty or failed result when the home route is revisited.
    void refresh();
  });

  const getCategoryHref = (categoryId: string) =>
    `${appRoutes.products}?c_id=${encodeURIComponent(categoryId)}`;

  return {
    appRoutes,
    categories,
    products,
    isLoading,
    error,
    refresh,
    getCategoryHref,
  };
};
