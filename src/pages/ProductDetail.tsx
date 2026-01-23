import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CartDrawer } from '@/components/shop/CartDrawer';
import { ProductReviews } from '@/components/shop/ProductReviews';
import { RelatedProducts } from '@/components/shop/RelatedProducts';
import { 
  ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, 
  ChevronLeft, ChevronRight, Minus, Plus, Star, Check, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  stock_quantity: number;
  fabric_type: string | null;
  color: string | null;
  dimensions: string | null;
  care_instructions: string | null;
  is_featured: boolean | null;
  category_id: string | null;
  category: { id: string; name: string; slug: string } | null;
  images: { image_url: string; is_primary: boolean; display_order: number }[];
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, cartItems, cartOpen, setCartOpen, updateQuantity, removeFromCart } = useCart();

  useEffect(() => {
    if (slug) fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sharee_products')
      .select(`
        *,
        category:sharee_categories(id, name, slug),
        images:sharee_product_images(image_url, is_primary, display_order)
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      navigate('/shop');
      return;
    }

    // Sort images by display_order
    const sortedImages = data.images?.sort((a: any, b: any) => a.display_order - b.display_order) || [];
    setProduct({ ...data, images: sortedImages } as unknown as Product);
    setLoading(false);
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const primaryImage = product.images?.find(img => img.is_primary)?.image_url || 
                        product.images?.[0]?.image_url || '';
    
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.sale_price || product.price,
        image: primaryImage,
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product?.name,
        text: product?.description || '',
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) return null;

  const displayPrice = product.sale_price || product.price;
  const isOnSale = product.sale_price && product.sale_price < product.price;
  const isOutOfStock = product.stock_quantity <= 0;
  const images = product.images?.length > 0 ? product.images : [{ image_url: 'https://placehold.co/600x800', is_primary: true, display_order: 0 }];

  return (
    <>
      <SEOHead 
        title={product.name}
        description={product.description || `Shop ${product.name} - Beautiful Sharee from our collection`}
      />

      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
            {product.category && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="hover:text-foreground transition-colors">{product.category.name}</span>
              </>
            )}
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Main Image */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    src={images[selectedImage]?.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </AnimatePresence>

                {isOnSale && (
                  <Badge className="absolute top-4 left-4 bg-destructive">
                    {Math.round((1 - product.sale_price! / product.price) * 100)}% OFF
                  </Badge>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage((prev) => (prev - 1 + images.length) % images.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSelectedImage((prev) => (prev + 1) % images.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative flex-shrink-0 w-20 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index ? 'border-primary' : 'border-transparent hover:border-muted-foreground/30'
                      }`}
                    >
                      <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Category */}
              {product.category && (
                <Badge variant="secondary">{product.category.name}</Badge>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-light tracking-tight">{product.name}</h1>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-semibold text-primary">
                  ৳{displayPrice.toLocaleString()}
                </span>
                {isOnSale && (
                  <span className="text-xl text-muted-foreground line-through">
                    ৳{product.price.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {isOutOfStock ? (
                  <Badge variant="destructive">Out of Stock</Badge>
                ) : product.stock_quantity <= 5 ? (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    Only {product.stock_quantity} left
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Check className="w-3 h-3 mr-1" /> In Stock
                  </Badge>
                )}
              </div>

              <Separator />

              {/* Description */}
              {product.description && (
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              )}

              {/* Specifications */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {product.fabric_type && (
                  <div>
                    <span className="text-muted-foreground">Fabric:</span>
                    <span className="ml-2 font-medium">{product.fabric_type}</span>
                  </div>
                )}
                {product.color && (
                  <div>
                    <span className="text-muted-foreground">Color:</span>
                    <span className="ml-2 font-medium">{product.color}</span>
                  </div>
                )}
                {product.dimensions && (
                  <div>
                    <span className="text-muted-foreground">Size:</span>
                    <span className="ml-2 font-medium">{product.dimensions}</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Quantity & Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Quantity:</span>
                  <div className="flex items-center gap-2 border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-muted transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      className="p-2 hover:bg-muted transition-colors"
                      disabled={quantity >= product.stock_quantity}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    size="lg"
                    className="flex-1"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                  <Button size="lg" variant="outline">
                    <Heart className="w-5 h-5" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={handleShare}>
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Truck className="w-5 h-5 text-primary" />
                  <div className="text-sm">
                    <p className="font-medium">Free Delivery</p>
                    <p className="text-muted-foreground text-xs">On orders over ৳5,000</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <RotateCcw className="w-5 h-5 text-primary" />
                  <div className="text-sm">
                    <p className="font-medium">Easy Returns</p>
                    <p className="text-muted-foreground text-xs">7-day return policy</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Shield className="w-5 h-5 text-primary" />
                  <div className="text-sm">
                    <p className="font-medium">Secure Payment</p>
                    <p className="text-muted-foreground text-xs">100% secure checkout</p>
                  </div>
                </div>
              </div>

              {/* Care Instructions */}
              {product.care_instructions && (
                <div className="p-4 rounded-lg bg-muted/30 border">
                  <h3 className="font-medium mb-2">Care Instructions</h3>
                  <p className="text-sm text-muted-foreground">{product.care_instructions}</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Reviews Section */}
          <ProductReviews productId={product.id} />

          {/* Related Products */}
          {product.category_id && (
            <RelatedProducts 
              categoryId={product.category_id} 
              currentProductId={product.id}
              onAddToCart={(p) => addToCart({ id: p.id, name: p.name, price: p.price, image: p.image })}
            />
          )}
        </div>

        <CartDrawer
          open={cartOpen}
          onOpenChange={setCartOpen}
          items={cartItems}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
        />
      </div>
    </>
  );
}
