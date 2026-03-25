/**
 * Format a value from its smallest unit (wei/sun) to a human-readable string.
 * Uses BigInt for precision.
 */
export function formatAmount(
  value: string,
  decimals: number = 18,
  symbol?: string
): string {
  if (!value || value === '0') {
    return symbol ? `0 ${symbol}` : '0'
  }

  const isNegative = value.startsWith('-')
  const absValue = isNegative ? value.slice(1) : value

  let bigVal: bigint
  try {
    bigVal = BigInt(absValue)
  } catch {
    return symbol ? `${value} ${symbol}` : value
  }

  const divisor = 10n ** BigInt(decimals)
  const wholePart = bigVal / divisor
  const fracPart = bigVal % divisor

  let fracStr = fracPart.toString().padStart(decimals, '0')
  // Keep up to 2 significant decimal places
  fracStr = fracStr.slice(0, 2)
  // Remove trailing zeros
  fracStr = fracStr.replace(/0+$/, '')

  const wholeStr = formatWithCommas(wholePart.toString())
  const sign = isNegative ? '-' : ''

  let result: string
  if (fracStr) {
    result = `${sign}${wholeStr}.${fracStr}`
  } else {
    result = `${sign}${wholeStr}`
  }

  return symbol ? `${result} ${symbol}` : result
}

function formatWithCommas(num: string): string {
  const parts: string[] = []
  let i = num.length
  while (i > 0) {
    const start = Math.max(0, i - 3)
    parts.unshift(num.slice(start, i))
    i = start
  }
  return parts.join(',')
}
