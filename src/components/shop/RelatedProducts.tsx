import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  images: { image_url: string; is_primary: boolean }[];
}

interface RelatedProductsProps {
  categoryId: string;
  currentProductId: string;
  onAddToCart: (product: { id: string; name: string; price: number; image: string }) => void;
}

export function RelatedProducts({ categoryId, currentProductId, onAddToCart }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelated();
  }, [categoryId, currentProductId]);

  const fetchRelated = async () => {
    const { data } = await supabase
      .from('sharee_products')
      .select(`
        id, name, slug, price, sale_price,
        images:sharee_product_images(image_url, is_primary)
      `)
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .neq('id', currentProductId)
      .limit(4);

    if (data) {
      setProducts(data as unknown as Product[]);
    }
    setLoading(false);
  };

  if (loading || products.length === 0) return null;

  return (
    <section className="mt-16 pt-8 border-t">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-light">You May Also Like</h2>
        <Link to="/shop" className="text-sm text-primary hover:underline flex items-center gap-1">
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => {
          const primaryImage = product.images?.find(img => img.is_primary)?.image_url || 
                              product.images?.[0]?.image_url || 'https://placehold.co/400x500';
          const displayPrice = product.sale_price || product.price;
          const isOnSale = product.sale_price && product.sale_price < product.price;

          return (
            <div key={product.id} className="group">
              <Link to={`/product/${product.slug}`} className="block">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-muted mb-3">
                  <img
                    src={primaryImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {isOnSale && (
                    <Badge className="absolute top-2 left-2 bg-destructive text-xs">
                      Sale
                    </Badge>
                  )}
                </div>
                <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
              </Link>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-primary">৳{displayPrice.toLocaleString()}</span>
                  {isOnSale && (
                    <span className="text-xs text-muted-foreground line-through">
                      ৳{product.price.toLocaleString()}
                    </span>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => onAddToCart({
                    id: product.id,
                    name: product.name,
                    price: displayPrice,
                    image: primaryImage,
                  })}
                >
                  <ShoppingCart className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
