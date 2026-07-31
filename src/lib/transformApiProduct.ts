import type { Product, ProductColor } from '@/types';
import type { SiteData } from '@/types/siteData';
import { resolveProductCode } from '@/hooks/useProductCodes';

/**
 * Convert a raw API product (with base price + discount %) into the frontend
 * Product shape expected by product cards / detail page.
 *
 * Pricing model:
 *   - Admin stores `price` = base price (before discount)
 *   - Admin stores `discount` = percentage off (e.g. 20 means 20% off)
 *   - We compute the discounted (final) price the customer pays here so the
 *     rest of the UI does not need to know about the calculation.
 */
export function transformApiProduct(p: SiteData['products'][0], categories: SiteData['categories']): Product {
  // Parse colors JSON (array of { name, hex })
  let parsedColors: ProductColor[] = [];
  try {
    parsedColors = JSON.parse(p.colors || '[]');
  } catch {
    parsedColors = [];
  }

  // Parse additional images JSON (array of URL strings)
  let parsedImages: string[] = [];
  try {
    parsedImages = JSON.parse(p.images || '[]');
  } catch {
    parsedImages = [];
  }

  // Parse sizes JSON (array of strings)
  let parsedSizes: string[] = [];
  try {
    parsedSizes = JSON.parse(p.sizes || '[]');
  } catch {
    parsedSizes = [];
  }

  const cat = categories.find((c) => c.id === p.categoryId);

  // Base price is what admin entered; compute final price after discount
  const basePrice = p.price || 0;
  const discount = p.discount || 0;
  const hasDiscount = discount > 0;
  // Discounted (final) price the customer pays
  const finalPrice = hasDiscount ? Math.round(basePrice * (1 - discount / 100)) : basePrice;

  return {
    id: p.id,
    name: p.name,
    // productCode replaces the old slug; resolved from the localStorage overlay
    // (admin-managed), falling back to the legacy slug or id when unset.
    productCode: resolveProductCode(p.id, (p as { slug?: string }).slug),
    // `price` is the final price shown as the main price
    price: finalPrice,
    // `originalPrice` (strikethrough) is the base price when a discount applies
    originalPrice: hasDiscount ? basePrice : undefined,
    discount: hasDiscount ? discount : undefined,
    image: p.imageUrl,
    images: parsedImages.length > 0 ? parsedImages : [p.imageUrl],
    category: p.category?.name || '',
    categorySlug: cat?.slug || '',
    description: p.description,
    sizes: parsedSizes,
    colors: parsedColors,
    isNew: p.isNew || undefined,
    isBestseller: p.isBestseller || undefined,
    // Per-product purchase perks (shown under Add to Cart on the storefront)
    freeShipping: p.freeShipping || undefined,
    returnGuarantee: p.returnGuarantee || undefined,
    rating: p.rating,
    reviewCount: p.reviewCount,
  };
}
