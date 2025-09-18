import { Product } from '../types/shop';

/**
 * Translates product name using i18n
 * Falls back to original name if translation not found
 */
export const translateProductName = (productName: string, t: (key: string) => string): string => {
  const translationKey = `productNames.${productName}`;
  const translated = t(translationKey);
  
  // If translation exists and is different from the key, use it
  if (translated !== translationKey) {
    return translated;
  }
  
  // Fallback to original name
  return productName;
};

/**
 * Translates product description using i18n
 * Falls back to original description if translation not found
 */
export const translateProductDescription = (productDescription: string | undefined, t: (key: string) => string): string | undefined => {
  if (!productDescription) return productDescription;
  
  const translationKey = `productDescriptions.${productDescription}`;
  const translated = t(translationKey);
  
  // If translation exists and is different from the key, use it
  if (translated !== translationKey) {
    return translated;
  }
  
  // Fallback to original description
  return productDescription;
};

/**
 * Translates a complete product object
 * Returns a new product with translated name and description
 */
export const translateProduct = (product: Product, t: (key: string) => string): Product => {
  return {
    ...product,
    name: translateProductName(product.name, t),
    description: translateProductDescription(product.description, t)
  };
};

/**
 * Translates an array of products
 */
export const translateProducts = (products: Product[], t: (key: string) => string): Product[] => {
  return products.map(product => translateProduct(product, t));
};
