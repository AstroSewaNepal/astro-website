export type DoshaStrength = 'None' | 'Mild' | 'Strong';

export interface DoshaResult {
  present: boolean;
  strength: DoshaStrength;
  reasons: string[];
}

export interface AllDoshaResult {
  manglik: DoshaResult;
  kaalSarp: DoshaResult;
  shani: DoshaResult;
  pitra: DoshaResult;
  guruChandal: DoshaResult;
  chandra: DoshaResult;
  surya: DoshaResult;
}

export const DOSHA_DISPLAY_ORDER: Array<{ key: keyof AllDoshaResult; label: string }> = [
  { key: 'manglik', label: 'Manglik (Mangal Dosha)' },
  { key: 'kaalSarp', label: 'Kaal Sarp' },
  { key: 'shani', label: 'Shani' },
  { key: 'pitra', label: 'Pitra' },
  { key: 'guruChandal', label: 'Guru Chandal' },
  { key: 'chandra', label: 'Chandra' },
  { key: 'surya', label: 'Surya' },
];
