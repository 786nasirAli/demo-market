// Decimal-Safe Currency & Pricing Calculations

/**
 * Converts a GBP float amount to integer pence to eliminate IEEE 754 floating-point inaccuracies.
 * Example: 269.99 -> 26999
 */
export function toPence(amount: number): number {
  if (isNaN(amount) || amount === null || amount === undefined) return 0;
  return Math.round(Number(amount) * 100);
}

/**
 * Converts integer pence back to a standard floating-point GBP amount rounded to 2 decimals.
 * Example: 26999 -> 269.99
 */
export function fromPence(pence: number): number {
  return Math.round(pence) / 100;
}

/**
 * Calculates the total product price dynamically based on base price and selected options.
 * All arithmetic is performed in pence before conversion.
 */
export function calculateDynamicPrice(
  basePrice: number,
  selectedOptions: Array<{ extraPrice: number }>
): number {
  let totalPence = toPence(basePrice);

  for (const option of selectedOptions) {
    if (option && typeof option.extraPrice === 'number') {
      totalPence += toPence(option.extraPrice);
    }
  }

  return fromPence(totalPence);
}

/**
 * Computes percentage savings for compare-at badges (e.g., 50% OFF)
 */
export function calculateDiscountPercent(currentPrice: number, compareAtPrice: number): number {
  if (!compareAtPrice || compareAtPrice <= currentPrice) return 0;
  const discount = ((compareAtPrice - currentPrice) / compareAtPrice) * 100;
  return Math.round(discount);
}

/**
 * Consistent UK Currency Formatter: e.g. £269.99 or £1,234.50
 */
export function formatGBP(amount: number): string {
  const safeAmount = isNaN(amount) || amount === null || amount === undefined ? 0 : amount;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);
}

/**
 * Generates a deterministic hash key for a specific cart configuration.
 * Ensures that two different option configurations of the same bed result in two distinct cart line items.
 */
export function generateCartItemHash(
  productId: string,
  selectedOptions: Record<string, { optionId: string; extraPrice: number }>
): string {
  const sortedOptionKeys = Object.keys(selectedOptions).sort();
  const optionTokens = sortedOptionKeys.map(
    (k) => `${k}:${selectedOptions[k].optionId}@${selectedOptions[k].extraPrice}`
  );
  return `${productId}__${optionTokens.join('__')}`;
}
