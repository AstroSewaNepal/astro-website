export type MangalDoshaLevel = 'present' | 'mild' | 'none';

export function determineMangalDosha(birthDate: string): MangalDoshaLevel {
  const day = Number(birthDate.split('-')[2] || 0);
  if (day % 3 === 0) return 'present';
  if (day % 3 === 1) return 'mild';
  return 'none';
}
