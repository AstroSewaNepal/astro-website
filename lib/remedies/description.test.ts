import { describe, expect, it } from 'vitest';

import { descriptionHtml, descriptionText, safeHref, tiptapToHtml } from './description';

describe('descriptionHtml', () => {
  it('passes the app editor HTML through (the page sanitizes it)', () => {
    expect(descriptionHtml({ html: '<p>Hi</p>' })).toBe('<p>Hi</p>');
    expect(descriptionHtml('<b>x</b>')).toBe('<b>x</b>');
    expect(descriptionHtml(null)).toBe('');
    expect(descriptionHtml(42)).toBe('');
  });

  it('unwraps the old editor HTML stored in a TipTap text node', () => {
    const old = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: '<p>Old</p>' }] }],
    };
    expect(descriptionHtml(old)).toBe('<p>Old</p>');
  });

  it('turns TipTap JSON into escaped HTML', () => {
    const doc = {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 9 }, content: [{ type: 'text', text: 'Title' }] },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'a <script>', marks: [{ type: 'bold' }] },
            {
              type: 'text',
              text: 'link',
              marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }],
            },
            {
              type: 'text',
              text: 'ok',
              marks: [{ type: 'link', attrs: { href: 'https://x.y/"z' } }],
            },
          ],
        },
        { type: 'paragraph' },
      ],
    };
    expect(descriptionHtml(doc)).toBe(
      '<h2>Title</h2><p><strong>a &lt;script&gt;</strong>link<a href="https://x.y/&quot;z">ok</a></p><p><br></p>',
    );
  });

  it('handles lists and unknown nodes', () => {
    expect(
      tiptapToHtml({
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [{ type: 'mystery', content: [{ type: 'text', text: 'x' }] }],
          },
        ],
      }),
    ).toBe('<ul><li>x</li></ul>');
  });
});

describe('safeHref', () => {
  it('keeps web and mail links only', () => {
    expect(safeHref('https://a.b')).toBe('https://a.b');
    expect(safeHref('mailto:a@b.c')).toBe('mailto:a@b.c');
    expect(safeHref(' JavaScript:alert(1)')).toBeNull();
    expect(safeHref('data:text/html,x')).toBeNull();
    expect(safeHref(3)).toBeNull();
  });
});

describe('descriptionText', () => {
  it('strips tags, decodes entities and shortens', () => {
    expect(descriptionText({ html: '<p>Hello&nbsp;<b>world</b></p><p>Two &amp; three</p>' })).toBe(
      'Hello world Two & three',
    );
    expect(descriptionText('<p>abcdefghij</p>', 5)).toBe('abcd…');
  });
});
