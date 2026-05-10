/** Default place for Panchanga when UI only supplies a readable city label. */
export const PANCHANG_DEFAULT_GEO = {
  lat: 27.7172,
  lon: 85.324,
  label: 'Kathmandu',
} as const;

export function formatDdMmYyyy(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export function dateInputIsoValue(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function parseIsoToLocalCalendarDate(iso: string): Date | null {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return null;
  const out = new Date(y, mo - 1, d);
  if (out.getFullYear() !== y || out.getMonth() !== mo - 1 || out.getDate() !== d) return null;
  return out;
}

export function utcOffsetHmFromLocalDate(date: Date): string {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMinutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatEnglishLongDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** VedAstro StdTime begins with HH:mm on 24h clock. */
export function formatBriefFromStdTime(std: unknown): string {
  if (typeof std !== 'string') return '—';
  const token = std.trim().split(/\s+/)[0] ?? '';
  const [hhRaw, mmRaw] = token.split(':');
  const h24 = Number(hhRaw);
  const mins = Number(mmRaw);
  if (!Number.isFinite(h24) || !Number.isFinite(mins)) return '—';
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(mins).padStart(2, '0')} ${period}`;
}

export function pakshaDisplay(paksha: unknown): string {
  if (typeof paksha !== 'string' || !paksha.trim()) return '—';
  const p = paksha.trim();
  if (/paksha$/i.test(p)) return p;
  return `${p} Paksha`;
}

export function nestedString(obj: unknown, key: string): string {
  if (!obj || typeof obj !== 'object') return '';
  const v = (obj as Record<string, unknown>)[key];
  return typeof v === 'string' ? v : '';
}

export function yogaName(yogaBlock: unknown): string {
  return nestedString(yogaBlock, 'Name') || nestedString(yogaBlock, 'name') || '—';
}

export function extractPanchangaResult(json: Record<string, unknown>): {
  table: Record<string, unknown>;
  moonSign: string;
} | null {
  const data = json.data;
  if (!data || typeof data !== 'object') return null;
  const root = data as Record<string, unknown>;
  const inner = root.payload;
  if (!inner || typeof inner !== 'object') return null;
  const p = inner as Record<string, unknown>;
  const tableRaw = p.table;
  const table =
    tableRaw && typeof tableRaw === 'object' ? (tableRaw as Record<string, unknown>) : {};
  const moonRaw = p.moonSign;
  const moonSign = typeof moonRaw === 'string' ? moonRaw : '';
  return { table, moonSign };
}

export function buildPanchangaTitleLine(table: Record<string, unknown>): string {
  const lm = nestedString(table, 'LunarMonth');
  const tithi = table.Tithi as Record<string, unknown> | undefined;
  const tName = nestedString(tithi, 'Name') || nestedString(tithi, 'name') || '';
  const tPak = nestedString(tithi, 'Paksha') || nestedString(tithi, 'paksha') || '';

  let tithiPhrase = '';
  if (tPak && tName) tithiPhrase = `${tPak} ${tName}`;
  else tithiPhrase = tName || tPak;

  const parts = [lm, tithiPhrase].filter(Boolean);
  return parts.length ? parts.join(', ') : 'Panchangam';
}

export function getCandidateBackendBases(): string[] {
  const candidates: string[] = [];
  const configured = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  if (configured) {
    candidates.push(configured.endsWith('/') ? configured : `${configured}/`);
  } else {
    candidates.push('http://localhost:5000/');
  }
  candidates.push('http://localhost:5000/');
  return Array.from(new Set(candidates));
}
