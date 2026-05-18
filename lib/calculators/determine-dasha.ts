export function determineDashaCycle(birthDate: string): number {
  const digits = birthDate.replace(/-/g, '');
  const sum = digits.split('').reduce((acc, d) => acc + Number(d), 0);
  return ((sum - 1) % 9) + 1;
}
