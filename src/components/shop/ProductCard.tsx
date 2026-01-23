import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    sale_price: number | null;
    stock_quantity: number;
    fabric_type: string | null;
    color: string | null;
    is_featured: boolean | null;
    category: {
      name: string;
      slug: string;
    } | null;
    images: {
      image_url: string;
      is_primary: boolean;
    }[];
  };
  onAddToCart: (product: { id: string; name: string; price: number; image: string }) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
  const displayPrice = product.sale_price || product.price;
  const isOnSale = product.sale_price && product.sale_price < product.price;
  const isOutOfStock = product.stock_quantity <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart({
      id: product.id,
      name: product.name,
      price: displayPrice,
      image: primaryImage?.image_url || '/placeholder.svg'
    });
  };

  return (
    <motion.div
      className="group relative bg-card rounded-xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300"
      whileHover={{ y: -4 }}
    >
      <Link to={`/product/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          {primaryImage ? (
            <img
              src={primaryImage.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isOnSale && (
              <Badge className="bg-destructive text-destructive-foreground">
                {Math.round((1 - product.sale_price! / product.price) * 100)}% Off
              </Badge>
            )}
            {product.is_featured && (
              <Badge className="bg-primary text-primary-foreground">
                Featured
              </Badge>
            )}
            {isOutOfStock && (
              <Badge variant="secondary">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              size="icon" 
              variant="secondary" 
              className="rounded-full"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              <Heart className="w-4 h-4" />
            </Button>
          </div>

          {/* Add to Cart Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full"
              size="sm"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-2">
          {/* Category */}
          {product.category && (
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {product.category.name}
            </p>
          )}

          {/* Name */}
          <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Fabric & Color */}
          {(product.fabric_type || product.color) && (
            <p className="text-sm text-muted-foreground">
              {[product.fabric_type, product.color].filter(Boolean).join(' • ')}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-primary">
              ৳{displayPrice.toLocaleString()}
            </span>
            {isOnSale && (
              <span className="text-sm text-muted-foreground line-through">
                ৳{product.price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
