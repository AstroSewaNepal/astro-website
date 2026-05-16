export type CalculatorFormValues = {
  fullName: string;
  gender: string;
  birthDate: string;
  birthPlace: string;
  birthTimeHH: string;
  birthTimeMM: string;
  birthTimeAMPM: string;
  dontKnowTime: boolean;
};

export const EMPTY_CALCULATOR_FORM: CalculatorFormValues = {
  fullName: '',
  gender: '',
  birthDate: '',
  birthPlace: '',
  birthTimeHH: '',
  birthTimeMM: '',
  birthTimeAMPM: 'am',
  dontKnowTime: false,
};

export function formatDobDisplay(isoDate: string) {
  if (!isoDate) return '—';
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return isoDate;
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
}

export function formatGenderDisplay(value: string) {
  if (!value) return '—';
  return value.charAt(0).toUpperCase() + value.slice(1);
}
