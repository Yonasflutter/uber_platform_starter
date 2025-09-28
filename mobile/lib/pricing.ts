
export function estimatePrice(distanceKm: number, durationMin: number) {
  const start = 3.2, perKm = 2.4, perMin = 0.4;
  const excl = start + perKm * distanceKm + perMin * durationMin;
  const vatRate = 0.09;
  return { price_excl: +excl.toFixed(2), price_incl: +(excl * (1 + vatRate)).toFixed(2) };
}
