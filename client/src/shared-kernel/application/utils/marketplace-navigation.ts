// English description: Centralizes marketplace route and notification target detection for the reversible home variant.

import { appRoutes } from "../constants/route-registry";

const marketplaceExactPaths = new Set<string>([
  appRoutes.home,
  appRoutes.feed,
  appRoutes.products,
  appRoutes.newProduct,
  appRoutes.myProducts,
  appRoutes.purchased,
  appRoutes.checkout,
  appRoutes.orders,
]);

export function isMarketplaceNavigationPath(path: string) {
  return (
    marketplaceExactPaths.has(path) ||
    path.startsWith("/product/") ||
    path.startsWith("/edit-product/") ||
    path.startsWith("/order/") ||
    path.startsWith("/customer_order/")
  );
}

export function isMarketplaceNavigationContext(
  path: string,
  query: Record<string, unknown>,
) {
  return (
    isMarketplaceNavigationPath(path) ||
    (path === appRoutes.messages &&
      normalizeQueryValue(query.context) === "product")
  );
}

export function isProductNotificationTarget(input: {
  type?: string;
  url?: string;
}) {
  const type = String(input.type || "").toLowerCase();

  if (
    /(?:product|marketplace|order|checkout|purchase|seller|buyer)/.test(type)
  ) {
    return true;
  }

  const path = toRelativePath(input.url);

  return (
    isMarketplaceNavigationPath(path) ||
    path === appRoutes.checkout ||
    path.startsWith("/orders/")
  );
}

function normalizeQueryValue(value: unknown) {
  const normalized = Array.isArray(value) ? value[0] : value;

  return typeof normalized === "string" ? normalized.trim().toLowerCase() : "";
}

function toRelativePath(value: unknown) {
  const rawValue = typeof value === "string" ? value.trim() : "";

  if (!rawValue) {
    return "";
  }

  try {
    return new URL(rawValue, "https://vnseea.local").pathname;
  } catch {
    return rawValue.split(/[?#]/, 1)[0] || "";
  }
}
