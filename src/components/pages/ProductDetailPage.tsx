'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingBag, Minus, Plus, Truck, Shield, RotateCcw, Check } from 'lucide-react';
import BreadcrumbNav from '@/components/shared/BreadcrumbNav';
import { formatPrice } from '@/data';
import { useNavigationStore } from '@/lib/store';
import { useFavorites } from '@/hooks/useFavorites';
import { useCart } from '@/hooks/useCart';
import { transformApiProduct } from '@/lib/transformApiProduct';
import ProductCard from '@/components/home/ProductCard';
import type { Product } from '@/types';
import type { SiteData } from '@/types/siteData';

interface ProductDetailPageProps {
  siteData: SiteData;
}

export default function ProductDetailPage({ siteData }: ProductDetailPageProps) {
  const { selectedProductId, navigateTo } = useNavigationStore();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addItem } = useCart();
  const product = selectedProductId
    ? transformApiProduct(siteData.products.find((p) => p.id === selectedProductId)!, siteData.categories)
    : undefined;

  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  if (!product) {
    return (
      <main className="pt-24 md:pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <p className="text-xl text-muted-foreground">محصول مورد نظر یافت نشد</p>
          <button
            onClick={() => { navigateTo('products'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="mt-4 text-gold hover:underline"
          >
            بازگشت به محصولات
          </button>
        </div>
      </main>
    );
  }

  const apiProduct = siteData.products.find((p) => p.id === selectedProductId);
  const relatedProducts = siteData.products
    .filter((p) => p.active && p.categoryId === apiProduct?.categoryId && p.id !== product.id)
    .slice(0, 4)
    .map((p) => transformApiProduct(p, siteData.categories));

  const handleAddToCart = () => {
    if (!product) return;
    addItem(
      {
        productId: product.id,
        productCode: product.productCode,
        name: product.name,
        image: product.image,
        price: product.price,
        // Capture the selected variant so it appears in the admin order details
        color: product.colors[selectedColor]?.name || '',
        size: selectedSize || '',
      },
      quantity
    );
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleProductClick = (p: Product) => {
    navigateTo('product-detail', p.id);
    setSelectedColor(0);
    setSelectedSize(null);
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="pt-24 md:pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[{ label: product.category, slug: 'products' }]}
          currentPage={product.name}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-16"
        >
          {/* Product Image */}
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.discount && (
              <span className="absolute top-4 right-4 bg-red-500 text-white text-sm font-medium px-4 py-1.5 rounded-full">
                {product.discount}٪ تخفیف
              </span>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            <p className="text-sm text-gold font-medium mb-2">{product.category}</p>
            <h1 className="text-2xl md:text-3xl font-bold text-charcoal mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className={i < Math.floor(product.rating) ? 'text-gold fill-gold' : 'text-gray-300'} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({product.reviewCount} نظر)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-bold text-charcoal">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-base text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-7 mb-6">{product.description}</p>

            {/* Colors */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-charcoal mb-3">رنگ: {product.colors[selectedColor]?.name}</p>
              <div className="flex items-center gap-3">
                {product.colors.map((color, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedColor(i)}
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                      selectedColor === i ? 'border-gold scale-110 ring-2 ring-gold/30' : 'border-gray-200 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    aria-label={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-charcoal mb-3">سایز</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-xl text-sm font-medium transition-all duration-200 ${
                      selectedSize === size
                        ? 'bg-charcoal text-white'
                        : 'bg-muted text-charcoal hover:bg-charcoal/10'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <p className="text-sm font-semibold text-charcoal mb-3">تعداد</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-charcoal/10 transition-colors"
                  aria-label="کاهش تعداد"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center text-base font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-charcoal/10 transition-colors"
                  aria-label="افزایش تعداد"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-gold hover:bg-gold-dark text-white py-3.5 rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-gold/20 flex items-center justify-center gap-2"
              >
                {addedToCart ? (
                  <><Check size={18} />افزوده شد</>
                ) : (
                  <><ShoppingBag size={18} />افزودن به سبد خرید</>
                )}
              </button>
              <button
                onClick={() => toggleFavorite(product.id)}
                className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-300 ${
                  isFavorite(product.id)
                    ? 'bg-rose border-rose text-white'
                    : 'border-border hover:bg-rose-light hover:border-rose'
                }`}
                aria-label={isFavorite(product.id) ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
                aria-pressed={isFavorite(product.id)}
              >
                <Heart size={20} className={isFavorite(product.id) ? 'fill-current' : 'text-rose'} />
              </button>
            </div>

            {/* Per-product perks (toggled per product in the admin panel) */}
            {(product.freeShipping || product.returnGuarantee) && (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-8">
                {product.freeShipping && (
                  <div className="flex items-center gap-2 text-sm text-charcoal">
                    <Truck size={18} className="text-gold" />
                    <span>ارسال رایگان</span>
                  </div>
                )}
                {product.returnGuarantee && (
                  <div className="flex items-center gap-2 text-sm text-charcoal">
                    <RotateCcw size={18} className="text-gold" />
                    <span>۷ روز ضمانت بازگشت</span>
                  </div>
                )}
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="text-center">
                <Truck size={20} className="text-gold mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">ارسال رایگان</p>
              </div>
              <div className="text-center">
                <Shield size={20} className="text-gold mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">ضمانت اصالت</p>
              </div>
              <div className="text-center">
                <RotateCcw size={20} className="text-gold mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">۷ روز مرجوعی</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-charcoal mb-8">محصولات مرتبط</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} onNavigate={handleProductClick} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}