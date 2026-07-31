'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Heart, ShoppingBag, Star, Truck, RotateCcw } from 'lucide-react';
import { formatPrice } from '@/data';
import { useFavorites } from '@/hooks/useFavorites';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onNavigate: (product: Product) => void;
  index?: number;
}

export default function ProductCard({ product, onNavigate, index = 0 }: ProductCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addItem } = useCart();
  const { toast } = useToast();
  const favorited = isFavorite(product.id);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      productCode: product.productCode,
      name: product.name,
      image: product.image,
      price: product.price,
    });
    toast({ title: 'به سبد خرید اضافه شد 🛍️', description: product.name });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group cursor-pointer"
    >
      {/* Image Container */}
      <div
        className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted mb-4"
        onClick={() => onNavigate(product)}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {product.isNew && (
            <span className="bg-gold text-white text-xs font-medium px-3 py-1 rounded-full">جدید</span>
          )}
          {product.discount && (
            <span className="bg-red-500 text-white text-xs font-medium px-3 py-1 rounded-full">
              {product.discount}٪ تخفیف
            </span>
          )}
          {product.isBestseller && !product.isNew && (
            <span className="bg-charcoal text-white text-xs font-medium px-3 py-1 rounded-full">پرفروش</span>
          )}
        </div>

        {/* Always-visible favorite (heart) toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
          className={`absolute top-3 left-3 z-10 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors duration-300 ${
            favorited ? 'bg-gold text-white' : 'bg-white/85 text-charcoal hover:bg-gold hover:text-white'
          }`}
          aria-label={favorited ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
          aria-pressed={favorited}
        >
          <Heart size={16} className={favorited ? 'fill-current' : ''} />
        </button>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />

        {/* Action Buttons */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
          <button
            onClick={(e) => { e.stopPropagation(); handleAddToCart(); }}
            className="flex-1 bg-white text-charcoal py-2.5 rounded-xl text-sm font-medium hover:bg-gold hover:text-white transition-colors duration-300 flex items-center justify-center gap-2"
          >
            <ShoppingBag size={16} />
            افزودن به سبد
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${
              favorited ? 'bg-gold text-white' : 'bg-white text-charcoal hover:bg-gold hover:text-white'
            }`}
            aria-label={favorited ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
            aria-pressed={favorited}
          >
            <Heart size={16} className={favorited ? 'fill-current' : ''} />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div onClick={() => onNavigate(product)}>
        <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
        <h3 className="text-sm md:text-base font-semibold text-charcoal mb-2 line-clamp-1 group-hover:text-gold transition-colors duration-300">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 mb-2">
          <Star size={12} className="text-gold fill-gold" />
          <span className="text-xs text-muted-foreground">{product.rating} ({product.reviewCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-charcoal">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        {/* Per-product perks (toggled per product in the admin panel) */}
        {(product.freeShipping || product.returnGuarantee) && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
            {product.freeShipping && (
              <span className="flex items-center gap-1 text-[11px] text-gold">
                <Truck size={12} />
                ارسال رایگان
              </span>
            )}
            {product.returnGuarantee && (
              <span className="flex items-center gap-1 text-[11px] text-gold">
                <RotateCcw size={12} />
                ۷ روز ضمانت بازگشت
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}