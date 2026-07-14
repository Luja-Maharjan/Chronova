export const SITE_NAME = 'Chronova';
export const SITE_TAGLINE = 'Premium Watches & Timepieces';
export const SITE_DESCRIPTION =
  'Shop premium watches at Chronova. Discover luxury timepieces, smart watches, and classic designs with fast delivery across Nepal.';
export const SITE_KEYWORDS =
  'Chronova, watches, luxury watches, smart watches, mens watches, womens watches, buy watches Nepal, timepieces';
export const SITE_LOCALE = 'en_US';
export const SITE_TWITTER_HANDLE = '@chronova';

export const getSiteUrl = () =>
  import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://chronova.com');

export const DEFAULT_OG_IMAGE = `${getSiteUrl()}/og-default.jpg`;

export const truncate = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength - 3).trim()}...`;
};
