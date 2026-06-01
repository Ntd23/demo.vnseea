// English description: Provides wallet-specific money formatting and parsing without leaking UI concerns into components.

import {
  formatCurrency,
  parseCurrencyInput,
  type FormatCurrencyOptions,
} from "#shared-kernel/application/utils/formatCurrency"
import type { WalletCurrencyRule } from "../types/wallet.types"

type WalletMoneyOptions = {
  currency: string
  currencySymbol: string
  currencyRule: WalletCurrencyRule
  locale: string
}

const ISO_CURRENCY_CODE = /^[A-Z]{3}$/

const normalizeCurrency = (currency: string) => {
  const normalized = currency.trim().toUpperCase()

  return ISO_CURRENCY_CODE.test(normalized) ? normalized : ""
}

const getRuleDecimals = (currencyRule: WalletCurrencyRule) => {
  if (currencyRule.decimals === undefined || currencyRule.decimals === null) {
    return null
  }

  const decimals = Number(currencyRule.decimals)

  return Number.isFinite(decimals) && decimals >= 0 ? decimals : null
}

export function formatWalletAmount(amount: number, options: WalletMoneyOptions) {
  return formatCurrency(amount, {
    currency: options.currency,
    currencySymbol: options.currencySymbol,
    currencyRule: options.currencyRule,
    locale: options.locale,
  } satisfies FormatCurrencyOptions)
}

export function parseWalletAmountInput(value: string | number | null | undefined, currencyRule: WalletCurrencyRule) {
  return parseCurrencyInput(value, currencyRule)
}

export function createWalletAmountInputFormatOptions(options: WalletMoneyOptions): Intl.NumberFormatOptions | undefined {
  const currency = normalizeCurrency(options.currency)
  const ruleDecimals = getRuleDecimals(options.currencyRule)
  const fractionDigits = ruleDecimals ?? (currency === "VND" ? 0 : undefined)

  if (!currency) {
    return fractionDigits === undefined
      ? undefined
      : {
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits: fractionDigits,
        }
  }

  return {
    style: "currency",
    currency,
    ...(fractionDigits === undefined
      ? {}
      : {
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits: fractionDigits,
        }),
  }
}
