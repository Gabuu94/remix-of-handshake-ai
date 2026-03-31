/** All monetary values are stored as integer cents. Display as dollars. */
export function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Format reward range for task cards */
export function formatRewardRange(reward: number): string {
  const base = reward / 100;
  const high = (base * 1.35).toFixed(2);
  return `$${base.toFixed(2)} – ${high} per task`;
}
