// English description: Parses wallet QR payloads into domain-level send-money targets.

export type WalletQrPayload = {
  to: number
  amount: number | null
}

export function parseWalletQrPayload(value: string): WalletQrPayload | null {
  const raw = value.trim()

  if (!raw) return null

  if (raw.startsWith("{")) {
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>
      const type = String(parsed.type ?? "")

      if (type === "wallet" || type === "send") {
        return {
          to: Number(parsed.to ?? 0) || 0,
          amount: parsed.amount === undefined || parsed.amount === null ? null : Number(parsed.amount),
        }
      }
    }
    catch {
      return null
    }
  }

  if (!raw.includes("|")) return null

  const parts = raw.split("|")
  const prefix = parts.shift()?.toUpperCase()

  if (prefix !== "WALLET") return null

  const values = new Map<string, string>()
  for (const part of parts) {
    const separatorIndex = part.indexOf("=")
    if (separatorIndex > -1) {
      values.set(part.slice(0, separatorIndex), part.slice(separatorIndex + 1))
    }
  }

  return {
    to: Number(values.get("to") ?? 0) || 0,
    amount: values.has("amount") ? Number(values.get("amount")) : null,
  }
}
