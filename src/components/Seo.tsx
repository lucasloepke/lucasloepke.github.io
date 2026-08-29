const SITE_URL = "https://lucasloepke.github.io";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

interface SeoProps {
  title: string;
  description: string;
  /** Path beginning with "/" — used for canonical + og:url. */
  path: string;
  image?: string;
}

/**
 * Per-route document metadata. React 19 hoists <title>/<meta>/<link>
 * rendered here into <head>, keeping tags in sync as the SPA navigates.
 */
export function Seo({ title, description, path, image = DEFAULT_OG_IMAGE }: SeoProps) {
  const url = `${SITE_URL}${path}`;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Lucas Loepke" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </>
  );
}
