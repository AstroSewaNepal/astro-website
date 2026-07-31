/**
 * Earnings are stored in the smallest currency unit (paisa/cents).
 * Amounts are displayed in the major unit; the platform operates in NPR.
 */
export function formatEarningAmount(amountInPaisa: number, currency = 'NPR'): string {
  const major = amountInPaisa / 100;
  return `${currency} ${major.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
