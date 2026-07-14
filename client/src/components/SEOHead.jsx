import { Helmet } from 'react-helmet-async';
import { SITE_NAME, SITE_LOCALE, SITE_TWITTER_HANDLE, truncate } from '../config/seo';
import { getAbsoluteUrl } from '../utils/seo';

export default function SEOHead({
  title,
  description,
  keywords,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  ogUrl,
  twitterTitle,
  twitterDescription,
  twitterImage,
  noindex = false,
}) {
  const pageTitle = title ? `${truncate(title, 57)} | ${SITE_NAME}` : SITE_NAME;
  const metaDescription = truncate(description || '', 160);
  const canonicalUrl = canonical ? getAbsoluteUrl(canonical) : undefined;
  const resolvedOgTitle = ogTitle || pageTitle;
  const resolvedOgDescription = ogDescription || metaDescription;
  const resolvedOgImage = ogImage || getAbsoluteUrl('/og-default.jpg');
  const resolvedOgUrl = ogUrl || canonicalUrl || getAbsoluteUrl('/');
  const resolvedTwitterTitle = twitterTitle || resolvedOgTitle;
  const resolvedTwitterDescription = twitterDescription || resolvedOgDescription;
  const resolvedTwitterImage = twitterImage || resolvedOgImage;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      {metaDescription && <meta name="description" content={metaDescription} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={SITE_LOCALE} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={resolvedOgTitle} />
      {resolvedOgDescription && <meta property="og:description" content={resolvedOgDescription} />}
      <meta property="og:url" content={resolvedOgUrl} />
      <meta property="og:image" content={resolvedOgImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SITE_TWITTER_HANDLE} />
      <meta name="twitter:title" content={resolvedTwitterTitle} />
      {resolvedTwitterDescription && (
        <meta name="twitter:description" content={resolvedTwitterDescription} />
      )}
      <meta name="twitter:image" content={resolvedTwitterImage} />
    </Helmet>
  );
}
