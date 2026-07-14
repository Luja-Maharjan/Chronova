import { getSiteUrl } from '../config/seo';

export const getProductUrl = (product) => {
  const slug = product?.slug || product?._id;
  return `/product/${slug}`;
};

export const getCategoryUrl = (category) => {
  const slug = category?.slug || category?._id;
  return `/category/${slug}`;
};

export const getAbsoluteUrl = (path) => {
  const base = getSiteUrl().replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return getAbsoluteUrl('/og-default.jpg');
  if (imagePath.startsWith('http')) return imagePath;
  return getAbsoluteUrl(imagePath);
};

export const isObjectId = (value) => /^[a-f\d]{24}$/i.test(value);
