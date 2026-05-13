// English description: Maps backend wallet API responses into the wallet bounded context and proxies wallet mutations.

import { createError, type H3Event } from "h3"
import { assertBackendApiSuccess } from "../../utils/backend-api-response"
import { createBackendApiClient, getBackendBaseCandidates, normalizeBackendBaseURL } from "../../utils/backend-api-client"
import { createBackendWebClient } from "../../utils/backend-web-client"
import { getBackendCurrentUser } from "../../utils/backend-current-user"
import type {
  WalletCurrentUser,
  WalletMutationResult,
  WalletOverview,
  WalletReceiveQr,
  WalletRecipient,
  WalletSendDraft,
  WalletTopupDraft,
  WalletTopupMethod,
  WalletTransaction,
  WalletTransactionTone,
} from "../../../src/wallet/domain/types/wallet.types"

type BackendEntity = Record<string, unknown>

type BackendWalletOverviewResponse = {
  api_status?: number | string
  balance?: number | string
  withdrawable_balance?: number | string
  currency?: string
  currency_symbol?: string
  currency_rule?: BackendEntity
  transactions?: BackendEntity[]
  topup_methods?: BackendEntity[]
  can_withdraw?: boolean
  current_user?: BackendEntity
  errors?: {
    error_text?: string
  }
}

type BackendRecipientSearchResponse = {
  api_status?: number | string
  items?: BackendEntity[]
  errors?: {
    error_text?: string
  }
}

type BackendWebMutationResponse = {
  status?: number | string
  api_status?: number | string
  message?: string
  error?: string
  errors?: string[] | {
    error_text?: string
  }
  url?: string
}

const asString = (value: unknown) =>
  typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : ""

const asNumber = (value: unknown) => {
  const normalized = Number(value)
  return Number.isFinite(normalized) ? normalized : 0
}

const asBoolean = (value: unknown) =>
  value === true || value === 1 || value === "1" || value === "true" || value === "yes"

const normalizeImageUrl = (value: string, baseUrl: string) => {
  if (!value) return ""
  if (/^https?:\/\//i.test(value)) return value
  const normalizedBase = baseUrl.replace(/\/+$/, "")
  const normalizedPath = value.startsWith("/") ? value : `/${value}`
  return `${normalizedBase}${normalizedPath}`
}

const transactionTone = (kind: string): WalletTransactionTone => {
  if (["WALLET", "RECEIVED", "SALE", "SALES"].includes(kind)) return "success"
  if (kind === "PRO") return "warning"
  if (kind === "SENT") return "info"
  if (kind === "PURCHASE") return "danger"
  return "neutral"
}

const webErrorMessage = (response: BackendWebMutationResponse, fallback: string) => {
  if (Array.isArray(response.errors)) {
    return response.errors.join("\n")
  }

  if (response.errors && typeof response.errors === "object") {
    return asString(response.errors.error_text) || fallback
  }

  return asString(response.error || response.message) || fallback
}

const assertWebSuccess = (response: BackendWebMutationResponse, fallback: string) => {
  const status = Number(response.status ?? response.api_status ?? 0)

  if (status >= 200 && status < 300) {
    return response
  }

  throw createError({
    statusCode: 400,
    statusMessage: webErrorMessage(response, fallback),
    data: response,
  })
}

const mapTransaction = (item: BackendEntity): WalletTransaction => {
  const kind = asString(item.kind)

  return {
    id: asNumber(item.id),
    kind,
    notes: asString(item.notes),
    amount: asNumber(item.amount),
    transactionDate: asString(item.transaction_dt),
    statusTone: transactionTone(kind),
  }
}

const mapTopupMethod = (item: BackendEntity): WalletTopupMethod => ({
  value: asString(item.value),
  label: asString(item.label),
  type: asString(item.type) === "upload" ? "upload" : "redirect",
  note: asString(item.note),
})

const mapCurrentUser = (item: BackendEntity | undefined, baseUrl: string): WalletCurrentUser => ({
  id: asNumber(item?.id),
  name: asString(item?.name),
  username: asString(item?.username),
  avatarUrl: normalizeImageUrl(asString(item?.avatar), baseUrl),
})

const mapRecipient = (item: BackendEntity, baseUrl: string): WalletRecipient => ({
  id: asNumber(item.id),
  name: asString(item.name),
  username: asString(item.username),
  avatarUrl: normalizeImageUrl(asString(item.avatar), baseUrl),
})

const getBackendWebBase = (event: H3Event) => {
  const runtimeConfig = useRuntimeConfig(event)
  return normalizeBackendBaseURL(String(runtimeConfig.public.backendWebBase || runtimeConfig.backendApiBase))
}

export async function fetchWalletOverview(event: H3Event): Promise<WalletOverview> {
  const response = assertBackendApiSuccess(
    await createBackendApiClient(event).get<BackendWalletOverviewResponse>("wallet-overview"),
    "Unable to load wallet.",
  )
  const baseUrl = getBackendWebBase(event)

  return {
    balance: asNumber(response.balance),
    withdrawableBalance: asNumber(response.withdrawable_balance),
    currency: asString(response.currency),
    currencySymbol: asString(response.currency_symbol),
    currencyRule: response.currency_rule ?? {},
    transactions: (response.transactions ?? []).map(mapTransaction),
    topupMethods: (response.topup_methods ?? [])
      .map(mapTopupMethod)
      .filter(method => method.value && method.label),
    canWithdraw: asBoolean(response.can_withdraw),
    withdrawalUrl: "/withdrawal",
    currentUser: mapCurrentUser(response.current_user, baseUrl),
  }
}

export async function searchWalletRecipients(event: H3Event, query: string): Promise<WalletRecipient[]> {
  const response = assertBackendApiSuccess(
    await createBackendApiClient(event).get<BackendRecipientSearchResponse>(
      "wallet-recipient-search",
      { q: query },
    ),
    "Unable to search recipients.",
  )
  const baseUrl = getBackendWebBase(event)

  return (response.items ?? []).map(item => mapRecipient(item, baseUrl))
}

export async function getWalletReceiveQr(event: H3Event, amount: number | null): Promise<WalletReceiveQr> {
  const currentUser = await getBackendCurrentUser(event)
  const baseUrl = getBackendBaseCandidates(getBackendWebBase(event))[0] ?? getBackendWebBase(event)
  const params = new URLSearchParams({
    f: "qrcode",
    s: "wallet-qr-code",
    to: String(currentUser.user_id ?? ""),
  })

  if (amount && amount > 0) {
    params.set("amount", String(amount))
  }

  return {
    imageUrl: `${baseUrl.replace(/\/+$/, "")}/requests.php?${params.toString()}`,
    amount,
  }
}

export async function sendWalletMoney(
  event: H3Event,
  input: WalletSendDraft,
): Promise<WalletMutationResult> {
  const response = assertWebSuccess(
    await createBackendWebClient(event).postForm<BackendWebMutationResponse>(
      "wallet",
      {
        user_id: input.recipientUserId,
        amount: input.amount,
      },
      { s: "send" },
    ),
    "Unable to send money.",
  )

  return {
    success: true,
    message: asString(response.message),
  }
}

export async function createWalletTopupLink(
  event: H3Event,
  input: WalletTopupDraft,
): Promise<WalletMutationResult> {
  const response = assertWebSuccess(
    await createBackendWebClient(event).postForm<BackendWebMutationResponse>(
      "wallet",
      undefined,
      {
        s: "replenish-user-account",
        amount: input.amount,
        desc: "replenish_my_balance",
      },
    ),
    "Unable to start wallet top-up.",
  )

  return {
    success: true,
    message: asString(response.message),
    redirectUrl: asString(response.url),
  }
}

export async function uploadWalletBankTransfer(
  event: H3Event,
  input: WalletTopupDraft,
): Promise<WalletMutationResult> {
  const currentUser = await getBackendCurrentUser(event)
  const hash = asString(currentUser.session_hash)
  const formData = new FormData()

  formData.append("price", String(input.amount))
  formData.append("description", "Add to balance")
  formData.append("type", "wallet")

  if (hash) {
    formData.append("hash_id", hash)
  }

  if (input.receiptFile) {
    formData.append("thumbnail", input.receiptFile, input.receiptFile.name)
  }

  const response = assertWebSuccess(
    await createBackendWebClient(event).postForm<BackendWebMutationResponse, FormData>(
      "bank_transfer_wallet",
      formData,
    ),
    "Unable to upload bank transfer receipt.",
  )

  return {
    success: true,
    message: asString(response.message),
  }
}
