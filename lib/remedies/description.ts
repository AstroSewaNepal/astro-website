// A remedy's description comes in three shapes (ap RemedyDetailScreen getDescriptionHtml):
// - `{ html }` or a plain string: HTML from the app's editor;
// - a TipTap-shaped doc whose first text node holds raw HTML (old app editor);
// - real TipTap JSON (admin and web editors).
// This only turns it into HTML. Astrologers write it, so the page must sanitize the result before showing it
// (components/remedies/remedy-description.tsx runs DOMPurify).

type Mark = { type?: string; attrs?: Record<string, unknown> };
type Node = {
  type?: string;
  text?: string;
  content?: Node[];
  marks?: Mark[];
  attrs?: Record<string, unknown>;
};

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Only web links survive (no javascript:, data: ...). */
export function safeHref(href: unknown): string | null {
  if (typeof href !== 'string') return null;
  const trimmed = href.trim();
  return /^(https?:\/\/|mailto:)/i.test(trimmed) ? trimmed : null;
}

function markText(text: string, marks: Mark[] | undefined): string {
  let out = escapeHtml(text);
  for (const mark of marks ?? []) {
    switch (mark.type) {
      case 'bold':
        out = `<strong>${out}</strong>`;
        break;
      case 'italic':
        out = `<em>${out}</em>`;
        break;
      case 'underline':
        out = `<u>${out}</u>`;
        break;
      case 'strike':
        out = `<s>${out}</s>`;
        break;
      case 'code':
        out = `<code>${out}</code>`;
        break;
      case 'link': {
        const href = safeHref(mark.attrs?.href);
        if (href) out = `<a href="${escapeHtml(href)}">${out}</a>`;
        break;
      }
    }
  }
  return out;
}

export function tiptapToHtml(node: unknown): string {
  if (!node || typeof node !== 'object') return '';
  const n = node as Node;
  if (n.type === 'text') return markText(typeof n.text === 'string' ? n.text : '', n.marks);
  const children = (Array.isArray(n.content) ? n.content : []).map(tiptapToHtml).join('');
  switch (n.type) {
    case 'doc':
      return children;
    case 'paragraph':
      return `<p>${children || '<br>'}</p>`;
    case 'heading': {
      const level = Number(n.attrs?.level);
      const h = level >= 1 && level <= 6 ? level : 2;
      return `<h${h}>${children}</h${h}>`;
    }
    case 'hardBreak':
      return '<br>';
    case 'bulletList':
      return `<ul>${children}</ul>`;
    case 'orderedList':
      return `<ol>${children}</ol>`;
    case 'listItem':
      return `<li>${children}</li>`;
    case 'blockquote':
      return `<blockquote>${children}</blockquote>`;
    case 'codeBlock':
      return `<pre><code>${children}</code></pre>`;
    case 'horizontalRule':
      return '<hr>';
    default:
      return children;
  }
}

/** Unsanitized HTML for a description, or '' when there is none. */
export function descriptionHtml(desc: unknown): string {
  if (!desc) return '';
  if (typeof desc === 'string') return desc;
  if (typeof desc !== 'object') return '';
  const d = desc as Record<string, unknown> & Node;
  if (typeof d.html === 'string') return d.html;
  if (d.type === 'doc' || d.type === 'paragraph') {
    const first = d.content?.[0];
    const firstText = first?.content?.[0]?.text ?? first?.text;
    if (typeof firstText === 'string' && /^<[a-z]/i.test(firstText.trim())) return firstText;
  }
  return tiptapToHtml(d);
}

/** Plain text of a description (page meta description, share text). */
export function descriptionText(desc: unknown, max = 160): string {
  const text = descriptionHtml(desc)
    .replace(/<(br|\/p|\/li|\/h\d)\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}
