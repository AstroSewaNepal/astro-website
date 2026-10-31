// Ghost makes resized WebP copies of its images (once, kept on its disk), but only at the widths the blog
// theme defines. Other widths redirect to the full-size original.
export type GhostImageWidth = 600 | 960 | 1000 | 1200 | 1600 | 2000;

export function ghostImageUrl(url: string, width: GhostImageWidth): string {
  if (
    !url.includes('/content/images/') ||
    url.includes('/content/images/size/') ||
    /\.(svg|gif)(\?|$)/i.test(url)
  ) {
    return url;
  }
  return url.replace('/content/images/', `/content/images/size/w${width}/format/webp/`);
}
