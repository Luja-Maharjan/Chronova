import { SITE_NAME, SITE_DESCRIPTION, getSiteUrl } from '../config/seo';
import { getAbsoluteUrl, getImageUrl, getProductUrl, getCategoryUrl } from './seo';

export const getOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: getSiteUrl(),
  logo: getAbsoluteUrl('/favicon.svg'),
  description: SITE_DESCRIPTION,
  sameAs: [],
});

export const getWebsiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: getSiteUrl(),
  description: SITE_DESCRIPTION,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${getSiteUrl()}/shop?search={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
});

export const getBreadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: getAbsoluteUrl(item.path),
  })),
});

export const getProductSchema = (product) => {
  const price = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || product.description,
    image: getImageUrl(product.image),
    sku: product._id,
    brand: {
      '@type': 'Brand',
      name: product.brand || SITE_NAME,
    },
    category: product.category?.name,
    offers: {
      '@type': 'Offer',
      url: getAbsoluteUrl(getProductUrl(product)),
      priceCurrency: 'NPR',
      price: price.toFixed(2),
      availability:
        product.countInStock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
  };
};

export const getCategorySchema = (category) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: category.name,
  description: category.description || category.metaDescription,
  url: getAbsoluteUrl(getCategoryUrl(category)),
});
