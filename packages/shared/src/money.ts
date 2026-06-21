export type RevenueSplit = {
  instructor: number;
  platform: number;
  processor: number;
  affiliate: number;
};

export function splitRevenue(
  totalCents: number,
  affiliateSale: boolean,
): RevenueSplit {
  if (!Number.isInteger(totalCents) || totalCents < 0) {
    throw new Error("INVALID_AMOUNT");
  }

  const platform = Math.floor(totalCents * 0.25);
  const processor = Math.floor(totalCents * 0.05);
  const affiliate = affiliateSale ? Math.floor(totalCents * 0.1) : 0;
  const instructor = totalCents - platform - processor - affiliate;

  return { instructor, platform, processor, affiliate };
}
